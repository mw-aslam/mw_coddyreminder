const { Telegraf, session } = require('telegraf');
const config = require('./config/config');
const logger = require('./utils/logger');

const loggerMiddleware = require('./bot/middlewares/logger');
const userMiddleware = require('./bot/middlewares/user');

const commands = require('./bot/commands/index');
const { handleCallbacks } = require('./bot/handlers/callbackHandler');
const { handleMyChatMember } = require('./bot/handlers/groupHandler');
const { handleReminderStep, getSession } = require('./handlers/reminderHandler');
const groupService = require('./services/groupService');
const groupRepository = require('./database/repositories/groupRepository');

function createBot() {
  const bot = new Telegraf(config.bot.token);

  // Middleware
  bot.use(loggerMiddleware());
  bot.use(userMiddleware());

  // Cache for group memberships to prevent DB queries on every message
  const groupMembershipCache = new Set();

  // Auto-track user-group memberships & block group usage
  bot.use(async (ctx, next) => {
    // Only process group-related tracking if not a private chat
    if (ctx.from && ctx.chat && ctx.chat.type !== 'private') {
      const userId = ctx.from.id;
      const groupId = ctx.chat.id;
      const cacheKey = `${userId}:${groupId}`;

      // Track membership in background (cached)
      if (groupId < 0 && !groupMembershipCache.has(cacheKey)) {
        groupMembershipCache.add(cacheKey);
        groupRepository.getGroupById(groupId).then(existing => {
          if (existing) groupService.addUserToGroup(userId, groupId).catch(() => {});
        }).catch(() => {});
      }

      // Only allow my_chat_member events from groups (bot added/removed)
      if (ctx.updateType !== 'my_chat_member') return;
    }

    return next();
  });

  // Register bot commands with Telegram (BotFather)
  bot.telegram.setMyCommands([
    { command: 'start', description: 'Start bot' },
    { command: 'help', description: 'Help information' },
    { command: 'reminder', description: 'Create reminder' },
    { command: 'myreminders', description: 'My reminders' },
    { command: 'delete', description: 'Delete reminder' },
    { command: 'groups', description: 'My groups' },
    { command: 'settings', description: 'Settings' },
    { command: 'cancel', description: 'Cancel operation' },
  ]).then(() => logger.info('Bot commands registered with Telegram')).catch(logger.error);

  // Commands
  bot.command('start', commands.startCommand);
  bot.command('help', commands.helpCommand);
  bot.command('reminder', commands.reminderCommand);
  bot.command('remind', commands.remindGroupCommand);
  bot.command('myreminders', commands.myRemindersCommand);
  bot.command('delete', commands.deleteCommand);
  bot.command('groups', commands.groupsCommand);
  bot.command('settings', commands.settingsCommand);
  bot.command('cancel', commands.cancelCommand);

  // Callback queries (inline keyboard buttons)
  bot.on('callback_query', handleCallbacks);

  // Group events (bot added/removed)
  bot.on('my_chat_member', handleMyChatMember);

  // Handle text messages (for multi-step flows)
  bot.on('text', async (ctx) => {
    // If it's a group, ignore text that isn't a command
    if (ctx.chat.type !== 'private') return;

    const session = getSession(ctx.from.id);
    if (session && session.step) {
      const handled = await handleReminderStep(ctx);
      if (handled) return;
    }

    // Unknown message
    const { t } = require('./locales');
    const lang = ctx.dbUser?.language || 'ru';
    await ctx.reply(t(lang, 'unknown_cmd'));
  });

  // Error handler
  bot.catch((err, ctx) => {
    logger.error(`Global bot error for update ${ctx.update.update_id}:`, err);
  });

  return bot;
}

module.exports = { createBot };
