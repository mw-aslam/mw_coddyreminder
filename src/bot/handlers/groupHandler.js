const groupService = require('../../services/groupService');
const logger = require('../../utils/logger');

async function handleMyChatMember(ctx) {
  const { chat, new_chat_member, old_chat_member } = ctx.myChatMember;

  // Only handle group/supergroup chats
  if (!['group', 'supergroup'].includes(chat.type)) return;

  const wasActive = old_chat_member?.status && !['kicked', 'left'].includes(old_chat_member.status);
  const isNowActive = new_chat_member?.status && !['kicked', 'left'].includes(new_chat_member.status);

  if (!wasActive && isNowActive) {
    // Bot was added to group — register silently, NO welcome message
    try {
      await groupService.registerGroup(ctx, chat);
      logger.info(`Bot added to group: ${chat.title} (${chat.id})`);
    } catch (err) {
      logger.error(`Failed to register group ${chat.id}:`, err);
    }
  } else if (wasActive && !isNowActive) {
    // Bot was removed from group
    try {
      await groupService.deactivateGroup(chat.id);
      logger.info(`Bot removed from group: ${chat.title} (${chat.id})`);
    } catch (err) {
      logger.error(`Failed to deactivate group ${chat.id}:`, err);
    }
  }
}

async function handleChatMember(ctx) {
  // Handle new members joining if needed in the future
}

module.exports = { handleMyChatMember, handleChatMember };
