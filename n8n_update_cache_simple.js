/**
 * UPDATE CACHE (Simple version - outputs cache JSON)
 * Use Execute Command node after this to write the file
 */

const MAX_CACHE_SIZE = 10000;
const now = Date.now();

console.log('\n' + '='.repeat(80));
console.log('💾 CACHE UPDATER - Starting');
console.log('='.repeat(80));

// Get all items
const items = $input.all();
console.log(`📦 Received ${items.length} items`);

// Start with empty cache - will be merged with existing cache
// The existing cache should be loaded by Read Cache File node earlier
let cache = {};

// Try to find existing cache in input (from Read Cache File node)
for (const item of items) {
  const json = item.json;
  if (json && typeof json === 'object') {
    const keys = Object.keys(json);
    const hasIPKeys = keys.some(k => /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(k));
    if (hasIPKeys && keys.length > 5) {
      cache = json;
      console.log(`💾 Found existing cache with ${keys.length} entries`);
      break;
    }
  }
}

let newEntries = 0;
let updatedEntries = 0;

// Add/update cache entries
for (const item of items) {
  const json = item.json;
  
  if (json._from_cache) continue;
  
  const sourceIP = json.source_ip || json['Source IP Address'] || '';
  if (!sourceIP || !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(sourceIP)) continue;
  
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

// Trim if needed
if (Object.keys(cache).length > MAX_CACHE_SIZE) {
  const sorted = Object.entries(cache)
    .sort(([, a], [, b]) => b.timestamp - a.timestamp)
    .slice(0, MAX_CACHE_SIZE);
  cache = Object.fromEntries(sorted);
}

console.log(`✅ Cache prepared: ${Object.keys(cache).length} entries`);
console.log(`   New: ${newEntries}, Updated: ${updatedEntries}`);
console.log('='.repeat(80));

// Output cache JSON as string for Execute Command node
const cacheJSON = JSON.stringify(cache, null, 2);

// Return cache JSON in first item, then pass through all items
return [
  {
    json: {
      cache_json: cacheJSON,
      cache_file_path: '/home/node/dataset/enrichment_cache.json',
      cache_size: Object.keys(cache).length
    }
  },
  ...items
];
