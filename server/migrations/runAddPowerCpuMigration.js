const db = require('../db');

async function migrate() {
  try {
    console.log('🔄 เริ่มต้น migration: เพิ่ม Power_CPU column ในตาราง cooler\n');

    // ตรวจสอบว่า column มีอยู่แล้วหรือยัง
    const [cols] = await db.query('SHOW COLUMNS FROM cooler WHERE Field = "Power_CPU"');
    
    if (cols.length > 0) {
      console.log('✅ Column Power_CPU มีอยู่แล้ว\n');
    } else {
      console.log('📝 เพิ่ม column Power_CPU...');
      await db.query(`
        ALTER TABLE cooler 
        ADD COLUMN Power_CPU INT(11) DEFAULT NULL 
        COMMENT 'Maximum CPU TDP supported (Watts)'
      `);
      console.log('✅ เพิ่ม column สำเร็จ\n');
      
      console.log('📝 อัพเดตข้อมูลเก่า...');
      await db.query(`
        UPDATE cooler 
        SET Power_CPU = 220 
        WHERE Power_CPU IS NULL
      `);
      console.log('✅ อัพเดตข้อมูลสำเร็จ\n');
    }
    
    // ตรวจสอบผล
    const [result] = await db.query('SHOW COLUMNS FROM cooler');
    console.log('📋 Columns ใน cooler table:');
    result.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})${col.Field === 'Power_CPU' ? ' ✅ NEW' : ''}`);
    });
    
    // แสดงข้อมูลตัวอย่าง
    const [coolers] = await db.query('SELECT * FROM cooler LIMIT 3');
    console.log('\n📊 ตัวอย่างข้อมูล:');
    coolers.forEach((c, idx) => {
      console.log(`  ${idx + 1}. Cooler_ID: ${c.cooler_ID}, Power_CPU: ${c.Power_CPU || 'NULL'}`);
    });

    console.log('\n✅ Migration สำเร็จ!\n');
    await db.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration ล้มเหลว:', err.message);
    console.error(err);
    await db.end();
    process.exit(1);
  }
}

migrate();
