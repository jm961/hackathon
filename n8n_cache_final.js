// Configuration
const CACHE_TTL_DAYS = 7;
const CACHE_TTL_MS = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;
const now = Date.now();

console.log('\n='.repeat(80));
console.log('CACHE CHECKER - Starting');
console.log('='.repeat(80));

// Get input data
const items = $input.all();
console.log(`Total items received: ${items.length}`);

// Build cache map
const cacheMap = new Map();
const logEntries = [];

// Separate cache data from log entries
for (const item of items) {
  const json = item.json;
  
  if (json && typeof json === 'object') {
    const keys = Object.keys(json);
    const hasIPKeys = keys.some(k => /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(k));
    
    if (hasIPKeys) {
      console.log(`Cache object with ${keys.length} cached IPs`);
      
      for (const ip of keys) {
        const cacheEntry = json[ip];
        if (cacheEntry && cacheEntry.timestamp && cacheEntry.data) {
          const age = now - cacheEntry.timestamp;
          
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
      logEntries.push(item);
    }
  }
}

console.log(`Cache loaded: ${cacheMap.size} entries`);
console.log(`Log entries: ${logEntries.length}`);

// Process log entries
const cacheHits = [];
const cacheMisses = [];

for (const item of logEntries) {
  const json = item.json;
  
  let sourceIP = json['Source IP Address'] || json['Source IP'] || json.source_ip || json.ip || '';
  sourceIP = sourceIP.toString().trim().toLowerCase();
  
  const isValidIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(sourceIP);
  
  if (!isValidIP) {
    cacheMisses.push({
      json: {
        ...json,
        source_ip: sourceIP,
        cache_status: 'invalid_ip'
      }
    });
    continue;
  }
  
  const cached = cacheMap.get(sourceIP);
  
  if (cached) {
    console.log(`Cache HIT: ${sourceIP}`);
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
    console.log(`Cache MISS: ${sourceIP}`);
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

console.log('\nSTATISTICS:');
console.log(`Cache hits: ${cacheHits.length}`);
console.log(`Cache misses: ${cacheMisses.length}`);
console.log('='.repeat(80));

// N8N requires array of arrays for multiple outputs
// Each output must be an array of items (even if empty)
const output0 = cacheHits.length > 0 ? cacheHits : [];
const output1 = cacheMisses.length > 0 ? cacheMisses : [];

return [output0, output1];
