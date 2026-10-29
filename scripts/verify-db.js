const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const mysql = require('mysql2/promise');
const { config } = require('../db');

async function main() {
  const settings = config();
  delete settings.database;
  delete settings.connectionLimit;
  const admin = await mysql.createConnection({ ...settings, multipleStatements: true });
  const dbName = `ukm_s1_test_${crypto.randomBytes(6).toString('hex')}`;
  let created = false;
  let a;
  let b;
  try {
    await admin.query(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    created = true;
    a = await mysql.createConnection({ ...settings, database: dbName, multipleStatements: true });
    b = await mysql.createConnection({ ...settings, database: dbName });
    for (const file of ['001_base.sql', '002_seed.sql']) {
      await a.query(await fs.readFile(path.join(__dirname, '..', 'database', file), 'utf8'));
    }
    const [visible] = await b.query('SELECT COUNT(*) AS count FROM trips WHERE trip_id = 1');
    assert.equal(visible[0].count, 1, 'a second connection reads committed seed data');
    await assert.rejects(() => a.query("INSERT INTO users (full_name,email,phone,password_hash,role) VALUES ('Test','driver@example.test','1','!', 'CUSTOMER')"));
    await assert.rejects(() => a.query("INSERT INTO cars (driver_id,registration_plate,model,passenger_capacity) VALUES (1,'BAD-TEST','Example',0)"));
    await assert.rejects(() => a.query("INSERT INTO cars (driver_id,registration_plate,model,passenger_capacity) VALUES (999999,'NO-DRIVER','Example',1)"));
    await a.query("INSERT INTO users (user_id,full_name,email,phone,password_hash,role) VALUES (3,'Another driver','other@example.test','0','!', 'DRIVER')");
    await a.query('INSERT INTO drivers (driver_id) VALUES (3)');
    await a.query("INSERT INTO cars (car_id,driver_id,registration_plate,model,passenger_capacity) VALUES (3,3,'TEST003','Example',3)");
    await assert.rejects(() => a.query("INSERT INTO trips (driver_id,car_id,origin,destination,departure_at,price_per_seat,offered_seats,available_seats) VALUES (3,1,'A','B','2030-01-01 09:00:00',0,1,1)"));
    await assert.rejects(() => a.query("INSERT INTO trips (driver_id,car_id,origin,destination,departure_at,price_per_seat,offered_seats,available_seats) VALUES (3,3,'A','B','2030-01-01 09:00:00',0,1,-1)"));
    const insert = "INSERT INTO trips (driver_id,car_id,origin,destination,departure_at,price_per_seat,offered_seats,available_seats) VALUES (3,3,'A','B','2030-01-01 09:00:00',0,1,1)";
    const attempts = await Promise.allSettled([a.query(insert), b.query(insert)]);
    assert.equal(attempts.filter((r) => r.status === 'fulfilled').length, 1, 'one concurrent active trip succeeds');
    assert.equal(attempts.filter((r) => r.status === 'rejected').length, 1, 'the other concurrent active trip is rejected');
    assert.equal(attempts.find((r) => r.status === 'rejected').reason.code, 'ER_DUP_ENTRY');
    console.log('PASS: empty database migration, seed, independent connections, unique email, checks, foreign key, concurrent active trip.');
  } finally {
    if (a) await a.end();
    if (b) await b.end();
    if (created) await admin.query(`DROP DATABASE \`${dbName}\``);
    await admin.end();
  }
}

main().catch((error) => { console.error('Database verification failed:', error.message); process.exitCode = 1; });
