const mysql = require('mysql2/promise');

function config(database = process.env.DB_NAME || 'ukm_carpool_s1') {
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database,
    connectionLimit: 5,
  };
}

let pool;
function getPool() {
  if (!pool) pool = mysql.createPool(config());
  return pool;
}

module.exports = { config, getPool };
