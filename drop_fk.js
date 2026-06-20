require('dotenv').config();
const { query } = require('./src/database/db');

async function dropFk() {
  try {
    await query('ALTER TABLE reminders DROP CONSTRAINT IF EXISTS reminders_group_id_fkey;');
    console.log('Foreign key dropped successfully.');
  } catch (err) {
    console.error('Error dropping foreign key:', err);
  }
  process.exit(0);
}

dropFk();
