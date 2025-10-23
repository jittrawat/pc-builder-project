const fs = require('fs');
const path = require('path');
const db = require('../db');

async function runMigration() {
  console.log('Starting Power_CPU column removal migration...');
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'remove_power_cpu_column.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the migration
    await db.query(sql);
    
    console.log('✅ Migration completed successfully! Power_CPU column has been removed from cooler table.');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Error details:', error);
  } finally {
    process.exit();
  }
}

// Run the migration
runMigration();









