const db = require('../db');

async function rollback() {
  try {
    console.log('🔄 Rollback: ลบ column Power_CPU จากตาราง cooler\n');

    // ตรวจสอบว่า column มีอยู่หรือไม่
    const [cols] = await db.query('SHOW COLUMNS FROM cooler WHERE Field = "Power_CPU"');
    
    if (cols.length === 0) {
      console.log('✅ Column Power_CPU ไม่มีอยู่แล้ว - ไม่ต้องทำอะไร\n');
    } else {
      console.log('📝 ลบ column Power_CPU...');
      await db.query('ALTER TABLE cooler DROP COLUMN Power_CPU');
      console.log('✅ ลบ column สำเร็จ\n');
    }
    
    // ตรวจสอบผล
    const [result] = await db.query('SHOW COLUMNS FROM cooler');
    console.log('📋 Columns ใน cooler table:');
    result.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    console.log('\n✅ Rollback สำเร็จ!\n');
    await db.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Rollback ล้มเหลว:', err.message);
    console.error(err);
    await db.end();
    process.exit(1);
  }
}

rollback();





