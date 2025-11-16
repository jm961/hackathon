/**
 * UPDATE CACHE
 * 
 * Updates the enrichment_cache.json file with newly enriched data
 * This runs AFTER API enrichment and AI analysis are complete
 * 
 * Cache Structure:
 * {
 *   "IP_ADDRESS": {
 *     "timestamp": 1234567890,
 *     "data": { ...enriched data... }
 *   }
 * }
 */

const fs = require('fs');
const path = require('path');

const CACHE_FILE = '/home/node/dataset/enrichment_cache.json';
const MAX_CACHE_SIZE = 10000; // Maximum number of IPs to cache

console.log('\n' + '='.repeat(80));
console.log('💾 CACHE UPDATER - Starting');
console.log('='.repeat(80));

// Get newly enriched items (from API pipeline)
const items = $input.all();
console.log(`📦 Received ${items.length} newly enriched items to cache`);

// Load existing cache
let cache = {};
try {
  if (fs.existsSync(CACHE_FILE)) {
    const cacheContent = fs.readFileSync(CACHE_FILE, 'utf8');
    cache = JSON.parse(cacheContent);
    console.log(`💾 Loaded existing cache with ${Object.keys(cache).length} entries`);
  } else {
    console.log('📝 Creating new cache file');
  }
} catch (error) {
  console.error('❌ Error loading cache:', error.message);
  console.log('📝 Starting with empty cache');
  cache = {};
}

const now = Date.now();
let newEntries = 0;
let updatedEntries = 0;

// Add/update cache entries
for (const item of items) {
  const json = item.json;
  
  // Skip items that came from cache (no need to re-cache)
  if (json._from_cache) {
    continue;
  }
  
  // Get source IP
  const sourceIP = json.source_ip || json['Source IP Address'] || '';
  
  if (!sourceIP || !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(sourceIP)) {
    console.warn(`⚠️  Skipping invalid IP: ${sourceIP}`);
    continue;
  }
  
  // Create cache entry
  const cacheEntry = {
    timestamp: now,
    data: {
      source_ip: sourceIP,
      destination_ip: json.destination_ip || json.dest_ip || '',
      destination_port: json.destination_port || json.port || '',
      protocol: json.protocol || '',
      timestamp: json.timestamp || new Date().toISOString(),
      anomaly_score: json.anomaly_score || '',
      attack_type: json.attack_type || '',
      severity_level: json.severity_level || '',
      
      // Enrichment data
      enrichment: json.enrichment || {},
      
      // AI analysis
      ai_summary: json.ai_summary || '',
      gpt_analysis: json.gpt_analysis || {},
      gemini_review: json.gemini_review || {},
      final_decision: json.final_decision || {},
      
      // Extracted fields
      country: json.country || '',
      city: json.city || '',
      isp: json.isp || '',
      abuse_score: json.abuse_score || 0,
      otx_pulses: json.otx_pulses || 0,
      risk_score: json.risk_score || 0,
      threat_level: json.threat_level || '',
      risk_factors: json.risk_factors || [],
      
      gpt_verdict: json.gpt_verdict || '',
      gpt_confidence: json.gpt_confidence || '',
      gpt_threat_level: json.gpt_threat_level || '',
      
      gemini_verdict: json.gemini_verdict || '',
      gemini_confidence: json.gemini_confidence || '',
      gemini_agreement: json.gemini_agreement || '',
      
      final_verdict: json.final_verdict || '',
      final_confidence: json.final_confidence || '',
      final_threat_level: json.final_threat_level || '',
      final_recommended_action: json.final_recommended_action || '',
      final_reasoning: json.final_reasoning || ''
    }
  };
  
  // Check if this is new or update
  if (cache[sourceIP]) {
    updatedEntries++;
    console.log(`🔄 Updating cache for: ${sourceIP}`);
  } else {
    newEntries++;
    console.log(`✨ New cache entry for: ${sourceIP}`);
  }
  
  cache[sourceIP] = cacheEntry;
}

// Enforce max cache size (remove oldest entries if needed)
const cacheSize = Object.keys(cache).length;
if (cacheSize > MAX_CACHE_SIZE) {
  console.log(`⚠️  Cache size (${cacheSize}) exceeds maximum (${MAX_CACHE_SIZE})`);
  console.log('🧹 Removing oldest entries...');
  
  // Sort by timestamp and keep only the newest entries
  const sortedEntries = Object.entries(cache)
    .sort(([, a], [, b]) => b.timestamp - a.timestamp)
    .slice(0, MAX_CACHE_SIZE);
  
  cache = Object.fromEntries(sortedEntries);
  console.log(`✅ Cache trimmed to ${Object.keys(cache).length} entries`);
}

// Write updated cache
try {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
  console.log('\n✅ Cache updated successfully!');
  console.log(`   Total entries: ${Object.keys(cache).length}`);
  console.log(`   New entries: ${newEntries}`);
  console.log(`   Updated entries: ${updatedEntries}`);
} catch (error) {
  console.error('❌ Error writing cache:', error.message);
  throw error;
}

console.log('='.repeat(80) + '\n');

// Pass through all items (including cached ones)
return items;

