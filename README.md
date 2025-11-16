# Threat Compass - Security Operations Center Dashboard

A comprehensive, real-time threat intelligence and network security monitoring system that combines automated data processing, AI-powered threat analysis, and an intuitive web dashboard for security operations teams.

## 🎯 Project Overview

Threat Compass is an end-to-end cybersecurity threat analysis platform that processes network security logs, enriches them with threat intelligence APIs, analyzes them using AI models (GPT-4 and Gemini), and presents actionable insights through a modern web dashboard. The system features intelligent caching, automatic data synchronization, and real-time updates.

## ✨ Key Features

### 🔍 **Real-Time Threat Monitoring**
- Live dashboard with real-time threat intelligence metrics
- Automatic data refresh every 3-10 seconds
- Lightweight metadata-based update detection
- Manual refresh capability on all pages

### 📊 **Comprehensive Threat Analysis**
- **Advanced Filtering**: Filter by threat level, attack type, country, protocol, risk score, date range, IP addresses, verdicts, and recommended actions
- **Detailed Threat View**: Modal with complete threat information including:
  - Source and destination IPs
  - Geolocation data (country, city, ISP, coordinates)
  - Threat intelligence scores (AbuseIPDB, OTX pulses)
  - AI analysis results (GPT-4 and Gemini verdicts)
  - Risk factors and anomaly scores
  - Final recommended actions
- **Search Functionality**: Search by IP address (source or destination)
- **Sortable Tables**: Sort by any column for quick analysis

### 📈 **Advanced Analytics Dashboard**
- **Temporal Analysis**: Trend charts showing threat patterns over time
- **Geographic Distribution**: Interactive 3D globe visualization of threat origins
- **Risk Distribution**: Histogram of risk scores across all threats
- **Top Countries**: Bar chart of threats by country
- **Temporal Patterns**: Hourly and daily pattern analysis
- **Time Range Filters**: Analyze data for 24h, 7d, 30d, 90d, or all time
- **Export Capabilities**: Export reports for further analysis

### 🗺️ **Geographic Visualization**
- Interactive 3D globe showing threat origins
- Color-coded threat levels
- Clickable markers with threat details
- Real-time geographic pattern analysis

### 🤖 **AI-Powered Threat Analysis**
- **Dual AI Model Analysis**: 
  - GPT-4 for initial threat assessment
  - Gemini for review and validation
- **Consensus Detection**: Identifies when both models agree
- **Confidence Scoring**: Each verdict includes confidence levels
- **Actionable Recommendations**: BLOCK, MONITOR, or ALLOW actions
- **Detailed Reasoning**: AI-generated explanations for each decision

### 💾 **Intelligent Caching System**
- **7-Day TTL**: Cached threat intelligence data valid for 7 days
- **Automatic Cache Management**: Auto-trims to 10,000 entries
- **API Cost Reduction**: Reduces API calls by up to 45% (typical hit rate)
- **Smart Routing**: Automatically routes cache hits vs. misses
- **Cache Statistics**: Detailed logging of cache performance

### 🔄 **Automated Data Pipeline**
- **N8N Workflow Integration**: Automated processing pipeline
- **Multi-Source Enrichment**:
  - AbuseIPDB for reputation scoring
  - VirusTotal for malware detection
  - OTX (AlienVault) for threat intelligence
  - Geolocation services for IP mapping
- **CSV Processing**: Batch processing of security logs
- **Automatic Synchronization**: Data syncs from processing to dashboard automatically

### 🎨 **Modern User Interface**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode Support**: Built-in theme support
- **shadcn-ui Components**: High-quality, accessible UI components
- **Smooth Animations**: Polished user experience
- **Loading States**: Skeleton loaders for better UX
- **Error Handling**: Graceful fallbacks and error messages

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Sources                               │
│  (CSV Logs, Network Security Events)                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              N8N Workflow Pipeline                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Read CSV     │→ │ Check Cache  │→ │ Enrich APIs  │      │
│  └──────────────┘  └──────┬───────┘  └──────────────┘      │
│                           │                                  │
│                    ┌──────▼───────┐                          │
│                    │ Cache Hit?   │                          │
│                    └──┬───────┬───┘                          │
│                  Yes  │       │  No                          │
│                       │       │                              │
│              ┌────────▼──┐    │                              │
│              │ Use Cache │    │                              │
│              └───────────┘    │                              │
│                               │                              │
│                    ┌──────────▼──────────┐                   │
│                    │ AI Analysis (GPT-4) │                   │
│                    └──────────┬──────────┘                   │
│                               │                              │
│                    ┌──────────▼──────────┐                   │
│                    │ Review (Gemini)     │                   │
│                    └──────────┬──────────┘                   │
│                               │                              │
│                    ┌──────────▼──────────┐                   │
│                    │ Final Decision      │                   │
│                    └──────────┬──────────┘                   │
│                               │                              │
│                    ┌──────────▼──────────┐                   │
│                    │ Update Cache        │                   │
│                    └──────────┬──────────┘                   │
└───────────────────────────────┼──────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│              Data Synchronization                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Write JSON   │→ │ Sync Script  │→ │ Public Dir   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│              Frontend Dashboard                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Dashboard    │  │ Threats      │  │ Analytics    │      │
│  │ (Overview)   │  │ (Detailed)   │  │ (Reports)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Auto-Update System (3s polling)                     │   │
│  │  - Checks metadata.json for updates                  │   │
│  │  - Reloads data when timestamp changes               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Technologies Used

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **shadcn-ui** - High-quality component library
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Chart library for data visualization
- **react-globe.gl** - 3D globe visualization
- **Three.js** - 3D graphics for globe

### Backend & Automation
- **N8N** - Workflow automation platform
- **Node.js** - Runtime for automation scripts
- **Docker** - Containerization for N8N

### Data Processing
- **CSV Parser** - Custom CSV parsing for security logs
- **JSON Processing** - Structured data handling
- **Cache Management** - File-based caching system

### AI & APIs
- **OpenAI GPT-4** - Primary threat analysis
- **Google Gemini** - Review and validation
- **AbuseIPDB API** - IP reputation scoring
- **VirusTotal API** - Malware detection
- **OTX (AlienVault)** - Threat intelligence
- **Geolocation APIs** - IP to location mapping

## 📁 Project Structure

```
HACKATHON/
├── threat-compass/              # Frontend React application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── analytics/     # Analytics chart components
│   │   │   ├── dashboard/      # Dashboard-specific components
│   │   │   ├── threats/        # Threat analysis components
│   │   │   └── ui/             # shadcn-ui components
│   │   ├── pages/              # Page components
│   │   │   ├── Dashboard.tsx   # Main dashboard
│   │   │   ├── Threats.tsx     # Threat analysis page
│   │   │   ├── Analytics.tsx   # Analytics page
│   │   │   └── Index.tsx       # Landing page
│   │   ├── lib/                # Utility functions
│   │   │   ├── csvLoader.ts    # Data loading utilities
│   │   │   ├── mockData.ts     # Mock data for development
│   │   │   └── utils.ts        # General utilities
│   │   └── integrations/       # External integrations
│   │       └── supabase/      # Supabase client (optional)
│   ├── public/                 # Static assets
│   │   ├── threat_analysis_results.json  # N8N output
│   │   ├── threat_analysis_results.csv   # CSV fallback
│   │   └── data-metadata.json  # Update tracking
│   └── package.json
│
├── N8N/                         # N8N workflow automation
│   ├── docker-compose.yml       # Docker setup
│   └── n8n_data/               # N8N data directory
│
├── DATASET/                     # Data storage
│   ├── cybersecurity_attacks.csv           # Input logs
│   ├── enrichment_cache.json               # Threat intel cache
│   ├── threat_analysis_results.json        # Full results
│   ├── threat_analysis_results.csv         # CSV export
│   └── threat_analysis_results_website.json # Website format
│
├── sync-data.js                 # Data synchronization script
├── sync-data.sh                 # Bash sync script
├── n8n_workflow_with_cache.json # N8N workflow definition
│
└── Documentation/
    ├── AUTO_UPDATE_SETUP.md     # Auto-update system guide
    └── CACHE_FIX_GUIDE.md       # Caching system guide
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for N8N)
- API Keys:
  - OpenAI API key (for GPT-4)
  - Google Gemini API key
  - AbuseIPDB API key
  - VirusTotal API key (optional)
  - OTX API key (optional)

### 1. Clone and Setup

```bash
cd /home/segfaultslayers/HACKATHON
```

### 2. Start N8N Workflow

```bash
cd N8N
docker-compose up -d
```

Access N8N at `http://localhost:5678`

### 3. Configure N8N Workflow

1. Import `n8n_workflow_with_cache.json` into N8N
2. Configure API keys in workflow nodes
3. Set up file paths for data storage
4. Activate the workflow

### 4. Setup Frontend

```bash
cd threat-compass
npm install
npm run dev
```

The dashboard will be available at `http://localhost:8080` (or the port shown in terminal)

### 5. Process Data

1. Place your CSV security logs in `DATASET/cybersecurity_attacks.csv`
2. Trigger the N8N workflow (manually or via schedule)
3. Watch the dashboard update automatically!

## 📊 Key Components

### Dashboard Page
- **Real-time Metrics**: Total threats, critical count, blocked count, average risk score
- **Threat Level Distribution**: Breakdown by CRITICAL, HIGH, MEDIUM, LOW
- **Charts**: Threat level pie chart, attack type distribution
- **Geographic Map**: 3D globe showing threat origins
- **Threat Timeline**: Temporal visualization of threats
- **Recent Threats**: Latest threat entries

### Threats Page
- **Advanced Filters**: Multi-criteria filtering system
- **Threat Table**: Sortable, searchable table of all threats
- **Threat Detail Modal**: Complete information for each threat
- **Quick Stats**: Filtered threat statistics
- **IP Search**: Search by source or destination IP

### Analytics Page
- **Trend Analysis**: Threat trends over time
- **Geographic Analysis**: Top countries and geographic patterns
- **Risk Distribution**: Risk score histogram
- **Temporal Patterns**: Hourly and daily patterns
- **Time Range Filters**: Flexible time-based analysis
- **Export Functionality**: Export reports

## 🔄 Data Flow

1. **Input**: CSV security logs placed in `DATASET/`
2. **Processing**: N8N workflow reads CSV and processes each entry
3. **Cache Check**: System checks if IP exists in cache (7-day TTL)
4. **Enrichment**: 
   - Cache hit → Use cached data
   - Cache miss → Enrich with APIs (AbuseIPDB, VirusTotal, OTX, Geolocation)
5. **AI Analysis**: 
   - GPT-4 analyzes threat and provides verdict
   - Gemini reviews and validates
   - Final decision made based on consensus
6. **Cache Update**: New data added to cache
7. **Output**: Results written to JSON and CSV files
8. **Sync**: Sync script copies data to website public directory
9. **Display**: Frontend automatically detects update and refreshes

## 🎯 Key Features Explained

### Intelligent Caching
- Reduces API costs by up to 45%
- 7-day TTL ensures data freshness
- Automatic cache size management (10,000 entry limit)
- Detailed cache statistics and logging

### Auto-Update System
- Lightweight metadata file (< 1KB) tracks updates
- Frontend polls every 3 seconds
- Only reloads when timestamp changes
- Works across all pages (Dashboard, Threats, Analytics)

### AI-Powered Analysis
- **GPT-4**: Primary threat assessment with confidence scoring
- **Gemini**: Review and validation layer
- **Consensus Detection**: Identifies agreement between models
- **Actionable Output**: BLOCK, MONITOR, or ALLOW recommendations

### Multi-Source Enrichment
- **AbuseIPDB**: IP reputation and abuse scores
- **VirusTotal**: Malware and threat detection
- **OTX**: Threat intelligence and pulse counts
- **Geolocation**: Country, city, ISP, coordinates

## 📝 Configuration

### Environment Variables

Create `.env` in `threat-compass/`:

```env
VITE_SUPABASE_URL=your_supabase_url (optional)
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key (optional)
```

### N8N Configuration

Configure in N8N workflow nodes:
- API keys for all services
- File paths for data storage
- Cache file location
- Sync script path

### Cache Configuration

Edit cache settings in N8N workflow:
- TTL duration (default: 7 days)
- Max cache size (default: 10,000 entries)
- Cache file path

## 🔧 Development

### Running in Development Mode

```bash
cd threat-compass
npm run dev
```

### Building for Production

```bash
npm run build
npm run preview
```

### Linting

```bash
npm run lint
```

## 📚 Documentation

- **AUTO_UPDATE_SETUP.md**: Complete guide to the auto-update system
- **CACHE_FIX_GUIDE.md**: Caching system implementation guide
- **threat-compass/README.md**: Frontend-specific documentation

## 🎨 UI/UX Features

- **Responsive Design**: Mobile, tablet, and desktop support
- **Dark Mode**: Built-in theme support
- **Loading States**: Skeleton loaders for better UX
- **Error Handling**: Graceful fallbacks
- **Animations**: Smooth transitions and interactions
- **Accessibility**: WCAG-compliant components

## 🔒 Security Considerations

- API keys stored securely in N8N (not in frontend)
- No sensitive data exposed in frontend
- Cache file contains only enrichment data (no PII)
- All data processing happens server-side

## 🚧 Future Enhancements

- Real-time WebSocket updates
- User authentication and authorization
- Custom alert rules and notifications
- Integration with SIEM systems
- Advanced ML-based threat detection
- Historical trend analysis
- Custom report generation
- API for external integrations

## 📄 License

This project is part of a hackathon submission.

## 🤝 Contributing

This is a hackathon project. For questions or improvements, please refer to the project documentation.

## 📞 Support

For issues or questions:
1. Check the documentation files in the project
2. Review N8N workflow logs
3. Check browser console for frontend errors
4. Verify API keys and file paths

---

**Built with ❤️ for Security Operations Teams**

