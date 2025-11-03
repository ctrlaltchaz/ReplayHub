# ReplayHub Server Management Scripts

This directory contains utility scripts for managing the ReplayHub application on the production server.

## Setup

After uploading to the server, make all scripts executable:

```bash
cd /var/www/IMPROVEDAPP/server-scripts
chmod +x *.sh
```

## Available Scripts

### �️ `setup-database.sh` / `setup-database.ps1` - Database Setup
Complete database initialization:
1. Test database connection
2. Create PostgreSQL extensions
3. Run Prisma migrations
4. Generate Prisma client
5. Apply Row-Level Security policies
6. Seed initial permissions

**Linux/macOS:**
```bash
./setup-database.sh
```

**Windows:**
```powershell
.\setup-database.ps1
```

**Prerequisites:**
- PostgreSQL installed and running
- `DATABASE_URL` configured in `.env` file
- `psql` command-line tool in PATH

After database setup, create a global admin user:
```bash
node scripts/create-admin-user.js
```

### �📊 `status.sh` - Check Service Status
View the status of all services, including PM2 processes, PostgreSQL, Nginx, and system resources.

```bash
./status.sh
```

### 🚀 `start.sh` - Start Services
Start all ReplayHub services using PM2.

```bash
./start.sh
```

### 🛑 `stop.sh` - Stop Services
Gracefully stop all ReplayHub services.

```bash
./stop.sh
```

### 🔄 `restart.sh` - Restart Services
Restart all services (useful after configuration changes).

```bash
./restart.sh
```

### 📥 `update.sh` - Update Application
Complete update process:
1. Stop services
2. Pull latest code from GitHub
3. Install dependencies
4. Run database migrations
5. Rebuild applications
6. Restart services

```bash
./update.sh
```

### 📝 `logs.sh` - View Live Logs
Show live logs from all services.

```bash
./logs.sh
```

Press `Ctrl+C` to exit.

### 💾 `backup-db.sh` - Database Backup
Create a backup of the PostgreSQL database.

```bash
./backup-db.sh
```

Backups are stored in `/var/backups/replayhub/` and old backups (>7 days) are automatically cleaned up.

## Quick Reference

```bash
# Check if everything is running
./status.sh

# View live logs
./logs.sh

# Update to latest version from GitHub
./update.sh

# Restart services
./restart.sh

# Create database backup
./backup-db.sh
```

## PM2 Commands

You can also use PM2 commands directly:

```bash
# View process list
pm2 list

# View logs for specific service
pm2 logs replayhub-api
pm2 logs replayhub-web

# Restart specific service
pm2 restart replayhub-api

# Monitor resource usage
pm2 monit

# View detailed process info
pm2 show replayhub-api
```

## Troubleshooting

If services don't start:

```bash
# Check logs for errors
pm2 logs

# Check PM2 process status
pm2 status

# Check if ports are in use
sudo netstat -tlnp | grep -E '3000|3001'

# Check PostgreSQL
sudo systemctl status postgresql

# Check Nginx
sudo systemctl status nginx
```

## Automated Backups

To set up automatic daily backups, add to crontab:

```bash
crontab -e
# Add this line:
0 2 * * * /var/www/IMPROVEDAPP/server-scripts/backup-db.sh
```

This will run a backup every day at 2:00 AM.
