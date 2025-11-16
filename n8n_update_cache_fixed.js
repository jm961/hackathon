/**
 * UPDATE CACHE (n8n-compatible version)
 * 
 * Prepares cache data for writing - outputs cache JSON as binary data
 * Use a "Write Binary File" node after this to save the cache
 */

const CACHE_FILE = '/home/node/dataset/enrichment_cache.json';
const MAX_CACHE_SIZE = 10000;

console.log('\n' + '='.repeat(80));
console.log('💾 CACHE UPDATER - Starting');
console.log('='.repeat(80));

// Get all items (both cached and newly enriched)
const items = $input.all();
console.log(`📦 Received ${items.length} items`);

// Load existing cache from previous execution context or start fresh
// In n8n, we'll read the cache file using a separate node before this
// For now, start with empty cache - the Read Cache File node should pass existing cache
let cache = {};

// Try to get existing cache from input (if Read Cache File passed it)
for (const item of items) {
  const json = item.json;
  // Check if this item contains the full cache object
  if (json && typeof json === 'object') {
    const keys = Object.keys(json);
    const hasIPKeys = keys.some(k => /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(k));
    if (hasIPKeys && keys.length > 10) {
      // This is likely the cache object
      cache = json;
      console.log(`💾 Found existing cache in input with ${keys.length} entries`);
      break;
    }
  }
}

const now = Date.now();
let newEntries = 0;
let updatedEntries = 0;
let skippedCached = 0;

// Add/update cache entries from newly enriched items
for (const item of items) {
  const json = item.json;
  
  // Skip items that came from cache (no need to re-cache)
  if (json._from_cache) {
    skippedCached++;
    continue;
  }
  
  // Get source IP
  const sourceIP = json.source_ip || json['Source IP Address'] || '';
  
  if (!sourceIP || !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(sourceIP)) {
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
      
      enrichment: json.enrichment || {},
      ai_summary: json.ai_summary || '',
      gpt_analysis: json.gpt_analysis || {},
      gemini_review: json.gemini_review || {},
      final_decision: json.final_decision || {},
      
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
  
  if (cache[sourceIP]) {
    updatedEntries++;
  } else {
    newEntries++;
  }
  
  cache[sourceIP] = cacheEntry;
}

// Enforce max cache size
const cacheSize = Object.keys(cache).length;
if (cacheSize > MAX_CACHE_SIZE) {
  console.log(`⚠️  Cache size (${cacheSize}) exceeds maximum (${MAX_CACHE_SIZE})`);
  const sortedEntries = Object.entries(cache)
    .sort(([, a], [, b]) => b.timestamp - a.timestamp)
    .slice(0, MAX_CACHE_SIZE);
  cache = Object.fromEntries(sortedEntries);
  console.log(`✅ Cache trimmed to ${Object.keys(cache).length} entries`);
}

console.log('\n✅ Cache prepared for writing!');
console.log(`   Total entries: ${Object.keys(cache).length}`);
console.log(`   New entries: ${newEntries}`);
console.log(`   Updated entries: ${updatedEntries}`);
console.log(`   Skipped (from cache): ${skippedCached}`);
console.log('='.repeat(80));

// Output cache as binary data for Write Binary File node
const cacheJSON = JSON.stringify(cache, null, 2);
const cacheBuffer = Buffer.from(cacheJSON, 'utf8');

// Return both the cache file AND pass through all items
return [
  {
    json: {
      filename: 'enrichment_cache.json',
      filepath: CACHE_FILE,
      cache_size: Object.keys(cache).length,
      new_entries: newEntries,
      updated_entries: updatedEntries
    },
    binary: {
      data: {
        data: cacheBuffer.toString('base64'),
        mimeType: 'application/json',
        fileName: 'enrichment_cache.json'
      }
    }
  },
  ...items  // Pass through all original items
];
