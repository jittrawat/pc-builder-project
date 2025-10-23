const db = require('../db');

async function clearData() {
  try {
    console.log('Clearing old data...');
    
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    
    await db.query('DELETE FROM cpu');
    await db.query('DELETE FROM mainboard');
    await db.query('DELETE FROM gpu');
    await db.query('DELETE FROM ram');
    await db.query('DELETE FROM ssd');
    await db.query('DELETE FROM harddisk');
    await db.query('DELETE FROM power');
    await db.query('DELETE FROM pc_case');
    await db.query('DELETE FROM cooler');
    await db.query('DELETE FROM device');
    
    // รีเซ็ต AUTO_INCREMENT ให้เริ่มจาก 1
    console.log('Resetting AUTO_INCREMENT...');
    await db.query('ALTER TABLE device AUTO_INCREMENT = 1');
    
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✓ Old data cleared!');
    console.log('✓ Device_ID reset to start from 1!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Clear failed:', error);
    process.exit(1);
  }
}

clearData();
