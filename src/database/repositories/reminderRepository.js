const { query } = require('../db');

async function createReminder({ userId, groupId, text, remindAt, recurrence = 'none' }) {
  const sql = `
    INSERT INTO reminders (user_id, group_id, text, remind_at, recurrence, status)
    VALUES ($1, $2, $3, $4, $5, 'pending')
    RETURNING *
  `;
  const result = await query(sql, [userId, groupId, text, remindAt, recurrence]);
  return result.rows[0];
}

async function updateReminder(id, updates) {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = $${idx}`);
    values.push(value);
    idx++;
  }

  if (fields.length === 0) return null;

  values.push(id);
  const sql = `
    UPDATE reminders
    SET ${fields.join(', ')}, updated_at = NOW()
    WHERE id = $${idx}
    RETURNING *
  `;
  
  const result = await query(sql, values);
  return result.rows[0];
}

async function getPendingReminders() {
  const sql = `
    SELECT r.*, g.title as group_title, g.telegram_group_id
    FROM reminders r
    JOIN groups g ON g.telegram_group_id = r.group_id
    WHERE r.status = 'pending' AND r.remind_at <= NOW()
    ORDER BY r.remind_at ASC
  `;
  const result = await query(sql);
  return result.rows;
}

async function getUserReminders(userId, status = null) {
  let sql = `
    SELECT r.*, g.title as group_title
    FROM reminders r
    JOIN groups g ON g.telegram_group_id = r.group_id
    WHERE r.user_id = $1
  `;
  const params = [userId];

  if (status) {
    sql += ` AND r.status = $2`;
    params.push(status);
  } else {
    sql += ` AND r.status IN ('pending')`;
  }

  sql += ` ORDER BY r.remind_at ASC`;
  const result = await query(sql, params);
  return result.rows;
}

async function getReminderById(id, userId = null) {
  let sql = `
    SELECT r.*, g.title as group_title
    FROM reminders r
    JOIN groups g ON g.telegram_group_id = r.group_id
    WHERE r.id = $1
  `;
  const params = [id];

  if (userId) {
    sql += ` AND r.user_id = $2`;
    params.push(userId);
  }

  const result = await query(sql, params);
  return result.rows[0] || null;
}

async function updateReminderStatus(id, status, sentMessageId = null) {
  const sql = `
    UPDATE reminders
    SET status = $1, sent_message_id = COALESCE($2, sent_message_id), updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `;
  const result = await query(sql, [status, sentMessageId, id]);
  return result.rows[0];
}

async function deleteReminder(id, userId) {
  const sql = `
    UPDATE reminders SET status = 'deleted', updated_at = NOW()
    WHERE id = $1 AND user_id = $2 AND status = 'pending'
    RETURNING *
  `;
  const result = await query(sql, [id, userId]);
  return result.rows[0] || null;
}

module.exports = {
  createReminder,
  updateReminder,
  getPendingReminders,
  getUserReminders,
  getReminderById,
  updateReminderStatus,
  deleteReminder,
};
