#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# SOS Portal — Database Backup Script
# 
# Setup: chmod +x backup.sh
# Manual run: ./backup.sh
# Schedule (daily 2am): add to crontab with:
#   0 2 * * * /var/www/sosportal/backup.sh >> /var/log/sos-backup.log 2>&1
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

DATE=$(date +%Y-%m-%d_%H-%M)
BACKUP_DIR="/var/backups/sosportal"
FILENAME="sosportal_backup_${DATE}.sql.gz"
DB_NAME="sosportal"
DB_USER="sosapp"
KEEP_DAYS=14

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting backup..."

# Run the backup
pg_dump -U "$DB_USER" -h localhost "$DB_NAME" | gzip > "${BACKUP_DIR}/${FILENAME}"

# Check the backup file was created and has content
if [ -s "${BACKUP_DIR}/${FILENAME}" ]; then
    SIZE=$(du -sh "${BACKUP_DIR}/${FILENAME}" | cut -f1)
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup completed: ${FILENAME} (${SIZE})"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Backup file is empty or missing!"
    exit 1
fi

# Delete backups older than KEEP_DAYS days
DELETED=$(find "$BACKUP_DIR" -name "*.sql.gz" -mtime +${KEEP_DAYS} -print -delete | wc -l)
if [ "$DELETED" -gt 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Removed ${DELETED} old backup(s) (older than ${KEEP_DAYS} days)"
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Done. Backups stored in: ${BACKUP_DIR}"
