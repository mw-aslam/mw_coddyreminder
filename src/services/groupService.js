const groupRepository = require('../database/repositories/groupRepository');
const logger = require('../utils/logger');

async function registerGroup(ctx, chat) {
  try {
    const addedBy = ctx.from ? ctx.from.id : null;
    const group = await groupRepository.upsertGroup({
      telegramGroupId: chat.id,
      title: chat.title,
      username: chat.username,
      addedBy,
    });
    // Also track the user who added the bot as a member of this group
    if (addedBy && chat.id < 0) {
      await groupRepository.addUserToGroup(addedBy, chat.id);
    }
    logger.info(`Group registered: ${chat.title} (${chat.id})`);
    return group;
  } catch (err) {
    logger.error(`Failed to register group ${chat.id}:`, err);
    throw err;
  }
}

async function addUserToGroup(userId, groupId) {
  try {
    await groupRepository.addUserToGroup(userId, groupId);
  } catch (err) {
    logger.error(`Failed to add user ${userId} to group ${groupId}:`, err);
  }
}

async function deactivateGroup(groupId) {
  try {
    const group = await groupRepository.deactivateGroup(groupId);
    logger.info(`Group deactivated: ${groupId}`);
    return group;
  } catch (err) {
    logger.error(`Failed to deactivate group ${groupId}:`, err);
    throw err;
  }
}

async function getActiveGroups() {
  return groupRepository.getAllActiveGroups();
}

async function getGroup(groupId) {
  return groupRepository.getGroupById(groupId);
}

async function getUserActiveGroups(userId) {
  return groupRepository.getUserActiveGroups(userId);
}

module.exports = { registerGroup, deactivateGroup, getActiveGroups, getUserActiveGroups, getGroup, addUserToGroup };
