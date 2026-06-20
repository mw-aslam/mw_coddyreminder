const userRepository = require('../database/repositories/userRepository');
const logger = require('../utils/logger');

async function ensureUser(from) {
  try {
    return await userRepository.upsertUser({
      telegramUserId: from.id,
      username: from.username,
      firstName: from.first_name,
      lastName: from.last_name,
    });
  } catch (err) {
    logger.error(`Failed to upsert user ${from.id}:`, err);
    throw err;
  }
}

async function getUser(telegramUserId) {
  return userRepository.getUserById(telegramUserId);
}

async function updateSettings(telegramUserId, settings) {
  return userRepository.updateUserSettings(telegramUserId, settings);
}

module.exports = { ensureUser, getUser, updateSettings };
