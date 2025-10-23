const db = require('../db');

const TABLES = [
  { name: 'cpu', idColumn: 'CPU_ID', table: 'cpu' },
  { name: 'gpu', idColumn: 'GPU_ID', table: 'gpu' },
  { name: 'mainboard', idColumn: 'mainboard_ID', table: 'mainboard' },
  { name: 'ram', idColumn: 'RAM_ID', table: 'ram' },
  { name: 'ssd', idColumn: 'SSD_ID', table: 'ssd' },
  { name: 'harddisk', idColumn: 'Harddisk_ID', table: 'harddisk' },
  { name: 'cooler', idColumn: 'Cooler_ID', table: 'cooler' },
  { name: 'power', idColumn: 'Power_ID', table: 'power' },
  { name: 'pc_case', idColumn: 'Case_ID', table: 'pc_case' }
];

async function checkOrphanedRecords() {
  console.log('🔍 กำลังตรวจสอบ orphaned records...\n');
  
  const results = [];
  
  for (const tableInfo of TABLES) {
    try {
      const [orphaned] = await db.query(`
        SELECT t.Device_ID, t.${tableInfo.idColumn}
        FROM ${tableInfo.table} t
        LEFT JOIN device d ON t.Device_ID = d.Device_ID
        WHERE d.Device_ID IS NULL
      `);
      
      if (orphaned.length > 0) {
        results.push({
          table: tableInfo.name,
          count: orphaned.length,
          records: orphaned
        });
        
        console.log(`❌ ตาราง ${tableInfo.name.toUpperCase()}: พบ ${orphaned.length} orphaned records`);
        orphaned.forEach(record => {
          console.log(`   - ${tableInfo.idColumn}: ${record[tableInfo.idColumn]}, Device_ID: ${record.Device_ID}`);
        });
      } else {
        console.log(`✅ ตาราง ${tableInfo.name.toUpperCase()}: ไม่พบ orphaned records`);
      }
    } catch (err) {
      console.error(`⚠️  ตรวจสอบตาราง ${tableInfo.name} ไม่สำเร็จ:`, err.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  return results;
}

async function fixOrphanedRecords(orphanedResults, mode = 'delete') {
  console.log(`\n🔧 กำลังแก้ไข orphaned records (โหมด: ${mode})...\n`);
  
  let totalFixed = 0;
  
  for (const result of orphanedResults) {
    const tableInfo = TABLES.find(t => t.name === result.table);
    if (!tableInfo) continue;
    
    console.log(`\nแก้ไขตาราง ${result.table.toUpperCase()}...`);
    
    if (mode === 'delete') {
      // ลบ orphaned records
      for (const record of result.records) {
        try {
          await db.query(`
            DELETE FROM ${tableInfo.table} 
            WHERE ${tableInfo.idColumn} = ?
          `, [record[tableInfo.idColumn]]);
          
          console.log(`  ✓ ลบ ${tableInfo.idColumn}: ${record[tableInfo.idColumn]} (Device_ID: ${record.Device_ID})`);
          totalFixed++;
        } catch (err) {
          console.error(`  ✗ ลบไม่สำเร็จ ${tableInfo.idColumn}: ${record[tableInfo.idColumn]} - ${err.message}`);
        }
      }
    } else if (mode === 'create') {
      // สร้าง device records ที่ขาดหาย
      for (const record of result.records) {
        try {
          // ตรวจสอบว่า Device_ID มีค่าหรือไม่
          if (!record.Device_ID) {
            console.log(`  ⚠ ข้าม ${tableInfo.idColumn}: ${record[tableInfo.idColumn]} (ไม่มี Device_ID)`);
            continue;
          }
          
          // สร้าง placeholder device record
          await db.query(`
            INSERT INTO device (Device_ID, Device_Name, price, image_url)
            VALUES (?, ?, ?, ?)
          `, [
            record.Device_ID,
            `[Recovered] ${result.table.toUpperCase()} ID: ${record[tableInfo.idColumn]}`,
            0,
            null
          ]);
          
          console.log(`  ✓ สร้าง device record: Device_ID: ${record.Device_ID}`);
          totalFixed++;
        } catch (err) {
          console.error(`  ✗ สร้างไม่สำเร็จ Device_ID: ${record.Device_ID} - ${err.message}`);
        }
      }
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ แก้ไขเสร็จสิ้น: ${totalFixed} records`);
  
  return totalFixed;
}

async function checkMissingDeviceIDs() {
  console.log('\n🔍 ตรวจสอบ records ที่ Device_ID เป็น NULL...\n');
  
  let foundNulls = false;
  
  for (const tableInfo of TABLES) {
    try {
      const [nullRecords] = await db.query(`
        SELECT ${tableInfo.idColumn} 
        FROM ${tableInfo.table} 
        WHERE Device_ID IS NULL
      `);
      
      if (nullRecords.length > 0) {
        foundNulls = true;
        console.log(`⚠️  ตาราง ${tableInfo.name.toUpperCase()}: พบ ${nullRecords.length} records ที่ Device_ID เป็น NULL`);
        nullRecords.forEach(record => {
          console.log(`   - ${tableInfo.idColumn}: ${record[tableInfo.idColumn]}`);
        });
      }
    } catch (err) {
      console.error(`⚠️  ตรวจสอบตาราง ${tableInfo.name} ไม่สำเร็จ:`, err.message);
    }
  }
  
  if (!foundNulls) {
    console.log('✅ ไม่พบ records ที่ Device_ID เป็น NULL');
  }
  
  console.log('\n' + '='.repeat(60));
}

async function main() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('  ตรวจสอบและแก้ไข Orphaned Records');
    console.log('='.repeat(60) + '\n');
    
    // ตรวจสอบ NULL Device_IDs
    await checkMissingDeviceIDs();
    
    // ตรวจสอบ orphaned records
    const orphanedResults = await checkOrphanedRecords();
    
    const totalOrphaned = orphanedResults.reduce((sum, r) => sum + r.count, 0);
    
    if (totalOrphaned === 0) {
      console.log('\n✅ ไม่พบ orphaned records - ฐานข้อมูลสมบูรณ์!');
      process.exit(0);
    }
    
    console.log(`\n📊 สรุป: พบ orphaned records ทั้งหมด ${totalOrphaned} records`);
    console.log('\nตัวเลือกการแก้ไข:');
    console.log('  1. ลบ orphaned records (แนะนำ - ถ้าข้อมูลเหล่านี้ไม่สำคัญ)');
    console.log('  2. สร้าง device records ที่ขาดหาย (ถ้าต้องการเก็บข้อมูล)');
    console.log('  3. ไม่ทำอะไร - แค่ตรวจสอบเท่านั้น');
    
    // รับ input จากผู้ใช้
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('\nเลือกการดำเนินการ (1/2/3): ', async (answer) => {
      if (answer === '1') {
        await fixOrphanedRecords(orphanedResults, 'delete');
        console.log('\n🔍 ตรวจสอบอีกครั้งหลังแก้ไข...');
        await checkOrphanedRecords();
      } else if (answer === '2') {
        await fixOrphanedRecords(orphanedResults, 'create');
        console.log('\n🔍 ตรวจสอบอีกครั้งหลังแก้ไข...');
        await checkOrphanedRecords();
      } else {
        console.log('\n📝 ไม่มีการเปลี่ยนแปลง - จบการทำงาน');
      }
      
      readline.close();
      await db.end();
      process.exit(0);
    });
    
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err);
    await db.end();
    process.exit(1);
  }
}

// รองรับการรันด้วย arguments
const args = process.argv.slice(2);
if (args.includes('--auto-delete')) {
  // โหมดอัตโนมัติ: ลบเลย
  (async () => {
    try {
      const orphanedResults = await checkOrphanedRecords();
      if (orphanedResults.length > 0) {
        await fixOrphanedRecords(orphanedResults, 'delete');
        await checkOrphanedRecords();
      }
      await db.end();
      process.exit(0);
    } catch (err) {
      console.error('❌ เกิดข้อผิดพลาด:', err);
      await db.end();
      process.exit(1);
    }
  })();
} else if (args.includes('--auto-create')) {
  // โหมดอัตโนมัติ: สร้าง device records
  (async () => {
    try {
      const orphanedResults = await checkOrphanedRecords();
      if (orphanedResults.length > 0) {
        await fixOrphanedRecords(orphanedResults, 'create');
        await checkOrphanedRecords();
      }
      await db.end();
      process.exit(0);
    } catch (err) {
      console.error('❌ เกิดข้อผิดพลาด:', err);
      await db.end();
      process.exit(1);
    }
  })();
} else if (args.includes('--check-only')) {
  // โหมดตรวจสอบอย่างเดียว
  (async () => {
    try {
      await checkMissingDeviceIDs();
      await checkOrphanedRecords();
      await db.end();
      process.exit(0);
    } catch (err) {
      console.error('❌ เกิดข้อผิดพลาด:', err);
      await db.end();
      process.exit(1);
    }
  })();
} else {
  // โหมดปกติ: มี interactive menu
  main();
}

