#!/bin/bash
# File watcher that detects sync trigger and copies data to website

DATASET_DIR="/home/segfaultslayers/HACKATHON/DATASET"
TRIGGER_FILE="$DATASET_DIR/sync_trigger.json"
LAST_SYNC_TIME=0

echo "🔍 Watching for sync triggers in $DATASET_DIR"
echo "Press Ctrl+C to stop"

while true; do
    if [ -f "$TRIGGER_FILE" ]; then
        # Get file modification time
        CURRENT_TIME=$(stat -c %Y "$TRIGGER_FILE" 2>/dev/null || stat -f %m "$TRIGGER_FILE" 2>/dev/null)
        
        # Check if file was modified since last sync
        if [ "$CURRENT_TIME" -gt "$LAST_SYNC_TIME" ]; then
            echo ""
            echo "🔔 Sync trigger detected! Running sync..."
            bash /home/segfaultslayers/HACKATHON/sync-data.sh
            LAST_SYNC_TIME=$CURRENT_TIME
            echo "✅ Sync completed at $(date)"
            echo ""
        fi
    fi
    
    # Check every 2 seconds
    sleep 2
done

