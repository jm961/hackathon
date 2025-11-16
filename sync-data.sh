#!/bin/bash

# Sync script to copy threat analysis data from DATASET to website public directory
# This script is triggered by n8n workflow after data processing completes

SOURCE_DIR="/home/segfaultslayers/HACKATHON/DATASET"
TARGET_DIR="/home/segfaultslayers/HACKATHON/threat-compass/public"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "🔄 Starting data sync at $TIMESTAMP..."

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Copy the JSON file
if [ -f "$SOURCE_DIR/threat_analysis_results_website.json" ]; then
    cp "$SOURCE_DIR/threat_analysis_results_website.json" "$TARGET_DIR/threat_analysis_results.json"
    echo "✅ Copied JSON file"
else
    echo "⚠️  Warning: threat_analysis_results_website.json not found"
fi

# Copy the CSV file if it exists
if [ -f "$SOURCE_DIR/threat_analysis_results.csv" ]; then
    cp "$SOURCE_DIR/threat_analysis_results.csv" "$TARGET_DIR/threat_analysis_results.csv"
    echo "✅ Copied CSV file"
fi

# Create metadata file with timestamp
cat > "$TARGET_DIR/data-metadata.json" <<EOF
{
  "lastUpdated": "$TIMESTAMP",
  "lastUpdatedTimestamp": $(date +%s),
  "source": "n8n-workflow",
  "filesAvailable": {
    "json": $([ -f "$SOURCE_DIR/threat_analysis_results_website.json" ] && echo "true" || echo "false"),
    "csv": $([ -f "$SOURCE_DIR/threat_analysis_results.csv" ] && echo "true" || echo "false")
  }
}
EOF

echo "✅ Created metadata file with timestamp: $TIMESTAMP"
echo "🎉 Data sync completed successfully!"

