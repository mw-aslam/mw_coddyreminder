const fs = require('fs');
const path = require('path');
const config = require('../config/config');

const databasePath = path.resolve(config.database.jsonPath);

function emptyDatabase() {
  return {
    sequences: {
      groups: 1,
      users: 1,
      reminders: 1,
    },
    groups: [],
    users: [],
    reminders: [],
    user_groups: [],
  };
}

function now() {
  return new Date().toISOString();
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function normalizeDate(value) {
  if (value instanceof Date) return value.toISOString();
  return value;
}

function sameId(left, right) {
  return String(left) === String(right);
}

function ensureDatabaseFile() {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  if (!fs.existsSync(databasePath)) {
    fs.writeFileSync(databasePath, JSON.stringify(emptyDatabase(), null, 2));
  }
}

function loadDatabase() {
  ensureDatabaseFile();
  const raw = fs.readFileSync(databasePath, 'utf8');
  const data = raw.trim() ? JSON.parse(raw) : emptyDatabase();
  const defaults = emptyDatabase();

  data.sequences = { ...defaults.sequences, ...(data.sequences || {}) };
  data.groups = Array.isArray(data.groups) ? data.groups : [];
  data.users = Array.isArray(data.users) ? data.users : [];
  data.reminders = Array.isArray(data.reminders) ? data.reminders : [];
  data.user_groups = Array.isArray(data.user_groups) ? data.user_groups : [];

  return data;
}

function saveDatabase(data) {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const tempPath = `${databasePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
  fs.renameSync(tempPath, databasePath);
}

function sortByCreatedDesc(rows) {
  return rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

async function testConnection() {
  const data = loadDatabase();
  saveDatabase(data);
  return true;
}

async function upsertUser({ telegramUserId, username, firstName, lastName }) {
  const data = loadDatabase();
  const timestamp = now();
  let user = data.users.find((row) => sameId(row.telegram_user_id, telegramUserId));

  if (user) {
    user.username = username || null;
    user.first_name = firstName || null;
    user.last_name = lastName || null;
    user.updated_at = timestamp;
  } else {
    user = {
      id: data.sequences.users++,
      telegram_user_id: telegramUserId,
      username: username || null,
      first_name: firstName || null,
      last_name: lastName || null,
      timezone: 'Asia/Tashkent',
      language: 'ru',
      auto_delete_duration: 300,
      notification_enabled: true,
      created_at: timestamp,
      updated_at: timestamp,
    };
    data.users.push(user);
  }

  saveDatabase(data);
  return clone(user);
}

async function getUserById(telegramUserId) {
  const data = loadDatabase();
  return clone(data.users.find((row) => sameId(row.telegram_user_id, telegramUserId)) || null);
}

async function updateUserSettings(telegramUserId, settings) {
  const data = loadDatabase();
  const user = data.users.find((row) => sameId(row.telegram_user_id, telegramUserId));
  if (!user) return null;

  const allowedFields = ['timezone', 'language', 'auto_delete_duration', 'notification_enabled'];
  for (const field of allowedFields) {
    if (settings[field] !== undefined) user[field] = settings[field];
  }

  user.updated_at = now();
  saveDatabase(data);
  return clone(user);
}

async function upsertGroup({ telegramGroupId, title, username, addedBy }) {
  const data = loadDatabase();
  const timestamp = now();
  let group = data.groups.find((row) => sameId(row.telegram_group_id, telegramGroupId));

  if (group) {
    group.title = title;
    group.username = username || null;
    group.is_active = true;
    group.updated_at = timestamp;
  } else {
    group = {
      id: data.sequences.groups++,
      telegram_group_id: telegramGroupId,
      title,
      username: username || null,
      added_by: addedBy || null,
      is_active: true,
      created_at: timestamp,
      updated_at: timestamp,
    };
    data.groups.push(group);
  }

  saveDatabase(data);
  return clone(group);
}

async function addUserToGroup(userId, groupId) {
  const data = loadDatabase();
  const exists = data.user_groups.some((row) => sameId(row.user_id, userId) && sameId(row.group_id, groupId));

  if (!exists) {
    data.user_groups.push({
      user_id: userId,
      group_id: groupId,
      joined_at: now(),
    });
    saveDatabase(data);
  }
}

async function deactivateGroup(telegramGroupId) {
  const data = loadDatabase();
  const group = data.groups.find((row) => sameId(row.telegram_group_id, telegramGroupId));
  if (!group) return null;

  group.is_active = false;
  group.updated_at = now();
  saveDatabase(data);
  return clone(group);
}

async function getAllActiveGroups() {
  const data = loadDatabase();
  return clone(sortByCreatedDesc(data.groups.filter((row) => row.is_active === true)));
}

async function getGroupById(telegramGroupId) {
  const data = loadDatabase();
  return clone(data.groups.find((row) => sameId(row.telegram_group_id, telegramGroupId)) || null);
}

async function getUserActiveGroups(userId) {
  const data = loadDatabase();
  const groups = data.groups.filter((group) => {
    if (group.is_active !== true || Number(group.telegram_group_id) >= 0) return false;

    const joined = data.user_groups.some((row) => sameId(row.user_id, userId) && sameId(row.group_id, group.telegram_group_id));
    return joined || sameId(group.added_by, userId);
  });

  return clone(sortByCreatedDesc(groups));
}

async function createReminder({ userId, groupId, text, remindAt, recurrence = 'none' }) {
  const data = loadDatabase();
  const timestamp = now();
  const reminder = {
    id: data.sequences.reminders++,
    user_id: userId,
    group_id: groupId,
    text,
    remind_at: normalizeDate(remindAt),
    recurrence,
    status: 'pending',
    sent_message_id: null,
    created_at: timestamp,
    updated_at: timestamp,
  };

  data.reminders.push(reminder);
  saveDatabase(data);
  return clone(reminder);
}

async function updateReminder(id, updates) {
  const data = loadDatabase();
  const reminder = data.reminders.find((row) => sameId(row.id, id));
  if (!reminder) return null;

  for (const [key, value] of Object.entries(updates)) {
    reminder[key] = key === 'remind_at' ? normalizeDate(value) : value;
  }

  reminder.updated_at = now();
  saveDatabase(data);
  return clone(reminder);
}

function withGroupFields(data, reminder) {
  const group = data.groups.find((row) => sameId(row.telegram_group_id, reminder.group_id));
  if (!group) return null;

  return {
    ...reminder,
    group_title: group.title,
    telegram_group_id: group.telegram_group_id,
  };
}

async function getPendingReminders() {
  const data = loadDatabase();
  const dueAt = Date.now();
  const reminders = data.reminders
    .filter((row) => row.status === 'pending' && new Date(row.remind_at).getTime() <= dueAt)
    .map((row) => withGroupFields(data, row))
    .filter(Boolean)
    .sort((a, b) => new Date(a.remind_at) - new Date(b.remind_at));

  return clone(reminders);
}

async function getUserReminders(userId, status = null) {
  const data = loadDatabase();
  const reminders = data.reminders
    .filter((row) => sameId(row.user_id, userId))
    .filter((row) => (status ? row.status === status : row.status === 'pending'))
    .map((row) => withGroupFields(data, row))
    .filter(Boolean)
    .sort((a, b) => new Date(a.remind_at) - new Date(b.remind_at));

  return clone(reminders);
}

async function getReminderById(id, userId = null) {
  const data = loadDatabase();
  const reminder = data.reminders.find((row) => {
    if (!sameId(row.id, id)) return false;
    return userId ? sameId(row.user_id, userId) : true;
  });

  return clone(reminder ? withGroupFields(data, reminder) : null);
}

async function updateReminderStatus(id, status, sentMessageId = null) {
  const data = loadDatabase();
  const reminder = data.reminders.find((row) => sameId(row.id, id));
  if (!reminder) return null;

  reminder.status = status;
  if (sentMessageId !== null && sentMessageId !== undefined) {
    reminder.sent_message_id = sentMessageId;
  }
  reminder.updated_at = now();
  saveDatabase(data);
  return clone(reminder);
}

async function deleteReminder(id, userId) {
  const data = loadDatabase();
  const reminder = data.reminders.find((row) => (
    sameId(row.id, id) &&
    sameId(row.user_id, userId) &&
    row.status === 'pending'
  ));

  if (!reminder) return null;

  reminder.status = 'deleted';
  reminder.updated_at = now();
  saveDatabase(data);
  return clone(reminder);
}

module.exports = {
  databasePath,
  testConnection,
  upsertUser,
  getUserById,
  updateUserSettings,
  upsertGroup,
  addUserToGroup,
  deactivateGroup,
  getAllActiveGroups,
  getGroupById,
  getUserActiveGroups,
  createReminder,
  updateReminder,
  getPendingReminders,
  getUserReminders,
  getReminderById,
  updateReminderStatus,
  deleteReminder,
};
