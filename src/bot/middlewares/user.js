const userService = require('../../services/userService');
const logger = require('../../utils/logger');

const userCache = new Map();

function userMiddleware() {
  return async (ctx, next) => {
    if (ctx.from) {
      try {
        const userId = ctx.from.id;
        if (userCache.has(userId)) {
          ctx.dbUser = userCache.get(userId);
          
          // Async update in background occasionally (e.g. 1% of time or just skip)
          // For now, no background update to keep it ultra fast.
        } else {
          ctx.dbUser = await userService.ensureUser(ctx.from);
          userCache.set(userId, ctx.dbUser);
        }
      } catch (err) {
        logger.error('Failed to ensure user in DB:', err);
      }
    }
    return next();
  };
}

// Allow updating the cache from outside (like settings)
userMiddleware.updateCache = (userId, updates) => {
  if (userCache.has(userId)) {
    Object.assign(userCache.get(userId), updates);
  }
};

module.exports = userMiddleware;
