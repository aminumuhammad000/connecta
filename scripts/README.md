# Connecta Backup Setup Guide

This guide explains how to set up automatic daily backups for your Dockerized microservices.

## 1. Prerequisites
- The backup script assumes you are running the stack via `docker-compose`.
- It uses `docker exec` so you **do not** need `pg_dump` or `mongodump` installed on your host machine.

## 2. Test the Script Manually
1. Make sure your Docker stack is running:
   ```bash
   docker-compose -f docker-compose.microservices.yml up -d
   ```
2. Run the backup script:
   ```bash
   ./scripts/backup.sh
   ```
3. Verify that a `backups` folder was created in your project root containing a `.tar.gz` file.

## 3. Setup Cron Job (Automatic Backup)
To run this script automatically every day at 2:00 AM:

1. Open crontab config:
   ```bash
   crontab -e
   ```
2. Add the following line (replace `/path/to/connecta` with your actual project path):
   ```bash
   0 2 * * * /path/to/connecta/scripts/backup.sh >> /path/to/connecta/backup.log 2>&1
   ```

## 4. Offsite Backups (Cloud)
To sync your local backups to Google Drive or S3, install `rclone` and configure it.

1. Install rclone:
   ```bash
   sudo apt install -y rclone
   rclone config
   # Follow prompts to set up 'gdrive' remote
   ```
2. Edit `scripts/backup.sh` and uncomment the cloud upload section (add this to the end of the script):
   ```bash
   # rclone copy "$TAR_FILE" gdrive:connecta-backups
   ```
