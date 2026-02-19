#!/bin/bash

# Connecta Microservices Backup Script
# This script uses 'docker exec' to dump databases from running containers.
# No need to install pg_dump or mongodump on the host machine.

# --- Configuration ---
BACKUP_ROOT="./backups"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="$BACKUP_ROOT/$DATE"
RETENTION_DAYS=7

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "=========================================="
echo "Starting Connecta Backup: $DATE"
echo "=========================================="

# --- PostgreSQL Backups ---
echo "--> Backing up PostgreSQL services..."

# 1. Auth Service DB
# Container: connecta-auth-db-1 (or similar, widely depends on folder name. Using label or name if specific)
# We assume the container name defined in docker-compose is 'auth-db' 
# Depending on how docker-compose names containers, it might be 'connecta-auth-db-1'. 
# We'll try to find it dynamically or assume 'connecta-auth-db-1' if running from 'connecta' folder.
# Better approach: Use 'docker exec' on the service name if using 'docker-compose exec', but that creates TTY issues in cron.
# We will use 'docker exec' with the likely container name pattern.

# Helper function to find container by service name substring
get_container_id() {
  docker ps --format '{{.Names}}' | grep "$1" | head -n 1
}

AUTH_DB_CONTAINER=$(get_container_id "auth-db")
PROPOSAL_DB_CONTAINER=$(get_container_id "proposal-db")
REWARDS_DB_CONTAINER=$(get_container_id "rewards-db")
MONGO_CONTAINER=$(get_container_id "mongo")

if [ -z "$AUTH_DB_CONTAINER" ]; then 
  echo "❌ Error: Auth DB container not found."
else
  echo "   Snapshotting Auth DB ($AUTH_DB_CONTAINER)..."
  docker exec -t "$AUTH_DB_CONTAINER" pg_dump -U connecta_auth connecta_auth > "$BACKUP_DIR/auth_db.sql"
fi

if [ -z "$PROPOSAL_DB_CONTAINER" ]; then 
  echo "❌ Error: Proposal DB container not found."
else
  echo "   Snapshotting Proposal DB ($PROPOSAL_DB_CONTAINER)..."
  docker exec -t "$PROPOSAL_DB_CONTAINER" pg_dump -U connecta_proposals connecta_proposals > "$BACKUP_DIR/proposal_db.sql"
fi

if [ -z "$REWARDS_DB_CONTAINER" ]; then 
  echo "❌ Error: Rewards DB container not found."
else
  echo "   Snapshotting Rewards DB ($REWARDS_DB_CONTAINER)..."
  docker exec -t "$REWARDS_DB_CONTAINER" pg_dump -U connecta_rewards connecta_rewards > "$BACKUP_DIR/rewards_db.sql"
fi

# --- MongoDB Backups ---
echo "--> Backing up MongoDB services..."

if [ -z "$MONGO_CONTAINER" ]; then
  echo "❌ Error: Mongo container not found."
else
  echo "   Snapshotting Mongo DBs ($MONGO_CONTAINER)..."
  # Authentication required for admin
  # Use --archive to dump to stdout
  docker exec -t "$MONGO_CONTAINER" mongodump --username admin --password password --authenticationDatabase admin --db connecta_profiles --archive > "$BACKUP_DIR/connecta_profiles.dump"
  docker exec -t "$MONGO_CONTAINER" mongodump --username admin --password password --authenticationDatabase admin --db connecta_jobs --archive > "$BACKUP_DIR/connecta_jobs.dump"
fi

# --- Compression ---
echo "--> Compressing backups..."
TAR_FILE="$BACKUP_ROOT/connecta_backup_$DATE.tar.gz"
tar -czf "$TAR_FILE" -C "$BACKUP_ROOT" "$DATE"

# --- Cleanup ---
echo "--> Cleaning up..."
# Remove the raw directory
rm -rf "$BACKUP_DIR"

# Delete backups older than RETENTION_DAYS
find "$BACKUP_ROOT" -type f -name "connecta_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup Completed Successfully: $TAR_FILE"
echo "=========================================="
