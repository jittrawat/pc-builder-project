const fs = require('fs');
const path = require('path');
const db = require('../db');

async function runMigration() {
  try {
    console.log('🚀 Starting preset_builds migration...');
    
    const sqlFile = path.join(__dirname, 'create_preset_builds.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await db.query(statement);
      }
    }
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();