const { Pool } = require('pg');
const config = require('../config/config');
const logger = require('../utils/logger');

const poolConfig = config.database.connectionString
  ? {
      connectionString: config.database.connectionString,
      ssl: config.database.ssl,
      max: config.database.max,
      idleTimeoutMillis: config.database.idleTimeoutMillis,
      connectionTimeoutMillis: config.database.connectionTimeoutMillis,
    }
  : {
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      user: config.database.user,
      password: config.database.password,
      ssl: config.database.ssl,
      max: config.database.max,
      idleTimeoutMillis: config.database.idleTimeoutMillis,
      connectionTimeoutMillis: config.database.connectionTimeoutMillis,
    };

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  logger.debug('New database connection established');
});

pool.on('error', (err) => {
  logger.error('Unexpected database pool error:', err);
});

async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug(`Query executed in ${duration}ms: ${text.substring(0, 80)}`);
    return result;
  } catch (err) {
    logger.error(`Database query error: ${err.message}`, { query: text, params });
    throw err;
  }
}

async function getClient() {
  return pool.connect();
}

async function testConnection() {
  try {
    const result = await query('SELECT NOW()');
    logger.info('Database connection successful:', result.rows[0].now);
    return true;
  } catch (err) {
    logger.error('Database connection failed:', err);
    return false;
  }
}

module.exports = { query, getClient, pool, testConnection };
