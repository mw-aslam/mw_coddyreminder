const { Markup } = require('telegraf');
const groupService = require('../services/groupService');
const { t } = require('../locales');

function buildGroupKeyboard(lang = 'ru', userId) {
  return groupService.getUserActiveGroups(userId).then(groups => {
    const buttons = [];
    buttons.push([Markup.button.callback(t(lang, 'private_chat'), 'select_group:private')]);
    for (const g of groups) {
      buttons.push([Markup.button.callback(`👥 ${g.title}`, `select_group:${g.telegram_group_id}`)]);
    }
    // Add Back button and Cancel button
    buttons.push([
      Markup.button.callback(t(lang, 'btn_back'), 'back'),
      Markup.button.callback(t(lang, 'btn_cancel'), 'cancel_reminder')
    ]);
    return { keyboard: Markup.inlineKeyboard(buttons), groups };
  });
}

function buildRecurrenceKeyboard(lang = 'ru') {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t(lang, 'rec_none'), 'recurrence:none')],
    [Markup.button.callback(t(lang, 'rec_daily'), 'recurrence:daily')],
    [Markup.button.callback(t(lang, 'rec_weekdays'), 'recurrence:weekdays')],
    [Markup.button.callback(t(lang, 'rec_weekly'), 'recurrence:weekly')],
    [
      Markup.button.callback(t(lang, 'btn_back'), 'back'),
      Markup.button.callback(t(lang, 'btn_cancel'), 'cancel_reminder')
    ]
  ]);
}

function buildConfirmKeyboard(lang = 'ru') {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(t(lang, 'btn_confirm'), 'confirm_reminder'),
    ],
    [
      Markup.button.callback(t(lang, 'btn_back'), 'back'),
      Markup.button.callback(t(lang, 'btn_cancel'), 'cancel_reminder'),
    ]
  ]);
}

function buildReminderActionsKeyboard(lang = 'ru', reminderId) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(t(lang, 'btn_edit') || '✏️ Изменить', `edit_reminder:${reminderId}`),
      Markup.button.callback(t(lang, 'btn_delete'), `delete_reminder:${reminderId}`)
    ]
  ]);
}

function buildEditKeyboard(lang = 'ru', reminderId) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t(lang, 'btn_edit_text') || '📝 Текст', `edit_field:text:${reminderId}`)],
    [Markup.button.callback(t(lang, 'btn_edit_date') || '📅 Дату', `edit_field:date:${reminderId}`)],
    [Markup.button.callback(t(lang, 'btn_edit_time') || '🕒 Время', `edit_field:time:${reminderId}`)],
    [Markup.button.callback(t(lang, 'btn_back'), 'cancel_delete')] // reusing cancel_delete for "Back to list" behavior
  ]);
}

function buildDeleteConfirmKeyboard(lang = 'ru', reminderId) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(t(lang, 'btn_confirm'), `confirm_delete:${reminderId}`),
      Markup.button.callback(t(lang, 'btn_cancel'), 'cancel_delete'),
    ],
  ]);
}

function buildSettingsKeyboard(lang = 'ru') {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🇷🇺 Русский', 'set_lang:ru'),
      Markup.button.callback('🇬🇧 English', 'set_lang:en'),
      Markup.button.callback("🇺🇿 O'zbek", 'set_lang:uz'),
    ],
    [Markup.button.callback(t(lang, 'btn_autodelete'), 'settings:auto_delete')],
  ]);
}

function buildAutoDeleteKeyboard(lang = 'ru') {
  const minutes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const rows = [];
  for (let i = 0; i < minutes.length; i += 5) {
    rows.push(
      minutes.slice(i, i + 5).map(m =>
        Markup.button.callback(`${m} мин`, `set_autodelete:${m}`)
      )
    );
  }
  rows.push([Markup.button.callback(t(lang, 'btn_back') || '🔙 Назад', 'settings_back')]);
  return Markup.inlineKeyboard(rows);
}

module.exports = {
  buildGroupKeyboard,
  buildRecurrenceKeyboard,
  buildConfirmKeyboard,
  buildReminderActionsKeyboard,
  buildEditKeyboard,
  buildDeleteConfirmKeyboard,
  buildSettingsKeyboard,
  buildAutoDeleteKeyboard,
};
