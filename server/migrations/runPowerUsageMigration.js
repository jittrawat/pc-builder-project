const fs = require('fs');
const path = require('path');
const db = require('../db');

async function runMigration() {
  try {
    console.log('Starting power_usage column migration...');
    
    const sqlFile = path.join(__dirname, 'add_power_usage_columns.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // แยก statements ด้วย semicolon
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 100) + '...');
      await db.query(statement);
    }
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();









