const cron = require('node-cron');
const { sendDueReminders } = require('../services/reminderService');
const logger = require('../utils/logger');

function startReminderJob(bot) {
  // Run every minute to check for due reminders
  const job = cron.schedule('* * * * *', async () => {
    logger.debug('Checking for due reminders...');
    try {
      await sendDueReminders(bot);
    } catch (err) {
      logger.error('Reminder job error:', err);
    }
  });

  logger.info('Reminder cron job started (runs every minute)');
  return job;
}

module.exports = { startReminderJob };
