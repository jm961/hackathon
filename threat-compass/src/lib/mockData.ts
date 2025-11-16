// Mock threat data for development without database connection

const generateMockThreat = (id: number, overrides: Partial<any> = {}) => {
  const threatLevels = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const attackTypes = [
    "DDoS Attack",
    "SQL Injection",
    "XSS Attack",
    "Brute Force",
    "Port Scan",
    "Malware",
    "Phishing",
    "Ransomware",
    "Botnet Activity",
    "Unauthorized Access",
  ];
  const countries = ["US", "CN", "RU", "DE", "FR", "GB", "JP", "KR", "IN", "BR"];
  const countryNames = {
    US: "United States",
    CN: "China",
    RU: "Russia",
    DE: "Germany",
    FR: "France",
    GB: "United Kingdom",
    JP: "Japan",
    KR: "South Korea",
    IN: "India",
    BR: "Brazil",
  };
  const protocols = ["TCP", "UDP", "HTTP", "HTTPS", "SSH", "FTP"];
  const verdicts = ["MALICIOUS", "SUSPICIOUS", "BENIGN"];
  const actions = ["BLOCK", "MONITOR", "ALLOW", "QUARANTINE"];

  const threatLevel = threatLevels[Math.floor(Math.random() * threatLevels.length)];
  const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
  const countryCode = countries[Math.floor(Math.random() * countries.length)];
  const daysAgo = Math.floor(Math.random() * 30);
  const timestamp = new Date();
  timestamp.setDate(timestamp.getDate() - daysAgo);
  timestamp.setHours(Math.floor(Math.random() * 24));
  timestamp.setMinutes(Math.floor(Math.random() * 60));

  const riskScore = threatLevel === "CRITICAL" ? 85 + Math.floor(Math.random() * 15) :
                     threatLevel === "HIGH" ? 65 + Math.floor(Math.random() * 20) :
                     threatLevel === "MEDIUM" ? 40 + Math.floor(Math.random() * 25) :
                     10 + Math.floor(Math.random() * 30);

  return {
    id,
    created_at: timestamp.toISOString(),
    timestamp: timestamp.toISOString(),
    source_ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    destination_ip: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    source_port: Math.floor(Math.random() * 65535),
    destination_port: [80, 443, 22, 21, 3306, 5432][Math.floor(Math.random() * 6)],
    protocol: protocols[Math.floor(Math.random() * protocols.length)],
    packet_length: Math.floor(Math.random() * 1500) + 64,
    packet_type: ["SYN", "ACK", "FIN", "RST"][Math.floor(Math.random() * 4)],
    traffic_type: ["Inbound", "Outbound"][Math.floor(Math.random() * 2)],
    anomaly_score: (riskScore / 100) * 0.9 + Math.random() * 0.1,
    attack_type: attackType,
    attack_signature: `${attackType} signature detected`,
    severity_level: threatLevel,
    proxy_information: Math.random() > 0.7 ? "Proxy detected" : null,
    action_taken: actions[Math.floor(Math.random() * actions.length)],
    geo_location_data: JSON.stringify({ country: countryCode }),
    country: countryNames[countryCode as keyof typeof countryNames] || countryCode,
    country_code: countryCode,
    city: ["New York", "Beijing", "Moscow", "Berlin", "Paris", "London", "Tokyo", "Seoul", "Mumbai", "São Paulo"][Math.floor(Math.random() * 10)],
    state_region: "Unknown",
    isp: "Unknown ISP",
    organization: "Unknown Organization",
    asn: `AS${Math.floor(Math.random() * 100000)}`,
    latitude: (Math.random() * 180) - 90,
    longitude: (Math.random() * 360) - 180,
    timezone: "UTC",
    is_eu: ["DE", "FR", "GB"].includes(countryCode),
    abuseipdb_score: threatLevel === "CRITICAL" ? 90 + Math.floor(Math.random() * 10) : Math.floor(Math.random() * 50),
    abuseipdb_reputation: Math.floor(Math.random() * 100),
    total_reports: Math.floor(Math.random() * 100),
    distinct_users: Math.floor(Math.random() * 50),
    last_reported: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    virustotal_detections: threatLevel === "CRITICAL" ? Math.floor(Math.random() * 30) + 10 : Math.floor(Math.random() * 10),
    virustotal_total: 60 + Math.floor(Math.random() * 40),
    virustotal_ratio: Math.random(),
    otx_pulses: threatLevel === "CRITICAL" ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 5),
    greynoise_classification: threatLevel === "CRITICAL" ? "malicious" : Math.random() > 0.5 ? "benign" : "unknown",
    malware_families: threatLevel === "CRITICAL" ? "Trojan, Ransomware" : null,
    historical_attacks: threatLevel === "CRITICAL" ? "DDoS, Brute Force" : null,
    usage_type: ["hosting", "isp", "datacenter"][Math.floor(Math.random() * 3)],
    domain: Math.random() > 0.5 ? `example${Math.floor(Math.random() * 100)}.com` : null,
    is_datacenter: Math.random() > 0.7,
    is_vpn_proxy: Math.random() > 0.8,
    is_tor: Math.random() > 0.9,
    is_suspicious_domain: Math.random() > 0.7,
    port: Math.floor(Math.random() * 65535),
    port_category: ["Web", "Database", "SSH", "FTP"][Math.floor(Math.random() * 4)],
    port_type: ["TCP", "UDP"][Math.floor(Math.random() * 2)],
    port_risk_level: threatLevel,
    is_sensitive_port: Math.random() > 0.6,
    hour: timestamp.getHours(),
    day_of_week: timestamp.getDay(),
    is_suspicious_hour: timestamp.getHours() < 6 || timestamp.getHours() > 22,
    is_off_hours: timestamp.getHours() < 8 || timestamp.getHours() > 18,
    is_weekend: timestamp.getDay() === 0 || timestamp.getDay() === 6,
    days_since_event: daysAgo,
    is_high_risk_country: ["CN", "RU"].includes(countryCode),
    vpn_proxy_detected: Math.random() > 0.8,
    impossible_travel_detected: false,
    geographic_anomalies: null,
    risk_score: riskScore,
    threat_level: threatLevel,
    risk_factors_count: Math.floor(Math.random() * 5) + 1,
    risk_factors: ["High abuse score", "Malware detected", "Suspicious port", "VPN/Proxy"].slice(0, Math.floor(Math.random() * 4) + 1).join(", "),
    gpt_verdict: verdicts[Math.floor(Math.random() * verdicts.length)],
    gpt_confidence: 70 + Math.floor(Math.random() * 30),
    gpt_threat_level: threatLevel,
    gpt_recommended_action: actions[Math.floor(Math.random() * actions.length)],
    gpt_reasoning: `AI analysis indicates ${threatLevel.toLowerCase()} threat level based on multiple indicators.`,
    gemini_agreement: Math.random() > 0.3,
    gemini_verdict: verdicts[Math.floor(Math.random() * verdicts.length)],
    gemini_confidence: 70 + Math.floor(Math.random() * 30),
    gemini_threat_level: threatLevel,
    gemini_recommended_action: actions[Math.floor(Math.random() * actions.length)],
    gemini_review_comments: "Gemini review completed",
    final_verdict: verdicts[Math.floor(Math.random() * verdicts.length)],
    final_confidence: 75 + Math.floor(Math.random() * 25),
    final_threat_level: threatLevel,
    final_recommended_action: actions[Math.floor(Math.random() * actions.length)],
    final_reasoning: `Final analysis: ${threatLevel} threat detected. Recommended action: ${actions[Math.floor(Math.random() * actions.length)]}.`,
    decision_source: Math.random() > 0.5 ? "GPT-4" : "Gemini",
    models_agreed: Math.random() > 0.5,
    review_summary: "Threat analysis completed successfully",
    updated_at: timestamp.toISOString(),
    ...overrides,
  };
};

// Generate mock threats
export const generateMockThreats = (count: number = 50): any[] => {
  return Array.from({ length: count }, (_, i) => generateMockThreat(i + 1));
};

// Pre-generated mock data for consistent display
export const MOCK_THREATS = generateMockThreats(50);

