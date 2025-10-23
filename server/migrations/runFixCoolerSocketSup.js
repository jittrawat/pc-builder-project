const db = require('../db');
const fs = require('fs');
const path = require('path');

async function migrate() {
  try {
    console.log('🔄 เริ่มต้น migration: เพิ่มขนาด Socket_Sup column\n');

    // อ่านไฟล์ SQL
    const sqlFile = path.join(__dirname, 'fix_cooler_socket_sup.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📝 รัน:', sql);
    await db.query(sql);
    console.log('✅ สำเร็จ\n');

    // ตรวจสอบผล
    const [result] = await db.query('SHOW COLUMNS FROM cooler WHERE Field = "Socket_Sup"');
    console.log('📋 Socket_Sup column:');
    console.log(`  Type: ${result[0].Type}`);

    console.log('\n✅ Migration สำเร็จ!\n');
    await db.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration ล้มเหลว:', err.message);
    await db.end();
    process.exit(1);
  }
}

migrate();





