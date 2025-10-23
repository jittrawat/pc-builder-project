const db = require('../db');

async function main() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('  โครงสร้างตาราง GPU');
    console.log('='.repeat(60) + '\n');
    
    const [gpuCols] = await db.query('SHOW COLUMNS FROM gpu');
    gpuCols.forEach(col => {
      console.log(`  ${col.Field.padEnd(20)} : ${col.Type}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('  โครงสร้างตาราง Cooler');
    console.log('='.repeat(60) + '\n');
    
    const [coolerCols] = await db.query('SHOW COLUMNS FROM cooler');
    coolerCols.forEach(col => {
      console.log(`  ${col.Field.padEnd(20)} : ${col.Type}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('  โครงสร้างตาราง Power');
    console.log('='.repeat(60) + '\n');
    
    const [powerCols] = await db.query('SHOW COLUMNS FROM power');
    powerCols.forEach(col => {
      console.log(`  ${col.Field.padEnd(20)} : ${col.Type}`);
    });
    
    // ตรวจสอบข้อมูลจริง
    console.log('\n' + '='.repeat(60));
    console.log('  ตัวอย่างข้อมูล GPU (3 รายการแรก)');
    console.log('='.repeat(60) + '\n');
    
    const [gpus] = await db.query('SELECT * FROM gpu LIMIT 3');
    gpus.forEach((gpu, idx) => {
      console.log(`${idx + 1}. GPU_ID: ${gpu.GPU_ID}`);
      Object.keys(gpu).forEach(key => {
        if (key !== 'GPU_ID') {
          console.log(`   ${key}: ${gpu[key]}`);
        }
      });
      console.log('');
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('  ตัวอย่างข้อมูล Cooler (3 รายการแรก)');
    console.log('='.repeat(60) + '\n');
    
    const [coolers] = await db.query('SELECT * FROM cooler LIMIT 3');
    coolers.forEach((cooler, idx) => {
      console.log(`${idx + 1}. Cooler_ID: ${cooler.Cooler_ID}`);
      Object.keys(cooler).forEach(key => {
        if (key !== 'Cooler_ID') {
          console.log(`   ${key}: ${cooler[key]}`);
        }
      });
      console.log('');
    });
    
    await db.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err);
    await db.end();
    process.exit(1);
  }
}

main();





