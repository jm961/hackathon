const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

const RESULTS_FILE = '/home/node/dataset/threat_analysis_results.json';

 

// Normalize IP address (trim, lowercase)

function normalizeIP(ip) {

  if (!ip || typeof ip !== 'string') return '';

  return ip.trim().toLowerCase();

}

 

// Get all items from Merge Cache and Logs

const allInputs = $input.all();

 

if (!allInputs || allInputs.length === 0) {

  console.error('Check Cache: No input items received');

  return [{ json: { error: true, error_message: 'No input data', cache_hit: false } }];

}

 

console.log(`\n${'='.repeat(60)}`);

console.log(`Check Cache: Processing ${allInputs.length} total items`);

console.log(`${'='.repeat(60)}\n`);

 

const now = Date.now();

const cache = {};

const logItems = [];

let cacheItemCount = 0;

let logItemCount = 0;

 

// Debug: Log first few items to see their structure

console.log('🔍 DEBUGGING: First 3 items structure:');

for (let i = 0; i < Math.min(3, allInputs.length); i++) {

  const item = allInputs[i];

  if (item && item.json) {

    console.log(`\nItem ${i}:`);

    console.log(`  - Has enrichment: ${!!(item.json.enrichment && Object.keys(item.json.enrichment).length > 0)}`);

    console.log(`  - Has source_ip: ${!!item.json.source_ip}`);

    console.log(`  - Has Source IP Address: ${!!item.json['Source IP Address']}`);

    console.log(`  - Has destination_ip: ${!!item.json.destination_ip}`);

    console.log(`  - Has Destination IP Address: ${!!item.json['Destination IP Address']}`);

    console.log(`  - Top-level keys: ${Object.keys(item.json).slice(0, 10).join(', ')}`);

    if (item.json.source_ip) console.log(`  - source_ip value: "${item.json.source_ip}"`);

    if (item.json['Source IP Address']) console.log(`  - Source IP Address value: "${item.json['Source IP Address']}"`);

  }

}

console.log('\n' + '-'.repeat(60) + '\n');

 

// First pass: Build cache from items that have enrichment data
for (let i = 0; i < allInputs.length; i++) {
  const item = allInputs[i];
  if (!item || !item.json) continue;

  const json = item.json || {};
  const isFileMetadata = json.fileName || (item.binary && item.binary.data && item.binary.data.fileName);
  if (isFileMetadata) continue;

  const hasEnrichment = json.enrichment && typeof json.enrichment === 'object' && Object.keys(json.enrichment).length > 0;
  const hasAISummary = json.final_verdict || json.gpt_verdict || json.ai_summary;

  if (hasEnrichment || hasAISummary) {
    const ip = normalizeIP(json.source_ip || json['Source IP Address'] || '');
    if (ip && /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
      const resultTimestamp = json.timestamp ? new Date(json.timestamp).getTime() : now;
      const age = now - resultTimestamp;
      if (age < CACHE_TTL) {
        cache[ip] = {
          timestamp: resultTimestamp,
          data: {
            source_ip: ip,
            enrichment: json.enrichment || {},
            ai_summary: json.final_verdict || json.gpt_verdict || json.ai_summary || '',
            source_data: json.source_data || {
              'Source IP Address': json['Source IP Address'] || ip,
              'Destination IP Address': json['Destination IP Address'] || json.destination_ip || '',
              'Destination Port': json['Destination Port'] || json.destination_port || '',
              'Protocol': json['Protocol'] || json.protocol || '',
              'Timestamp': json['Timestamp'] || json.timestamp || ''
            }
          }
        };
        cacheItemCount++;
      }
    }
  }
}

// Second pass: Process ALL items (both cache and logs) - don't filter out log items
for (let i = 0; i < allInputs.length; i++) {
  const item = allInputs[i];
  if (!item || !item.json) continue;

  const json = item.json || {};
  const isFileMetadata = json.fileName || (item.binary && item.binary.data && item.binary.data.fileName);
  if (isFileMetadata) continue;

  // Add ALL items to logItems for processing (we'll check cache for each)
  const hasCSVIP = !!json['Source IP Address'];
  const hasSnakeCaseIP = !!json.source_ip;
  
  if (hasCSVIP || hasSnakeCaseIP) {
    logItems.push(item);
    logItemCount++;
  }
}

 

console.log(`\n${'='.repeat(60)}`);

console.log(`✅ Cache built: ${Object.keys(cache).length} valid entries`);

console.log(`📋 Found ${logItems.length} log items to check`);

console.log(`${'='.repeat(60)}\n`);

 

if (Object.keys(cache).length > 0) {

  console.log('Cache IPs (first 10):', Object.keys(cache).slice(0, 10).join(', '));

}

 

if (logItems.length === 0) {

  console.error('Check Cache: No log items found after filtering');

  // If we have cache items but no log items, maybe all items are cached?

  // Return the cached items as cache hits

  if (Object.keys(cache).length > 0) {

    console.log('Returning cached items as results...');

    return Object.values(cache).map(c => ({

      json: {

        ...c.data,

        cache_hit: true,

        cache_similarity: 100,

        cache_match_type: 'exact_ip',

        cache_age_days: Math.floor((now - c.timestamp) / (24 * 60 * 60 * 1000))

      }

    }));

  }

  return [{ json: { error: true, error_message: 'No log items found', cache_hit: false } }];

}

 

// Process each log item

console.log('\n🔍 Processing log items against cache:\n');

const results = logItems.map((item, idx) => {

  try {

    const json = item.json || item;

 

    // Extract IP address from CSV log entry

    let sourceIP = json['Source IP Address'] || json['Source IP'] || json.source_ip ||

                   json.source_ip_address || json.src_ip || json.sourceip || json.srcip ||

                   json.ip || json.client_ip || json.origin_ip || '';

 

    if (!sourceIP && json.data && typeof json.data === 'object') {

      sourceIP = json.data['Source IP Address'] || json.data.source_ip || json.data['Source IP'] || '';

    }

 

    if (!sourceIP && json.source_data && typeof json.source_data === 'object') {

      sourceIP = json.source_data['Source IP Address'] || json.source_data.source_ip || '';

    }

 

    // Pattern matching fallback

    if (!sourceIP) {

      const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

      for (const key in json) {

        if (typeof json[key] === 'string' && ipPattern.test(json[key])) {

          sourceIP = json[key];

          break;

        }

      }

    }

 

    // Normalize the IP

    sourceIP = normalizeIP(sourceIP);

 

    if (!sourceIP || !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(sourceIP)) {

      console.error(`❌ Item ${idx}: Could not extract valid IP. Available keys:`, Object.keys(json).slice(0, 10).join(', '));

      return { json: { ...json, cache_hit: false, cache_reason: 'No valid source IP', source_ip: '', 'Source IP Address': '' } };

    }

 

    // Check cache for exact IP match

    if (cache[sourceIP] && cache[sourceIP].data) {

      const cacheAge = now - (cache[sourceIP].timestamp || 0);

      if (cacheAge < CACHE_TTL) {

        if (idx < 5) {

          console.log(`✅ Item ${idx}: Cache HIT for IP: ${sourceIP} (age: ${Math.floor(cacheAge / (24 * 60 * 60 * 1000))} days)`);

        }

        return {

          json: {

            ...json,

            cache_hit: true,

            cached_data: cache[sourceIP].data,

            cache_similarity: 100,

            cache_match_type: 'exact_ip',

            cache_age_days: Math.floor(cacheAge / (24 * 60 * 60 * 1000)),

            source_ip: sourceIP,

            'Source IP Address': sourceIP

          }

        };

      } else {

        if (idx < 5) {

          console.log(`⚠️ Item ${idx}: Cache expired for IP: ${sourceIP} (age: ${Math.floor(cacheAge / (24 * 60 * 60 * 1000))} days)`);

        }

      }

    }

 

    if (idx < 5) {

      console.log(`❌ Item ${idx}: Cache MISS for IP: ${sourceIP}`);

      // Check if this IP is in cache at all

      const isInCache = Object.keys(cache).includes(sourceIP);

      console.log(`   - IP "${sourceIP}" in cache keys: ${isInCache}`);

      if (!isInCache && Object.keys(cache).length > 0) {

        console.log(`   - Sample cache keys: ${Object.keys(cache).slice(0, 3).join(', ')}`);

      }

    }

 

    return {

      json: {

        ...json,

        cache_hit: false,

        cache_reason: 'Not found',

        source_ip: sourceIP,

        'Source IP Address': sourceIP

      }

    };

  } catch (error) {

    console.error('Error processing item:', error.message);

    const errorSourceIP = normalizeIP(item.json?.['Source IP Address'] || item.json?.source_ip || '');

    return { json: { ...item.json, cache_hit: false, cache_reason: `Error: ${error.message}`, source_ip: errorSourceIP, 'Source IP Address': errorSourceIP } };

  }

});

 

const hitCount = results.filter(r => r.json.cache_hit).length;

const missCount = results.filter(r => !r.json.cache_hit).length;

 

console.log(`\n${'='.repeat(60)}`);

console.log(`📊 RESULTS SUMMARY:`);

console.log(`   Total: ${results.length}`);

console.log(`   Cache Hits: ${hitCount} (${((hitCount/results.length)*100).toFixed(1)}%)`);

console.log(`   Cache Misses: ${missCount} (${((missCount/results.length)*100).toFixed(1)}%)`);

console.log(`${'='.repeat(60)}\n`);

 

return results;