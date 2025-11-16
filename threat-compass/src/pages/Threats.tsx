import { useState, useEffect } from "react";
import { ThreatTable } from "@/components/threats/ThreatTable";
import { ThreatFilters } from "@/components/threats/ThreatFilters";
import { ThreatDetailModal } from "@/components/threats/ThreatDetailModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Shield, 
  RefreshCw, 
  Clock,
  Filter,
  Search,
  TrendingUp,
  Globe
} from "lucide-react";
import { MOCK_THREATS } from "@/lib/mockData";
import { loadThreatData, checkForDataUpdate } from "@/lib/csvLoader";

export interface ThreatFilters {
  threatLevels: string[];
  attackTypes: string[];
  countries: string[];
  riskScoreRange: [number, number];
  dateRange: { from: Date | undefined; to: Date | undefined };
  protocols: string[];
  verdicts: string[];
  actions: string[];
  searchIp: string;
}

const Threats = () => {
  const [filters, setFilters] = useState<ThreatFilters>({
    threatLevels: [],
    attackTypes: [],
    countries: [],
    riskScoreRange: [0, 100],
    dateRange: { from: undefined, to: undefined },
    protocols: [],
    verdicts: [],
    actions: [],
    searchIp: "",
  });

  const [selectedThreat, setSelectedThreat] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [threats, setThreats] = useState<any[]>([]);
  const [allThreats, setAllThreats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Helper function to apply filters
  const applyFilters = (threats: any[]): any[] => {
    let filtered = [...threats];

    if (filters.threatLevels.length > 0) {
      filtered = filtered.filter(t => filters.threatLevels.includes(t.threat_level));
    }
    if (filters.attackTypes.length > 0) {
      filtered = filtered.filter(t => filters.attackTypes.includes(t.attack_type));
    }
    if (filters.countries.length > 0) {
      filtered = filtered.filter(t => filters.countries.includes(t.country_code));
    }
    if (filters.protocols.length > 0) {
      filtered = filtered.filter(t => filters.protocols.includes(t.protocol));
    }
    if (filters.verdicts.length > 0) {
      filtered = filtered.filter(t => filters.verdicts.includes(t.final_verdict));
    }
    if (filters.actions.length > 0) {
      filtered = filtered.filter(t => filters.actions.includes(t.final_recommended_action));
    }
    if (filters.searchIp) {
      const searchLower = filters.searchIp.toLowerCase();
      filtered = filtered.filter(t => 
        t.source_ip?.toLowerCase().includes(searchLower) ||
        t.destination_ip?.toLowerCase().includes(searchLower)
      );
    }
    if (filters.dateRange.from) {
      filtered = filtered.filter(t => new Date(t.timestamp || t.created_at) >= filters.dateRange.from!);
    }
    if (filters.dateRange.to) {
      filtered = filtered.filter(t => new Date(t.timestamp || t.created_at) <= filters.dateRange.to!);
    }
    filtered = filtered.filter(
      t => t.risk_score >= filters.riskScoreRange[0] && t.risk_score <= filters.riskScoreRange[1]
    );
    filtered.sort((a, b) => 
      new Date(b.created_at || b.timestamp).getTime() - new Date(a.created_at || a.timestamp).getTime()
    );

    return filtered;
  };

  const loadThreats = async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);
    
    try {
      // Load data from n8n workflow (JSON) or CSV fallback
      const loadedThreats = await loadThreatData();
      const sourceThreats = loadedThreats && loadedThreats.length > 0 ? loadedThreats : MOCK_THREATS;
      setAllThreats(sourceThreats);
      const filtered = applyFilters(sourceThreats);
      setThreats(filtered);
      setLastUpdated(new Date());
    } catch (error) {
      console.warn('Failed to load threat data, using mock data:', error);
      // Fallback to mock data on error
      setAllThreats(MOCK_THREATS);
      const filtered = applyFilters(MOCK_THREATS);
      setThreats(filtered);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadThreats();
    
    // Check for updates every 3 seconds (lightweight metadata check)
    const checkInterval = setInterval(async () => {
      const { updated } = await checkForDataUpdate();
      if (updated) {
        console.log('🔔 New data detected, reloading...');
        loadThreats(true);
      }
    }, 3000);
    
    return () => clearInterval(checkInterval);
  }, []);

  useEffect(() => {
    const filtered = applyFilters(allThreats);
    setThreats(filtered);
  }, [filters]);

  const handleViewDetails = (threat: any) => {
    setSelectedThreat(threat);
    setIsModalOpen(true);
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const totalThreats = threats.length;
  const criticalCount = threats.filter(t => t.threat_level === "CRITICAL").length;
  const highCount = threats.filter(t => t.threat_level === "HIGH").length;
  const blockedCount = threats.filter(t => t.final_recommended_action === "BLOCK").length;
  const avgRisk = threats.length > 0 
    ? threats.reduce((acc, t) => acc + (t.risk_score || 0), 0) / threats.length 
    : 0;

  const activeFiltersCount =
    filters.threatLevels.length +
    filters.attackTypes.length +
    filters.countries.length +
    filters.protocols.length +
    filters.verdicts.length +
    filters.actions.length +
    (filters.searchIp ? 1 : 0) +
    (filters.riskScoreRange[0] > 0 || filters.riskScoreRange[1] < 100 ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header Section */}
      <div className="relative border-b border-border/50 bg-gradient-to-br from-card/50 via-card/30 to-background overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(239,68,68,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.05),transparent_50%)]" />
        
        <div className="relative container mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">Threat Analysis</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">Comprehensive threat intelligence and network security analysis</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Updated {formatTimeAgo(lastUpdated)}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadThreats(true)}
                disabled={isRefreshing}
                className="h-8"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Total</div>
                <div className="text-xl font-bold text-foreground">{totalThreats.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-red-500/20 bg-red-500/5">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Critical</div>
                <div className="text-xl font-bold text-red-500">{criticalCount.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-orange-500/20 bg-orange-500/5">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/10">
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">High</div>
                <div className="text-xl font-bold text-orange-500">{highCount.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-green-500/20 bg-green-500/5">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Blocked</div>
                <div className="text-xl font-bold text-green-500">{blockedCount.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
                <Globe className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Avg Risk</div>
                <div className="text-xl font-bold text-foreground">{avgRisk.toFixed(1)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-6 space-y-6">
        <div className="grid gap-4 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <Card className="lg:col-span-1 border border-border/50 bg-card/50">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Filters</h3>
                {activeFiltersCount > 0 && (
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <ThreatFilters filters={filters} setFilters={setFilters} threats={allThreats} />
            </div>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            <ThreatTable
              threats={threats}
              isLoading={isLoading}
              onViewDetails={handleViewDetails}
            />
          </div>
        </div>

        <ThreatDetailModal
          threat={selectedThreat}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default Threats;
