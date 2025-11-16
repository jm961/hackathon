/**
 * N8N CACHE CHECKER
 * 
 * This checks if incoming IPs exist in the cache and routes accordingly:
 * - Cache HIT: Send to output 0 (skip APIs, use cached data)
 * - Cache MISS: Send to output 1 (send to API enrichment)
 * 
 * IMPORTANT: Place this AFTER the Merge node that combines:
 * - Input 0: Fresh CSV logs (from Read CSV)
 * - Input 1: Cache data (from Read Cache File)
 */

// Configuration
const CACHE_TTL_DAYS = 7;
const CACHE_TTL_MS = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;
const now = Date.now();

console.log('\n' + '='.repeat(80));
console.log('🔍 CACHE CHECKER - Starting');
console.log('='.repeat(80));

// Get input data
const items = $input.all();
console.log(`📦 Total items received: ${items.length}`);

// Build cache map from enrichment_cache.json
// The cache file structure is: { "IP": { timestamp, data }, ... }
const cacheMap = new Map();
const logEntries = [];

// Separate cache data from log entries
for (const item of items) {
  const json = item.json;
  
  // Check if this is cache data (from Read Cache File node)
  // Cache items have the structure: { "IP_ADDRESS": { timestamp, data } }
  if (json && typeof json === 'object') {
    const keys = Object.keys(json);
    
    // If we have IP-like keys at the root level, this is cache data
    const hasIPKeys = keys.some(k => /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(k));
    
    if (hasIPKeys) {
      // This is the cache object
      console.log(`💾 Found cache object with ${keys.length} cached IPs`);
      
      for (const ip of keys) {
        const cacheEntry = json[ip];
        if (cacheEntry && cacheEntry.timestamp && cacheEntry.data) {
          const age = now - cacheEntry.timestamp;
          
          // Only use cache if within TTL
          if (age < CACHE_TTL_MS) {
            cacheMap.set(ip.toLowerCase().trim(), {
              timestamp: cacheEntry.timestamp,
              age_days: Math.floor(age / (24 * 60 * 60 * 1000)),
              data: cacheEntry.data
            });
          }
        }
      }
    } else if (json['Source IP Address'] || json.source_ip) {
      // This is a log entry
      logEntries.push(item);
    }
  }
}

console.log(`💾 Cache loaded: ${cacheMap.size} valid entries (within ${CACHE_TTL_DAYS} day TTL)`);
console.log(`📄 Log entries to check: ${logEntries.length}`);

// Sample cached IPs
if (cacheMap.size > 0) {
  const sampleIPs = Array.from(cacheMap.keys()).slice(0, 5);
  console.log(`   Sample cached IPs: ${sampleIPs.join(', ')}`);
}

// Process each log entry and route to appropriate output
const cacheHits = [];   // Output 0 - Use cached data
const cacheMisses = []; // Output 1 - Send to APIs

for (const item of logEntries) {
  const json = item.json;
  
  // Extract source IP (handle both CSV and JSON formats)
  let sourceIP = json['Source IP Address'] || 
                 json['Source IP'] || 
                 json.source_ip || 
                 json.ip || 
                 '';
  
  sourceIP = sourceIP.toString().trim().toLowerCase();
  
  // Validate IP
  const isValidIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(sourceIP);
  
  if (!isValidIP) {
    console.warn(`⚠️  Invalid IP, sending to APIs: ${sourceIP}`);
    cacheMisses.push({
      json: {
        ...json,
        source_ip: sourceIP,
        cache_status: 'invalid_ip'
      }
    });
    continue;
  }
  
  // Check cache
  const cached = cacheMap.get(sourceIP);
  
  if (cached) {
    // ✅ CACHE HIT - Use cached data
    console.log(`✅ Cache HIT: ${sourceIP} (${cached.age_days} days old)`);
    
    cacheHits.push({
      json: {
        ...json,
        source_ip: sourceIP,
        cache_status: 'hit',
        cache_age_days: cached.age_days,
        cached_data: cached.data,
        _skip_apis: true
      }
    });
  } else {
    // ❌ CACHE MISS - Send to APIs
    console.log(`❌ Cache MISS: ${sourceIP} - Sending to APIs`);
    
    cacheMisses.push({
      json: {
        ...json,
        source_ip: sourceIP,
        cache_status: 'miss',
        _enrich_with_apis: true
      }
    });
  }
}

// Statistics
const totalProcessed = cacheHits.length + cacheMisses.length;
const hitRate = totalProcessed > 0 ? ((cacheHits.length / totalProcessed) * 100).toFixed(1) : 0;

console.log('\n' + '='.repeat(80));
console.log('📊 CACHE STATISTICS');
console.log('='.repeat(80));
console.log(`   Total processed: ${totalProcessed}`);
console.log(`   ✅ Cache hits: ${cacheHits.length} (${hitRate}%) - Skipping APIs`);
console.log(`   ❌ Cache misses: ${cacheMisses.length} (${100 - hitRate}%) - Enriching with APIs`);
console.log(`   💰 API calls saved: ${cacheHits.length}`);
console.log('='.repeat(80) + '\n');

// Return two outputs:
// [0] Cache hits - will go directly to merge with final results
// [1] Cache misses - will go to API enrichment pipeline
return [cacheHits, cacheMisses];

