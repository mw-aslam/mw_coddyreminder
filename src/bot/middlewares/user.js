const userService = require('../../services/userService');
const logger = require('../../utils/logger');

function userMiddleware() {
  return async (ctx, next) => {
    if (ctx.from) {
      try {
        ctx.dbUser = await userService.ensureUser(ctx.from);
      } catch (err) {
        logger.error('Failed to ensure user in DB:', err);
      }
    }
    return next();
  };
}

module.exports = userMiddleware;
