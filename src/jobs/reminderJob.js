const cron = require('node-cron');
const { sendDueReminders } = require('../services/reminderService');
const logger = require('../utils/logger');

function startReminderJob(bot) {
  // Run every 10 seconds for near-instant reminder delivery
  const job = cron.schedule('* * * * * *', async () => {
    try {
      await sendDueReminders(bot);
    } catch (err) {
      logger.error('Reminder job error:', err);
    }
  });

  logger.info('Reminder cron job started (runs every 10 seconds)');
  return job;
}

module.exports = { startReminderJob };
