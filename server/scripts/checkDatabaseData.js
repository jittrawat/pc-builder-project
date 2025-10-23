const db = require('../db');

async function checkDataCounts() {
  console.log('\n' + '='.repeat(60));
  console.log('  ตรวจสอบจำนวนข้อมูลในฐานข้อมูล');
  console.log('='.repeat(60) + '\n');

  const tables = [
    { name: 'CPU', query: 'SELECT COUNT(*) as total FROM cpu' },
    { name: 'GPU', query: 'SELECT COUNT(*) as total FROM gpu' },
    { name: 'Motherboard', query: 'SELECT COUNT(*) as total FROM mainboard' },
    { name: 'RAM', query: 'SELECT COUNT(*) as total FROM ram' },
    { name: 'SSD', query: 'SELECT COUNT(*) as total FROM ssd' },
    { name: 'HDD', query: 'SELECT COUNT(*) as total FROM harddisk' },
    { name: 'Cooler', query: 'SELECT COUNT(*) as total FROM cooler' },
    { name: 'Power Supply', query: 'SELECT COUNT(*) as total FROM power' },
    { name: 'Case', query: 'SELECT COUNT(*) as total FROM pc_case' },
    { name: 'Device', query: 'SELECT COUNT(*) as total FROM device' }
  ];

  console.log('📊 จำนวนรายการในแต่ละตาราง:\n');
  
  for (const table of tables) {
    try {
      const [result] = await db.query(table.query);
      const count = result[0].total;
      const icon = count > 0 ? '✅' : '❌';
      console.log(`${icon} ${table.name.padEnd(20)} : ${count.toString().padStart(5)} รายการ`);
    } catch (err) {
      console.log(`⚠️  ${table.name.padEnd(20)} : ไม่สามารถตรวจสอบได้`);
    }
  }
}

async function checkCPUData() {
  console.log('\n' + '='.repeat(60));
  console.log('  ตัวอย่างข้อมูล CPU');
  console.log('='.repeat(60) + '\n');

  try {
    const [cpus] = await db.query(`
      SELECT 
        c.CPU_ID,
        d.Device_Name,
        c.socket,
        c.power_usage,
        d.price
      FROM cpu c
      JOIN device d ON c.Device_ID = d.Device_ID
      LIMIT 5
    `);

    if (cpus.length === 0) {
      console.log('❌ ไม่มีข้อมูล CPU');
    } else {
      console.log(`พบ CPU ${cpus.length} รายการ:\n`);
      cpus.forEach((cpu, idx) => {
        console.log(`${idx + 1}. ${cpu.Device_Name}`);
        console.log(`   - Socket: ${cpu.socket || 'N/A'}`);
        console.log(`   - Power: ${cpu.power_usage || 'N/A'} W`);
        console.log(`   - Price: ฿${cpu.price || 0}\n`);
      });
    }
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err.message);
  }
}

async function checkMainboardData() {
  console.log('\n' + '='.repeat(60));
  console.log('  ตัวอย่างข้อมูล Motherboard');
  console.log('='.repeat(60) + '\n');

  try {
    const [mainboards] = await db.query(`
      SELECT 
        m.mainboard_ID,
        d.Device_Name,
        m.Socket_Sup,
        m.RAM_Sup,
        m.Case_Sup,
        m.power_usage,
        d.price
      FROM mainboard m
      JOIN device d ON m.Device_ID = d.Device_ID
      LIMIT 5
    `);

    if (mainboards.length === 0) {
      console.log('❌ ไม่มีข้อมูล Motherboard');
    } else {
      console.log(`พบ Motherboard ${mainboards.length} รายการ:\n`);
      mainboards.forEach((mb, idx) => {
        console.log(`${idx + 1}. ${mb.Device_Name}`);
        console.log(`   - Socket: ${mb.Socket_Sup || 'N/A'}`);
        console.log(`   - RAM Support: ${mb.RAM_Sup || 'N/A'}`);
        console.log(`   - Case Support: ${mb.Case_Sup || 'N/A'}`);
        console.log(`   - Power: ${mb.power_usage || 'N/A'} W`);
        console.log(`   - Price: ฿${mb.price || 0}\n`);
      });
    }
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err.message);
  }
}

async function checkNullFields() {
  console.log('\n' + '='.repeat(60));
  console.log('  ตรวจสอบข้อมูลที่ขาดหาย (NULL fields)');
  console.log('='.repeat(60) + '\n');

  const checks = [
    {
      name: 'CPU - socket หายไป',
      query: 'SELECT COUNT(*) as total FROM cpu WHERE socket IS NULL OR socket = ""'
    },
    {
      name: 'CPU - power_usage หายไป',
      query: 'SELECT COUNT(*) as total FROM cpu WHERE power_usage IS NULL OR power_usage = 0'
    },
    {
      name: 'Motherboard - Socket_Sup หายไป',
      query: 'SELECT COUNT(*) as total FROM mainboard WHERE Socket_Sup IS NULL OR Socket_Sup = ""'
    },
    {
      name: 'Motherboard - RAM_Sup หายไป',
      query: 'SELECT COUNT(*) as total FROM mainboard WHERE RAM_Sup IS NULL OR RAM_Sup = ""'
    },
    {
      name: 'GPU - power_usage หายไป',
      query: 'SELECT COUNT(*) as total FROM gpu WHERE power_usage IS NULL OR power_usage = 0'
    },
    {
      name: 'Cooler - Socket_Sup หายไป',
      query: 'SELECT COUNT(*) as total FROM cooler WHERE Socket_Sup IS NULL OR Socket_Sup = ""'
    },
    {
      name: 'Cooler - Power_CPU หายไป',
      query: 'SELECT COUNT(*) as total FROM cooler WHERE Power_CPU IS NULL OR Power_CPU = 0'
    },
    {
      name: 'Power - power_sup หายไป',
      query: 'SELECT COUNT(*) as total FROM power WHERE power_sup IS NULL OR power_sup = 0'
    }
  ];

  for (const check of checks) {
    try {
      const [result] = await db.query(check.query);
      const count = result[0].total;
      if (count > 0) {
        console.log(`⚠️  ${check.name}: ${count} รายการ`);
      } else {
        console.log(`✅ ${check.name}: ไม่มีปัญหา`);
      }
    } catch (err) {
      console.log(`⚠️  ${check.name}: ตรวจสอบไม่ได้`);
    }
  }
}

async function main() {
  try {
    await checkDataCounts();
    await checkCPUData();
    await checkMainboardData();
    await checkNullFields();
    
    console.log('\n' + '='.repeat(60));
    console.log('  ✅ การตรวจสอบเสร็จสิ้น');
    console.log('='.repeat(60) + '\n');
    
    await db.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err);
    await db.end();
    process.exit(1);
  }
}

main();





