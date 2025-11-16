#!/usr/bin/env node

/**
 * Sync script to copy threat analysis data from DATASET to website public directory
 * This script is triggered by n8n workflow after data processing completes
 * 
 * Can be executed from n8n using Execute Command node
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = '/home/node/dataset';
const TARGET_DIR = '/home/segfaultslayers/HACKATHON/threat-compass/public';

async function syncData() {
  const timestamp = new Date().toISOString();
  
  console.log(`🔄 Starting data sync at ${timestamp}...`);
  
  // Create target directory if it doesn't exist
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }
  
  const filesStatus = {
    json: false,
    csv: false
  };
  
  // Copy the JSON file
  const sourceJson = path.join(SOURCE_DIR, 'threat_analysis_results_website.json');
  const targetJson = path.join(TARGET_DIR, 'threat_analysis_results.json');
  
  if (fs.existsSync(sourceJson)) {
    fs.copyFileSync(sourceJson, targetJson);
    filesStatus.json = true;
    console.log('✅ Copied JSON file');
  } else {
    console.log('⚠️  Warning: threat_analysis_results_website.json not found');
  }
  
  // Copy the CSV file if it exists
  const sourceCsv = path.join(SOURCE_DIR, 'threat_analysis_results.csv');
  const targetCsv = path.join(TARGET_DIR, 'threat_analysis_results.csv');
  
  if (fs.existsSync(sourceCsv)) {
    fs.copyFileSync(sourceCsv, targetCsv);
    filesStatus.csv = true;
    console.log('✅ Copied CSV file');
  }
  
  // Create metadata file with timestamp
  const metadata = {
    lastUpdated: timestamp,
    lastUpdatedTimestamp: Math.floor(Date.now() / 1000),
    source: 'n8n-workflow',
    filesAvailable: filesStatus
  };
  
  const metadataPath = path.join(TARGET_DIR, 'data-metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  
  console.log(`✅ Created metadata file with timestamp: ${timestamp}`);
  console.log('🎉 Data sync completed successfully!');
  
  return metadata;
}

// Run sync if called directly
if (require.main === module) {
  syncData()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Sync failed:', err);
      process.exit(1);
    });
}

module.exports = { syncData };

