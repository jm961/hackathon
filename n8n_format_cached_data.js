/**
 * FORMAT CACHED DATA
 * 
 * Takes cache hits and formats them to match the structure
 * of API-enriched data so they can be merged seamlessly
 */

const items = $input.all();

console.log(`\n🔧 Formatting ${items.length} cached items for final output...\n`);

return items.map((item, index) => {
  const json = item.json;
  const cachedData = json.cached_data || {};
  
  // Get source IP
  const sourceIP = json.source_ip || json['Source IP Address'] || '';
  
  // Extract all the enriched fields from cached data
  const result = {
    // Original log fields
    source_ip: sourceIP,
    destination_ip: json['Destination IP Address'] || cachedData.destination_ip || '',
    destination_port: json['Destination Port'] || cachedData.destination_port || '',
    protocol: json['Protocol'] || cachedData.protocol || '',
    timestamp: json['Timestamp'] || cachedData.timestamp || '',
    anomaly_score: json['Anomaly Scores'] || cachedData.anomaly_score || '',
    attack_type: json['Attack Type'] || cachedData.attack_type || '',
    severity_level: json['Severity Level'] || cachedData.severity_level || '',
    
    // Enrichment data from cache
    enrichment: cachedData.enrichment || {},
    
    // AI analysis from cache
    ai_summary: cachedData.ai_summary || '',
    gpt_analysis: cachedData.gpt_analysis || {},
    gemini_review: cachedData.gemini_review || {},
    final_decision: cachedData.final_decision || {},
    
    // Extract specific fields for CSV export
    country: cachedData.enrichment?.geolocation?.country || '',
    city: cachedData.enrichment?.geolocation?.city || '',
    isp: cachedData.enrichment?.geolocation?.isp || '',
    abuse_score: cachedData.enrichment?.threat_intelligence?.abuse_score || 0,
    otx_pulses: cachedData.enrichment?.threat_intelligence?.pulse_count || 0,
    risk_score: cachedData.enrichment?.risk_assessment?.risk_score || 0,
    threat_level: cachedData.enrichment?.risk_assessment?.threat_level || '',
    risk_factors: cachedData.enrichment?.risk_assessment?.risk_factors || [],
    
    // GPT analysis
    gpt_verdict: cachedData.gpt_analysis?.verdict || '',
    gpt_confidence: cachedData.gpt_analysis?.confidence || '',
    gpt_threat_level: cachedData.gpt_analysis?.threat_level || '',
    
    // Gemini review
    gemini_verdict: cachedData.gemini_review?.verdict || '',
    gemini_confidence: cachedData.gemini_review?.confidence || '',
    gemini_agreement: cachedData.gemini_review?.agreement || '',
    
    // Final decision
    final_verdict: cachedData.final_decision?.verdict || '',
    final_confidence: cachedData.final_decision?.confidence || '',
    final_threat_level: cachedData.final_decision?.threat_level || '',
    final_recommended_action: cachedData.final_decision?.recommended_action || '',
    final_reasoning: cachedData.final_decision?.reasoning || '',
    
    // Metadata
    _from_cache: true,
    cache_age_days: json.cache_age_days || 0,
    created_at: new Date().toISOString()
  };
  
  if (index < 3) {
    console.log(`✅ [${index}] Formatted: ${sourceIP} (${json.cache_age_days} days old cache)`);
  }
  
  return { json: result };
});

