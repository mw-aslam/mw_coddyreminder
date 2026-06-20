const reminderHandler = require('../../handlers/reminderHandler');
const reminderService = require('../../services/reminderService');
const userService = require('../../services/userService');
const logger = require('../../utils/logger');
const { t } = require('../../locales');

async function handleCallbacks(ctx) {
  const data = ctx.callbackQuery.data;
  const lang = ctx.dbUser?.language || 'ru';

  try {
    if (data.startsWith('select_group:')) {
      await reminderHandler.handleGroupSelection(ctx);
      return;
    }

    if (data === 'confirm_reminder') {
      await reminderHandler.handleConfirmation(ctx);
      return;
    }

    if (data === 'cancel_reminder') {
      await reminderHandler.cancelReminderFlow(ctx);
      return;
    }

    if (data === 'back') {
      await reminderHandler.handleBack(ctx);
      return;
    }

    if (data.startsWith('recurrence:')) {
      await reminderHandler.handleRecurrenceSelection(ctx);
      return;
    }

    if (data.startsWith('edit_reminder:')) {
      const reminderId = parseInt(data.split(':')[1]);
      await handleEditPrompt(ctx, reminderId, lang);
      return;
    }

    if (data.startsWith('edit_field:')) {
      const parts = data.split(':');
      const field = parts[1]; // text, date, time
      const reminderId = parseInt(parts[2]);
      await handleEditFieldSelection(ctx, field, reminderId, lang);
      return;
    }

    if (data.startsWith('delete_reminder:')) {
      const reminderId = parseInt(data.split(':')[1]);
      await handleDeletePrompt(ctx, reminderId, lang);
      return;
    }

    if (data.startsWith('confirm_delete:')) {
      const reminderId = parseInt(data.split(':')[1]);
      await handleConfirmDelete(ctx, reminderId, lang);
      return;
    }

    if (data === 'cancel_delete') {
      await ctx.editMessageText(t(lang, 'cancelled'));
      await ctx.answerCbQuery();
      return;
    }

    if (data.startsWith('set_lang:')) {
      const newLang = data.split(':')[1];
      await userService.updateSettings(ctx.from.id, { language: newLang });
      if (ctx.dbUser) ctx.dbUser.language = newLang;
      
      const userMiddleware = require('../middlewares/user');
      if (userMiddleware.updateCache) {
        userMiddleware.updateCache(ctx.from.id, { language: newLang });
      }

      await showSettingsMenu(ctx, newLang);
      await ctx.answerCbQuery(t(newLang, 'settings_lang_updated'));
      return;
    }

    if (data.startsWith('set_autodelete:')) {
      const minutes = parseInt(data.split(':')[1]);
      const seconds = minutes * 60;
      await userService.updateSettings(ctx.from.id, { auto_delete_duration: seconds });
      if (ctx.dbUser) ctx.dbUser.auto_delete_duration = seconds;

      const userMiddleware = require('../middlewares/user');
      if (userMiddleware.updateCache) {
        userMiddleware.updateCache(ctx.from.id, { auto_delete_duration: seconds });
      }

      const langNow = ctx.dbUser?.language || 'ru';
      const minLabel = langNow === 'uz' ? 'daq' : langNow === 'en' ? 'min' : 'мин';
      const msg = `✅ ${minutes} ${minLabel}`;
          
      await showSettingsMenu(ctx, langNow);
      await ctx.answerCbQuery(msg);
      return;
    }

    if (data === 'settings_back') {
      await showSettingsMenu(ctx, lang);
      await ctx.answerCbQuery();
      return;
    }

    if (data.startsWith('settings:')) {
      await handleSettingsAction(ctx, data.split(':')[1], lang);
      return;
    }

    await ctx.answerCbQuery();
  } catch (err) {
    logger.error(`Callback handler error for data="${data}":`, err);
    await ctx.answerCbQuery(t(lang, 'error_occurred'));
  }
}

async function handleDeletePrompt(ctx, reminderId, lang) {
  const userId = ctx.from.id;
  const reminder = await reminderService.getReminderById(reminderId, userId);

  if (!reminder) {
    await ctx.answerCbQuery(t(lang, 'error_not_found'));
    return;
  }

  const { buildDeleteConfirmKeyboard } = require('../../keyboards/groupKeyboard');

  await ctx.editMessageText(
    `${t(lang, 'delete_select')}\n\n📝 ${reminder.text}`,
    {
      parse_mode: 'Markdown',
      ...buildDeleteConfirmKeyboard(lang, reminderId),
    }
  );

  await ctx.answerCbQuery();
}

async function handleConfirmDelete(ctx, reminderId, lang) {
  const userId = ctx.from.id;
  const deleted = await reminderService.deleteReminder(reminderId, userId);

  if (deleted) {
    await ctx.editMessageText(t(lang, 'delete_success', { id: reminderId }));
    logger.info(`User ${userId} deleted reminder #${reminderId}`);
  } else {
    await ctx.editMessageText(t(lang, 'failed'));
  }

  await ctx.answerCbQuery();
}

async function handleEditPrompt(ctx, reminderId, lang) {
  const userId = ctx.from.id;
  const reminder = await reminderService.getReminderById(reminderId, userId);

  if (!reminder) {
    await ctx.answerCbQuery(t(lang, 'error_not_found'));
    return;
  }

  const { buildEditKeyboard } = require('../../keyboards/groupKeyboard');

  await ctx.editMessageText(
    `${t(lang, 'edit_select')}\n\n📝 ${reminder.text}`,
    {
      parse_mode: 'Markdown',
      ...buildEditKeyboard(lang, reminderId),
    }
  );

  await ctx.answerCbQuery();
}

async function handleEditFieldSelection(ctx, field, reminderId, lang) {
  const userId = ctx.from.id;
  const session = reminderHandler.getSession(userId);
  
  session.editReminderId = reminderId;
  session.step = `edit_${field}`; // edit_text, edit_date, edit_time
  
  const promptKey = `edit_${field}_prompt`;
  await ctx.editMessageText(t(lang, promptKey), { parse_mode: 'Markdown' });
  await ctx.answerCbQuery();
}

async function handleSettingsAction(ctx, action, lang) {
  const { buildAutoDeleteKeyboard } = require('../../keyboards/groupKeyboard');

  switch (action) {
    case 'auto_delete':
      await ctx.editMessageText(
        t(lang, 'settings_autodelete_prompt'),
        { parse_mode: 'Markdown', ...buildAutoDeleteKeyboard(lang) }
      );
      break;

    default:
      await ctx.answerCbQuery();
      return;
  }

  await ctx.answerCbQuery();
}

async function showSettingsMenu(ctx, lang) {
  const { buildSettingsKeyboard } = require('../../keyboards/groupKeyboard');
  const user = ctx.dbUser;
  const autoDeleteSec = user?.auto_delete_duration || 60;
  const autoDeleteMin = Math.round(autoDeleteSec / 60);

  const langDisplay = lang === 'ru' ? '🇷🇺 Русский' : lang === 'uz' ? "🇺🇿 O'zbek" : '🇬🇧 English';

  await ctx.editMessageText(
    t(lang, 'settings_title', { lang: langDisplay, autoDelete: autoDeleteMin }),
    {
      parse_mode: 'Markdown',
      ...buildSettingsKeyboard(lang),
    }
  );
}

module.exports = { handleCallbacks };
