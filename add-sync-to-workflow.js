#!/usr/bin/env node

/**
 * Script to add a sync command to the n8n workflow
 * This will add an Execute Command node that runs the sync script after data is written
 */

const fs = require('fs');
const path = require('path');

const WORKFLOW_PATH = '/home/segfaultslayers/Downloads/hackathon/n8n_workflow_with_cache.json';
const OUTPUT_PATH = '/home/segfaultslayers/HACKATHON/n8n_workflow_with_sync.json';

console.log('📖 Reading workflow...');
const workflow = JSON.parse(fs.readFileSync(WORKFLOW_PATH, 'utf8'));

// Add new Execute Command node
const syncNode = {
  "parameters": {
    "command": "bash /home/segfaultslayers/HACKATHON/sync-data.sh",
    "options": {}
  },
  "type": "n8n-nodes-base.executeCommand",
  "typeVersion": 1,
  "position": [
    712,
    32
  ],
  "id": "sync-data-command",
  "name": "Sync Data to Website",
  "alwaysOutputData": true,
  "notes": "Copies processed data to website public directory and creates metadata timestamp"
};

// Add the node to the workflow
workflow.nodes.push(syncNode);

// Update connections: Write Website JSON -> Sync Data to Website
workflow.connections["Write Website JSON"] = {
  "main": [
    [
      {
        "node": "Sync Data to Website",
        "type": "main",
        "index": 0
      }
    ]
  ]
};

// Add empty connection for the new node (it's the last node)
workflow.connections["Sync Data to Website"] = {
  "main": [[]]
};

console.log('✅ Added "Sync Data to Website" node');
console.log('✅ Updated connections');

// Write the updated workflow
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(workflow, null, 2));
console.log(`✅ Updated workflow saved to: ${OUTPUT_PATH}`);
console.log('');
console.log('📋 Next steps:');
console.log('1. Import this workflow into n8n (replace existing workflow)');
console.log('2. Make sure the sync-data.sh script has proper permissions');
console.log('3. Test the workflow to ensure sync works correctly');

