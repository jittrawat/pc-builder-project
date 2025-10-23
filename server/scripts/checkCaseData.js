const db = require('../db');

async function main() {
  try {
    console.log('=== Motherboard ===\n');
    const [mb] = await db.query(`
      SELECT d.Device_Name, m.Case_Sup 
      FROM mainboard m 
      JOIN device d ON m.Device_ID = d.Device_ID 
      LIMIT 5
    `);
    mb.forEach(m => {
      console.log(`- ${m.Device_Name}`);
      console.log(`  Case_Sup: "${m.Case_Sup}"\n`);
    });
    
    console.log('\n=== Case ===\n');
    const [cases] = await db.query(`
      SELECT d.Device_Name, c.Size_Case 
      FROM pc_case c 
      JOIN device d ON c.Device_ID = d.Device_ID 
      LIMIT 5
    `);
    cases.forEach(c => {
      console.log(`- ${c.Device_Name}`);
      console.log(`  Size_Case: "${c.Size_Case}"\n`);
    });
    
    await db.end();
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    await db.end();
    process.exit(1);
  }
}

main();





