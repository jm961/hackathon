#!/bin/bash
# Script to copy threat analysis results to website public folder
# Checks multiple source locations and copies the most recent file

SOURCE1="/home/node/dataset/threat_analysis_results_website.json"
SOURCE2="/home/node/dataset/threat_analysis_results.json"
SOURCE3="/home/segfaultslayers/HACKATHON/DATASET/threat_analysis_results.json"
TARGET_FILE="/home/segfaultslayers/HACKATHON/threat-compass/public/threat_analysis_results.json"
TARGET_DIR="/home/segfaultslayers/HACKATHON/threat-compass/public"

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Find the most recent source file
SOURCE_FILE=""
LATEST_TIME=0

for src in "$SOURCE1" "$SOURCE2" "$SOURCE3"; do
    if [ -f "$src" ]; then
        FILE_TIME=$(stat -f%m "$src" 2>/dev/null || stat -c%Y "$src" 2>/dev/null)
        if [ "$FILE_TIME" -gt "$LATEST_TIME" ]; then
            LATEST_TIME=$FILE_TIME
            SOURCE_FILE="$src"
        fi
    fi
done

# Copy file if source exists
if [ -n "$SOURCE_FILE" ] && [ -f "$SOURCE_FILE" ]; then
    # Remove target if it's a symlink
    [ -L "$TARGET_FILE" ] && rm "$TARGET_FILE"
    
    cp "$SOURCE_FILE" "$TARGET_FILE"
    FILE_SIZE=$(stat -f%z "$TARGET_FILE" 2>/dev/null || stat -c%s "$TARGET_FILE" 2>/dev/null)
    RECORD_COUNT=$(jq '. | length' "$TARGET_FILE" 2>/dev/null || echo "unknown")
    echo "✅ Copied threat data to website: $(date)"
    echo "📊 Source: $SOURCE_FILE"
    echo "📊 File size: $FILE_SIZE bytes"
    echo "📊 Records: $RECORD_COUNT"
else
    echo "⚠️ No source file found in any location"
    echo "   Checked: $SOURCE1"
    echo "   Checked: $SOURCE2"
    echo "   Checked: $SOURCE3"
    exit 1
fi

