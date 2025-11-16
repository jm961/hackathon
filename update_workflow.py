#!/usr/bin/env python3
"""
Update n8n workflow to add sync command after data write
"""

import json
import sys

# Read the workflow
with open('/home/segfaultslayers/Downloads/hackathon/n8n_workflow_with_cache.json', 'r') as f:
    workflow = json.load(f)

print(f"📖 Loaded workflow with {len(workflow['nodes'])} nodes")

# Add Execute Command node to sync data
sync_node = {
    "parameters": {
        "command": "bash /home/segfaultslayers/HACKATHON/sync-data.sh",
        "options": {}
    },
    "type": "n8n-nodes-base.executeCommand",
    "typeVersion": 1,
    "position": [712, 32],
    "id": "sync-data-to-website",
    "name": "Sync Data to Website",
    "alwaysOutputData": True,
    "notes": "Copies processed data to website public directory and creates metadata timestamp for automatic updates"
}

# Add the node
workflow['nodes'].append(sync_node)
print("✅ Added 'Sync Data to Website' node")

# Update connections: Write Website JSON -> Sync Data to Website
workflow['connections']['Write Website JSON'] = {
    "main": [[{
        "node": "Sync Data to Website",
        "type": "main",
        "index": 0
    }]]
}

# Add connection for new node (terminal node)
workflow['connections']['Sync Data to Website'] = {
    "main": [[]]
}

print("✅ Updated workflow connections")

# Write updated workflow
output_path = '/home/segfaultslayers/HACKATHON/n8n_workflow_UPDATED.json'
with open(output_path, 'w') as f:
    json.dump(workflow, f, indent=2)

print(f"✅ Updated workflow saved to: {output_path}")
print("\n📋 Next steps:")
print("1. Import this workflow into n8n (http://localhost:5678)")
print("2. Replace the existing workflow")
print("3. Run the workflow to test automatic sync")
print("4. Check the website to see automatic updates!")

