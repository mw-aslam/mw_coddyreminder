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

function getDatabaseConnectionHint(err) {
  const message = err?.message || '';

  if (message.includes('tenant/user') && message.includes('not found')) {
    return 'Supabase pooler tenant/user not found. Use the Session pooler connection string from Supabase Dashboard; the username must be postgres.<PROJECT-REF> and the pooler region must match the project.';
  }

  if (err?.code === 'ENOTFOUND') {
    return 'Database host was not resolved by Node. Supabase direct db.<PROJECT-REF>.supabase.co endpoints are IPv6-only unless the IPv4 add-on is enabled; use the shared pooler for local IPv4 networks.';
  }

  if (err?.code === 'ENETUNREACH') {
    return 'Database host resolved to IPv6, but this machine has no IPv6 route. Use the Supabase shared pooler or enable the IPv4 add-on.';
  }

  if (/password authentication failed/i.test(message)) {
    return 'Database password is incorrect. Reset or copy the database password from Supabase settings.';
  }

  return 'Please check DATABASE_URL or the DB_* settings.';
}

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
    logger.error(`Database connection failed: ${getDatabaseConnectionHint(err)}`);
    return false;
  }
}

module.exports = { query, getClient, pool, testConnection };
