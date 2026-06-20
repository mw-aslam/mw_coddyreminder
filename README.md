# ReminderFlow Bot 🤖⏰

A production-ready Telegram bot that sends scheduled reminders to groups. Built with Node.js, Telegraf.js, and PostgreSQL.

---

## Features

- 📅 Create reminders with natural date input (`today`, `tomorrow`, `DD.MM.YYYY`)
- 👥 Supports multiple Telegram groups
- ⏰ Exact-time delivery via cron job (checks every minute)
- 🗑 Auto-deletes sent reminder messages after 5 minutes
- 📋 View and manage reminders per user
- ⚙️ Per-user settings (timezone, notifications)
- 🔒 SQL injection prevention, input validation, error handling

---

## Commands

| Command | Description |
|---|---|
| `/start` | Start the bot |
| `/help` | Help information |
| `/reminder` | Create a new reminder |
| `/myreminders` | View active reminders |
| `/delete` | Delete a reminder |
| `/groups` | View registered groups |
| `/settings` | Bot settings |
| `/cancel` | Cancel current operation |

---

## Quick Start

### Prerequisites

- Node.js >= 18
- PostgreSQL database (or Supabase)
- Telegram Bot Token from [@BotFather](https://t.me/BotFather)

### 1. Clone and Install

```bash
git clone https://github.com/yourname/reminderflow-bot.git
cd reminderflow-bot
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your BOT_TOKEN and database credentials
```

### 3. Initialize Database

```bash
# Option A: Using the migration script
npm run migrate

# Option B: Manually run schema.sql in your PostgreSQL client
psql -U postgres -d reminderflow -f schema.sql
```

### 4. Start the Bot

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

---

## Deployment

### Docker (Recommended)

```bash
# Copy and fill in your BOT_TOKEN
cp .env.example .env

# Start bot + PostgreSQL together
docker compose up -d

# View logs
docker compose logs -f bot
```

### PM2 (VPS / Ubuntu)

```bash
# Install PM2 globally
npm install -g pm2

# Start
pm2 start ecosystem.config.js

# Save and enable on reboot
pm2 save
pm2 startup
```

### Railway

1. Create a new project on [railway.app](https://railway.app)
2. Add a PostgreSQL plugin
3. Add your repo and set environment variables:
   - `BOT_TOKEN`
   - `DATABASE_URL` (auto-filled from Railway Postgres)
4. Deploy — Railway auto-detects Node.js

### Render

1. Create a new Web Service on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set `Build Command`: `npm install`
4. Set `Start Command`: `npm start`
5. Add environment variables in the Render dashboard
6. Create a PostgreSQL database in Render and link it

### Ubuntu VPS Manual

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Create database
sudo -u postgres psql -c "CREATE DATABASE reminderflow;"
sudo -u postgres psql -c "CREATE USER botuser WITH PASSWORD 'yourpassword';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE reminderflow TO botuser;"

# Clone and configure
git clone https://github.com/yourname/reminderflow-bot.git
cd reminderflow-bot
npm install
cp .env.example .env
# Edit .env

# Run migration
npm run migrate

# Start with PM2
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save && pm2 startup
```

---

## Project Structure

```
reminderflow-bot/
├── src/
│   ├── bot/
│   │   ├── commands/index.js       # All /command handlers
│   │   ├── handlers/
│   │   │   ├── callbackHandler.js  # Inline button callbacks
│   │   │   └── groupHandler.js     # Bot added/removed from group
│   │   └── middlewares/
│   │       ├── logger.js           # Request logging
│   │       └── user.js             # Auto-upsert user to DB
│   ├── database/
│   │   ├── db.js                   # PostgreSQL pool
│   │   ├── migrate.js              # Schema runner
│   │   └── repositories/
│   │       ├── groupRepository.js
│   │       ├── reminderRepository.js
│   │       └── userRepository.js
│   ├── handlers/
│   │   └── reminderHandler.js      # Multi-step reminder wizard
│   ├── jobs/
│   │   └── reminderJob.js          # Cron job (every 1 minute)
│   ├── keyboards/
│   │   └── groupKeyboard.js        # Inline keyboard builders
│   ├── services/
│   │   ├── groupService.js
│   │   ├── reminderService.js
│   │   └── userService.js
│   ├── utils/
│   │   ├── dateParser.js           # Date/time parsing utilities
│   │   └── logger.js               # Winston logger
│   ├── config/
│   │   └── config.js
│   ├── bot.js                      # Bot setup and middleware
│   └── index.js                    # Entry point
├── schema.sql                      # Database schema
├── Dockerfile
├── docker-compose.yml
├── ecosystem.config.js             # PM2 config
├── .env.example
└── package.json
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `BOT_TOKEN` | ✅ | — | Telegram bot token |
| `DATABASE_URL` | ✅* | — | Full PostgreSQL connection string |
| `DB_HOST` | ✅* | localhost | DB host (if not using DATABASE_URL) |
| `DB_PORT` | | 5432 | DB port |
| `DB_NAME` | | reminderflow | Database name |
| `DB_USER` | | postgres | DB user |
| `DB_PASSWORD` | ✅* | — | DB password |
| `NODE_ENV` | | development | `production` or `development` |
| `LOG_LEVEL` | | info | `debug`, `info`, `warn`, `error` |
| `AUTO_DELETE_DELAY` | | 300000 | Auto-delete delay in milliseconds |
| `DEFAULT_TIMEZONE` | | UTC | Default timezone |

*Either `DATABASE_URL` or individual `DB_*` variables required.

---

## Security Notes

- All user inputs are validated before database insertion
- Parameterized queries prevent SQL injection
- Invalid dates and times are rejected with helpful error messages
- Bot only responds to private messages for reminder creation
- Telegram API errors are caught and logged without crashing

---

## License

MIT
