require('dotenv').config();
const { createBot } = require('./bot');
const { testConnection } = require('./database/db');
const { startReminderJob } = require('./jobs/reminderJob');
const logger = require('./utils/logger');
const fs = require('fs');

// Ensure logs directory exists
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

async function main() {
  logger.info('Starting ReminderFlow Bot...');

  // Test DB connection
  const dbOk = await testConnection();
  if (!dbOk) {
    logger.error('Database connection failed. Please check your DATABASE_URL or DB_* settings.');
    logger.error('Run: npm run migrate  to initialize the database schema.');
    process.exit(1);
  }

  // Create and launch bot
  const bot = createBot();

  // Start reminder delivery job
  startReminderJob(bot);

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Shutting down...`);
    bot.stop(signal);
    process.exit(0);
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));

  // Launch polling
  await bot.launch();
  logger.info('ReminderFlow Bot is running! 🚀');
}

main().catch((err) => {
  logger.error('Fatal startup error:', err);
  process.exit(1);
});
