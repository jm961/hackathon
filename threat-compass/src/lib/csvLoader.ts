// Data loader utility for threat analysis results (supports CSV and JSON from n8n workflow)

export interface CSVThreatRow {
  'Source IP': string;
  'Destination IP': string;
  'Destination Port': string;
  'Protocol': string;
  'Timestamp': string;
  'Country': string;
  'City': string;
  'ISP': string;
  'Abuse Score': string;
  'OTX Pulses': string;
  'Anomaly Score': string;
  'Attack Type': string;
  'Severity Level': string;
  'Risk Score': string;
  'Threat Level': string;
  'Risk Factors': string;
  'GPT Verdict': string;
  'GPT Confidence': string;
  'GPT Threat Level': string;
  'Gemini Verdict': string;
  'Gemini Confidence': string;
  'Gemini Agreement': string;
  'Final Verdict': string;
  'Final Confidence': string;
  'Final Threat Level': string;
  'Final Recommended Action': string;
  'Final Reasoning': string;
}

// N8N JSON format interface
export interface N8NThreatRow {
  source_ip: string;
  destination_ip: string;
  destination_port: string | number;
  protocol: string;
  timestamp: string;
  country: string;
  city: string;
  isp: string;
  abuse_score: number | null;
  otx_pulses: number | null;
  anomaly_score: string | number | null;
  attack_type: string;
  severity_level: string;
  risk_score: number | null;
  threat_level: string;
  risk_factors: string[] | string;
  gpt_verdict: string;
  gpt_confidence: number | null;
  gpt_threat_level: string;
  gemini_verdict: string;
  gemini_confidence: number | null;
  gemini_agreement: string | boolean;
  final_verdict: string;
  final_confidence: number | null;
  final_threat_level: string;
  final_recommended_action: string;
  final_reasoning: string;
  enrichment?: {
    geolocation?: {
      country?: string;
      city?: string;
      isp?: string;
      coordinates?: { lat: number; lon: number };
      country_code?: string;
    };
    threat_intelligence?: {
      abuse_score?: number;
      pulse_count?: number;
    };
  };
}

// Parse CSV string into array of objects
export function parseCSV(csvText: string): CSVThreatRow[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]);
  
  // Parse data rows
  const rows: CSVThreatRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;
    
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row as CSVThreatRow);
  }

  return rows;
}

// Parse a single CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  result.push(current.trim());
  
  return result;
}

// Convert CSV row to dashboard threat format
export function convertCSVRowToThreat(row: CSVThreatRow, id: number): any {
  const timestamp = row['Timestamp'] ? new Date(row['Timestamp']) : new Date();
  const riskScore = parseInt(row['Risk Score']) || 0;
  const threatLevel = (row['Final Threat Level'] || row['Threat Level'] || 'LOW').toUpperCase();
  
  // Extract country code from country name (simple mapping)
  const countryName = row['Country'] || 'Unknown';
  const countryCode = getCountryCode(countryName);
  
  // Parse risk factors
  const riskFactors = row['Risk Factors'] ? row['Risk Factors'].split(';').map(f => f.trim()).filter(Boolean) : [];
  
  return {
    id,
    created_at: timestamp.toISOString(),
    timestamp: timestamp.toISOString(),
    source_ip: row['Source IP'] || '',
    destination_ip: row['Destination IP'] || '',
    source_port: null,
    destination_port: parseInt(row['Destination Port']) || null,
    protocol: row['Protocol'] || '',
    packet_length: null,
    packet_type: null,
    traffic_type: null,
    anomaly_score: parseFloat(row['Anomaly Score']) || 0,
    attack_type: row['Attack Type'] || 'Unknown',
    attack_signature: null,
    severity_level: row['Severity Level'] || threatLevel,
    proxy_information: null,
    action_taken: null,
    geo_location_data: null,
    country: countryName,
    country_code: countryCode,
    city: row['City'] || 'Unknown',
    state_region: null,
    isp: row['ISP'] || 'Unknown',
    organization: null,
    asn: null,
    latitude: null,
    longitude: null,
    timezone: null,
    is_eu: false,
    abuseipdb_score: parseInt(row['Abuse Score']) || null,
    abuseipdb_reputation: null,
    total_reports: null,
    distinct_users: null,
    last_reported: null,
    virustotal_detections: null,
    virustotal_total: null,
    virustotal_ratio: null,
    otx_pulses: parseInt(row['OTX Pulses']) || null,
    greynoise_classification: null,
    malware_families: null,
    historical_attacks: null,
    usage_type: null,
    domain: null,
    is_datacenter: false,
    is_vpn_proxy: false,
    is_tor: false,
    is_suspicious_domain: false,
    port: parseInt(row['Destination Port']) || null,
    port_category: null,
    port_type: null,
    port_risk_level: null,
    is_sensitive_port: false,
    hour: timestamp.getHours(),
    day_of_week: timestamp.getDay(),
    is_suspicious_hour: false,
    is_off_hours: false,
    is_weekend: timestamp.getDay() === 0 || timestamp.getDay() === 6,
    days_since_event: Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60 * 60 * 24)),
    is_high_risk_country: false,
    vpn_proxy_detected: false,
    impossible_travel_detected: false,
    geographic_anomalies: null,
    risk_score: riskScore,
    threat_level: threatLevel,
    risk_factors_count: riskFactors.length,
    risk_factors: riskFactors.join(', '),
    gpt_verdict: row['GPT Verdict'] || null,
    gpt_confidence: parseInt(row['GPT Confidence']) || null,
    gpt_threat_level: row['GPT Threat Level'] || null,
    gpt_recommended_action: null,
    gpt_reasoning: null,
    gemini_agreement: row['Gemini Agreement'] === 'true' || row['Gemini Agreement'] === 'TRUE',
    gemini_verdict: row['Gemini Verdict'] || null,
    gemini_confidence: parseInt(row['Gemini Confidence']) || null,
    gemini_threat_level: null,
    gemini_recommended_action: null,
    gemini_review_comments: null,
    final_verdict: row['Final Verdict'] || row['GPT Verdict'] || 'UNKNOWN',
    final_confidence: parseInt(row['Final Confidence']) || parseInt(row['GPT Confidence']) || 0,
    final_threat_level: threatLevel,
    final_recommended_action: row['Final Recommended Action'] || 'MONITOR',
    final_reasoning: row['Final Reasoning'] || null,
    decision_source: row['Gemini Verdict'] ? 'Gemini' : 'GPT-4',
    models_agreed: row['Gemini Agreement'] === 'true' || row['Gemini Agreement'] === 'TRUE',
    review_summary: null,
    updated_at: timestamp.toISOString(),
  };
}

// Simple country code mapping
function getCountryCode(countryName: string): string {
  const mapping: Record<string, string> = {
    'United States': 'US',
    'China': 'CN',
    'Russia': 'RU',
    'Germany': 'DE',
    'France': 'FR',
    'United Kingdom': 'GB',
    'Japan': 'JP',
    'South Korea': 'KR',
    'India': 'IN',
    'Brazil': 'BR',
    'Canada': 'CA',
    'Australia': 'AU',
    'Italy': 'IT',
    'Spain': 'ES',
    'Netherlands': 'NL',
    'Poland': 'PL',
    'Turkey': 'TR',
    'Mexico': 'MX',
    'Argentina': 'AR',
    'Unknown': '??',
  };
  
  return mapping[countryName] || countryName.substring(0, 2).toUpperCase() || '??';
}

// Convert N8N JSON row to dashboard threat format
export function convertN8NRowToThreat(row: N8NThreatRow, id: number): any {
  // Parse timestamp - handle multiple formats
  let timestamp: Date;
  try {
    timestamp = row.timestamp ? new Date(row.timestamp) : new Date();
    if (isNaN(timestamp.getTime())) {
      // Try parsing as "YYYY-MM-DD HH:mm:ss" format
      const parts = row.timestamp.split(' ');
      if (parts.length === 2) {
        const [datePart, timePart] = parts;
        timestamp = new Date(`${datePart}T${timePart}`);
      }
      if (isNaN(timestamp.getTime())) {
        timestamp = new Date();
      }
    }
  } catch {
    timestamp = new Date();
  }

  const riskScore = typeof row.risk_score === 'number' ? row.risk_score : parseInt(String(row.risk_score || 0)) || 0;
  const threatLevel = (row.final_threat_level || row.threat_level || 'LOW').toUpperCase();
  
  // Extract enrichment data
  const enrichment = row.enrichment || {};
  const geo = enrichment.geolocation || {};
  const threatIntel = enrichment.threat_intelligence || {};
  
  // Get country code from enrichment or country name
  const countryName = geo.country || row.country || 'Unknown';
  const countryCode = geo.country_code || getCountryCode(countryName);
  
  // Parse risk factors
  let riskFactors: string[] = [];
  if (Array.isArray(row.risk_factors)) {
    riskFactors = row.risk_factors;
  } else if (typeof row.risk_factors === 'string') {
    riskFactors = row.risk_factors.split(';').map(f => f.trim()).filter(Boolean);
  }
  
  // Parse coordinates
  const coordinates = geo.coordinates || { lat: 0, lon: 0 };
  
  // Parse anomaly score
  const anomalyScore = typeof row.anomaly_score === 'number' 
    ? row.anomaly_score 
    : parseFloat(String(row.anomaly_score || 0)) || 0;
  
  // Parse port
  const destinationPort = typeof row.destination_port === 'number'
    ? row.destination_port
    : parseInt(String(row.destination_port || 0)) || null;
  
  return {
    id,
    created_at: timestamp.toISOString(),
    timestamp: timestamp.toISOString(),
    source_ip: row.source_ip || '',
    destination_ip: row.destination_ip || '',
    source_port: null,
    destination_port: destinationPort,
    protocol: row.protocol || '',
    packet_length: null,
    packet_type: null,
    traffic_type: null,
    anomaly_score: anomalyScore,
    attack_type: row.attack_type || 'Unknown',
    attack_signature: null,
    severity_level: row.severity_level || threatLevel,
    proxy_information: null,
    action_taken: null,
    geo_location_data: null,
    country: countryName,
    country_code: countryCode,
    city: geo.city || row.city || 'Unknown',
    state_region: null,
    isp: geo.isp || row.isp || 'Unknown',
    organization: null,
    asn: null,
    latitude: coordinates.lat || null,
    longitude: coordinates.lon || null,
    timezone: null,
    is_eu: false,
    abuseipdb_score: threatIntel.abuse_score || row.abuse_score || null,
    abuseipdb_reputation: null,
    total_reports: null,
    distinct_users: null,
    last_reported: null,
    virustotal_detections: null,
    virustotal_total: null,
    virustotal_ratio: null,
    otx_pulses: threatIntel.pulse_count || row.otx_pulses || null,
    greynoise_classification: null,
    malware_families: null,
    historical_attacks: null,
    usage_type: null,
    domain: null,
    is_datacenter: false,
    is_vpn_proxy: false,
    is_tor: false,
    is_suspicious_domain: false,
    port: destinationPort,
    port_category: null,
    port_type: null,
    port_risk_level: null,
    is_sensitive_port: false,
    hour: timestamp.getHours(),
    day_of_week: timestamp.getDay(),
    is_suspicious_hour: false,
    is_off_hours: false,
    is_weekend: timestamp.getDay() === 0 || timestamp.getDay() === 6,
    days_since_event: Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60 * 60 * 24)),
    is_high_risk_country: false,
    vpn_proxy_detected: false,
    impossible_travel_detected: false,
    geographic_anomalies: null,
    risk_score: riskScore,
    threat_level: threatLevel,
    risk_factors_count: riskFactors.length,
    risk_factors: riskFactors.join(', '),
    gpt_verdict: row.gpt_verdict || null,
    gpt_confidence: row.gpt_confidence || null,
    gpt_threat_level: row.gpt_threat_level || null,
    gpt_recommended_action: null,
    gpt_reasoning: null,
    gemini_agreement: row.gemini_agreement === true || row.gemini_agreement === 'true' || row.gemini_agreement === 'TRUE',
    gemini_verdict: row.gemini_verdict || null,
    gemini_confidence: row.gemini_confidence || null,
    gemini_threat_level: null,
    gemini_recommended_action: null,
    gemini_review_comments: null,
    final_verdict: row.final_verdict || row.gpt_verdict || 'UNKNOWN',
    final_confidence: row.final_confidence || row.gpt_confidence || 0,
    final_threat_level: threatLevel,
    final_recommended_action: row.final_recommended_action || 'MONITOR',
    final_reasoning: row.final_reasoning || null,
    decision_source: row.gemini_verdict ? 'Gemini' : 'GPT-4',
    models_agreed: row.gemini_agreement === true || row.gemini_agreement === 'true' || row.gemini_agreement === 'TRUE',
    review_summary: null,
    updated_at: timestamp.toISOString(),
  };
}

// Load JSON from URL (N8N workflow output)
export async function loadJSONFromURL(url: string): Promise<any[]> {
  try {
    // Add timestamp to force cache busting
    const timestamp = Date.now();
    const urlWithTimestamp = `${url}?t=${timestamp}`;
    const response = await fetch(urlWithTimestamp, {
      cache: 'no-store', // Never cache
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${response.statusText}`);
    }
    const jsonData: N8NThreatRow[] = await response.json();
    if (!Array.isArray(jsonData)) {
      throw new Error('JSON data is not an array');
    }
    return jsonData.map((row, index) => convertN8NRowToThreat(row, index + 1));
  } catch (error) {
    console.error('Error loading JSON:', error);
    throw error;
  }
}

// Load CSV from URL
export async function loadCSVFromURL(url: string): Promise<any[]> {
  try {
    // Add timestamp to force cache busting
    const timestamp = Date.now();
    const urlWithTimestamp = `${url}?t=${timestamp}`;
    const response = await fetch(urlWithTimestamp, {
      cache: 'no-store', // Never cache
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.statusText}`);
    }
    const csvText = await response.text();
    const csvRows = parseCSV(csvText);
    return csvRows.map((row, index) => convertCSVRowToThreat(row, index + 1));
  } catch (error) {
    console.error('Error loading CSV:', error);
    throw error;
  }
}

// Check metadata to see if data has been updated
let lastKnownTimestamp: number = 0;

export async function checkForDataUpdate(): Promise<{ updated: boolean; timestamp: number }> {
  try {
    const timestamp = Date.now();
    const response = await fetch(`/data-metadata.json?t=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      return { updated: true, timestamp: Date.now() }; // Assume update if metadata not found
    }
    
    const metadata = await response.json();
    const currentTimestamp = metadata.lastUpdatedTimestamp || 0;
    
    if (currentTimestamp > lastKnownTimestamp) {
      console.log(`🔄 Data update detected! New timestamp: ${metadata.lastUpdated}`);
      lastKnownTimestamp = currentTimestamp;
      return { updated: true, timestamp: currentTimestamp };
    }
    
    return { updated: false, timestamp: currentTimestamp };
  } catch (error) {
    console.warn('Failed to check metadata, assuming update:', error);
    return { updated: true, timestamp: Date.now() };
  }
}

// Main loader: tries JSON first (from n8n), then CSV as fallback
export async function loadThreatData(): Promise<any[]> {
  // Try JSON first (n8n workflow output)
  try {
    const jsonData = await loadJSONFromURL('/threat_analysis_results.json');
    if (jsonData && jsonData.length > 0) {
      console.log(`✅ Loaded ${jsonData.length} threats from JSON (n8n workflow)`);
      return jsonData;
    }
  } catch (error) {
    console.warn('JSON load failed, trying CSV:', error);
  }
  
  // Fallback to CSV
  try {
    const csvData = await loadCSVFromURL('/threat_analysis_results.csv');
    if (csvData && csvData.length > 0) {
      console.log(`✅ Loaded ${csvData.length} threats from CSV`);
      return csvData;
    }
  } catch (error) {
    console.error('CSV load also failed:', error);
    throw error;
  }
  
  return [];
}

