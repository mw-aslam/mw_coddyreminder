module.exports = {
  start_greeting: "👋 *Hello, {name}!*",
  start_desc: "I'm *Coddy Reminder* — I help you send scheduled reminders to Telegram groups and yourself.\n\n*Quick Start:*\n1️⃣ Add me to your group(s) or use me here\n2️⃣ Use /reminder to create a reminder\n3️⃣ I'll send the message at the right time!\n\nUse /help for full command list.",
  help_text: "📖 *Coddy Reminder — Help*\n\n*Commands:*\n/reminder — Create a new reminder\n/myreminders — View your active reminders\n/delete — Delete a reminder\n/groups — View registered groups\n/settings — Bot settings\n/cancel — Cancel current operation",

  step_text: "📝 *Step 1/5 — Reminder Text*\n\nWhat should I remind you about?\n\nExample: _Frontend project deadline_",
  step_text_error: "❌ Reminder text must be between 1 and 1000 characters.",

  step_date: "📅 *Step 2/5 — Date*\n\nWhen should I send this reminder?\n\nFormats:\n• `{today}`\n• `{today_iso}`\n• `today`",
  step_date_error: "❌ Invalid date format. Use:\n• `{today}`\n• `today`",

  step_time: "🕒 *Step 3/5 — Time*\n\nAt what time? Examples: `{time1}`, `{time2}`",
  step_time_error: "❌ Invalid time. Use HH:MM format (e.g. `{time1}`).",
  step_time_past_error: "❌ This time has already passed. Please enter a future time.",

  step_group: "👥 *Step 5/5 — Select Target*\n\nWhere should I send this reminder?",
  no_groups: "No groups found. Add me to a Telegram group first.",
  private_chat: "👤 Private Message (Here)",

  confirm_title: "📋 *Confirm Reminder*",
  confirm_reminder: "📝 *Message:*",
  confirm_date: "📅 *Date:*",
  confirm_time: "🕒 *Time:*",
  confirm_target: "📍 *Send to:*",

  success: "✅ *Reminder saved!*\n\n🆔 #{id}\n📝 {text}\n\n📅 {date}  🕒 {time}\n📍 {target}\n\nView all: /myreminders",
  failed: "❌ Failed to create reminder. Please try again.",
  cancelled: "❌ Cancelled. Use /reminder to start over.",

  no_reminders: "📭 No active reminders.\n\nCreate one with /reminder",
  status: "📊 Status:",

  delete_select: "🗑 *Select reminder to delete:*",
  delete_success: "✅ Reminder #{id} deleted.",

  groups_empty: "📭 No groups found.\n\nAdd me to a Telegram group and I'll register it.",
  groups_title: "👥 *Registered Groups:*\n\n",

  settings_title: "⚙️ *Settings*\n\n🌍 Language: *{lang}*\n⏱ Auto-delete: *{autoDelete} min*\n\nChoose what to change:",
  settings_lang_updated: "✅ Language changed to English! 🇬🇧",
  settings_autodelete_prompt: "⏱ *Auto-delete Duration*\n\nChoose how long before reminders are deleted after being sent:",

  private_only: "Use this command in a private chat with me.",
  unknown_cmd: "I didn't understand that. Use /help to see commands.",

  btn_confirm: "✅ Confirm",
  btn_cancel: "❌ Cancel",
  btn_delete: "🗑 Delete",
  btn_autodelete: "⏱ Auto-delete",
  btn_language: "🌍 Language",

  reminder_header: "🔔 *REMINDER*",
  msg_text: "📝 Text:",
  msg_date: "📅 Date:",
  msg_time: "🕒 Time:",
  notif_enabled: "✅ On",
  notif_disabled: "❌ Off",
  btn_back: "🔙 Back",

  // Recurrence
  step_recurrence: "🔄 *Step 4/5 — Recurrence*\n\nHow often should this reminder repeat?",
  rec_none: "🚫 Once",
  rec_daily: "🔄 Daily",
  rec_weekdays: "📅 Weekdays",
  rec_weekly: "📆 Weekly",
  
  // Editing
  edit_select: "✏️ *What would you like to edit?*",
  btn_edit: "✏️ Edit",
  btn_edit_text: "📝 Text",
  btn_edit_date: "📅 Date",
  btn_edit_time: "🕒 Time",
  edit_text_prompt: "📝 Enter new reminder text:",
  edit_date_prompt: "📅 Enter new date (e.g., `today`, `tomorrow`, `31.12.2026`):",
  edit_time_prompt: "🕒 Enter new time (e.g., `08:00`, `14:30`):",
  edit_success: "✅ Reminder updated successfully!",
  error_not_found: "Reminder not found.",
  error_occurred: "An error occurred.",
  remind_usage: "Usage: `/remind HH:MM Text`",
  autodelete_custom_prompt: "⏱ *Custom duration*\n\nAfter how many minutes should reminders be deleted? (enter a number, e.g. `15`)",
  autodelete_set: "✅ Auto-delete: *{min} min*",
  btn_custom: "✏️ Custom",
  autodelete_invalid: "Enter a number between 1 and 10080 (max 1 week).",
};
