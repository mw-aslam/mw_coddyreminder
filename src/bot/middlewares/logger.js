const logger = require('../../utils/logger');

function loggerMiddleware() {
  return async (ctx, next) => {
    const start = Date.now();
    const userId = ctx.from ? ctx.from.id : 'unknown';
    const username = ctx.from ? ctx.from.username || ctx.from.first_name : 'unknown';
    const updateType = ctx.updateType || 'unknown';
    const text = ctx.message?.text || ctx.callbackQuery?.data || '';

    logger.info(`[${updateType}] user=${userId} (${username}): ${text.substring(0, 100)}`);

    try {
      await next();
    } catch (err) {
      logger.error(`Error handling update from user=${userId}: ${err.message}`, err);
      try {
        await ctx.reply('❌ An error occurred. Please try again or use /cancel to reset.');
      } catch (replyErr) {
        logger.error('Failed to send error reply:', replyErr.message);
      }
    }

    const duration = Date.now() - start;
    logger.debug(`Update processed in ${duration}ms`);
  };
}

module.exports = loggerMiddleware;
