const { query, isJsonAdapter, localStore } = require('../db');

async function upsertUser({ telegramUserId, username, firstName, lastName }) {
  if (isJsonAdapter) {
    return localStore.upsertUser({ telegramUserId, username, firstName, lastName });
  }

  const sql = `
    INSERT INTO users (telegram_user_id, username, first_name, last_name, language, timezone)
    VALUES ($1, $2, $3, $4, 'ru', 'Asia/Tashkent')
    ON CONFLICT (telegram_user_id)
    DO UPDATE SET username = $2, first_name = $3, last_name = $4, updated_at = NOW()
    RETURNING *
  `;
  const result = await query(sql, [telegramUserId, username || null, firstName || null, lastName || null]);
  return result.rows[0];
}

async function getUserById(telegramUserId) {
  if (isJsonAdapter) {
    return localStore.getUserById(telegramUserId);
  }

  const result = await query(
    'SELECT * FROM users WHERE telegram_user_id = $1',
    [telegramUserId]
  );
  return result.rows[0] || null;
}

async function updateUserSettings(telegramUserId, settings) {
  if (isJsonAdapter) {
    return localStore.updateUserSettings(telegramUserId, settings);
  }

  const fields = [];
  const values = [];
  let idx = 1;

  if (settings.timezone !== undefined) {
    fields.push(`timezone = $${idx++}`);
    values.push(settings.timezone);
  }
  if (settings.language !== undefined) {
    fields.push(`language = $${idx++}`);
    values.push(settings.language);
  }
  if (settings.auto_delete_duration !== undefined) {
    fields.push(`auto_delete_duration = $${idx++}`);
    values.push(settings.auto_delete_duration);
  }
  if (settings.notification_enabled !== undefined) {
    fields.push(`notification_enabled = $${idx++}`);
    values.push(settings.notification_enabled);
  }

  if (fields.length === 0) return null;

  values.push(telegramUserId);
  const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE telegram_user_id = $${idx} RETURNING *`;
  const result = await query(sql, values);
  return result.rows[0];
}

module.exports = { upsertUser, getUserById, updateUserSettings };
