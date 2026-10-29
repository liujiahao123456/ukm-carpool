const fs = require('node:fs/promises');
const path = require('node:path');
const mysql = require('mysql2/promise');
const { config } = require('../db');

async function main() {
  const dbName = process.env.DB_NAME || 'ukm_carpool_s1';
  if (!/^[a-zA-Z0-9_]+$/.test(dbName)) throw new Error('DB_NAME may contain only letters, numbers, and underscores');
  const settings = config(undefined);
  delete settings.database;
  delete settings.connectionLimit;
  const connection = await mysql.createConnection({ ...settings, multipleStatements: true });
  try {
    // Do not touch an existing database, even if it is empty.
    await connection.query(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE \`${dbName}\``);
    for (const name of ['001_base.sql', '002_seed.sql']) {
      const sql = await fs.readFile(path.join(__dirname, '..', 'database', name), 'utf8');
      await connection.query(sql);
    }
    console.log(`Created ${dbName} and loaded the S1 migration and fictional seed data.`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('Database setup failed:', error.message);
  console.error('If setup created a partial database, inspect it before removing it.');
  process.exitCode = 1;
});
