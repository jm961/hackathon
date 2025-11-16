import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Download, 
  RefreshCw, 
  Clock,
  TrendingUp,
  AlertTriangle,
  Globe,
  Activity
} from "lucide-react";
import { TrendChart } from "@/components/analytics/TrendChart";
import { TopCountriesChart } from "@/components/analytics/TopCountriesChart";
import { RiskDistributionChart } from "@/components/analytics/RiskDistributionChart";
import { TemporalPatternsChart } from "@/components/analytics/TemporalPatternsChart";
import { MOCK_THREATS } from "@/lib/mockData";
import { loadThreatData, checkForDataUpdate } from "@/lib/csvLoader";
import { Skeleton } from "@/components/ui/skeleton";

// Columns needed for Analytics page
const ANALYTICS_COLUMNS = [
  "id",
  "timestamp",
  "threat_level",
  "risk_score",
  "country_code",
  "country",
  "attack_type",
  "final_verdict",
  "final_recommended_action",
  "created_at",
] as const;

const Analytics = () => {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "90d" | "all">("all");
  const [threats, setThreats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadThreats = async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);
    
    try {
      // Load data from n8n workflow (JSON) or CSV fallback
      const loadedThreats = await loadThreatData();
      const sourceThreats = loadedThreats && loadedThreats.length > 0 ? loadedThreats : MOCK_THREATS;
      
      // Filter by time range and select only needed columns
      let filtered = sourceThreats;
      
      if (timeRange !== "all") {
        const now = new Date();
        const ranges = {
          "24h": 24 * 60 * 60 * 1000,
          "7d": 7 * 24 * 60 * 60 * 1000,
          "30d": 30 * 24 * 60 * 60 * 1000,
          "90d": 90 * 24 * 60 * 60 * 1000,
        };

        const startDate = new Date(now.getTime() - ranges[timeRange]);
        filtered = sourceThreats.filter(t => {
          const threatDate = new Date(t.timestamp || t.created_at);
          return threatDate >= startDate;
        });
      }

      // Map to only needed columns
      filtered = filtered
        .map(threat => {
          const filtered: any = {};
          ANALYTICS_COLUMNS.forEach(col => {
            filtered[col] = threat[col];
          });
          return filtered;
        })
        .sort((a, b) => new Date(a.timestamp || a.created_at).getTime() - new Date(b.timestamp || b.created_at).getTime());

      setThreats(filtered);
      setLastUpdated(new Date());
    } catch (error) {
      console.warn('Failed to load threat data, using mock data:', error);
      // Fallback to mock data on error
      // Filter by time range and select only needed columns
      let filtered = MOCK_THREATS;
      
      if (timeRange !== "all") {
        const now = new Date();
        const ranges = {
          "24h": 24 * 60 * 60 * 1000,
          "7d": 7 * 24 * 60 * 60 * 1000,
          "30d": 30 * 24 * 60 * 60 * 1000,
          "90d": 90 * 24 * 60 * 60 * 1000,
        };

        const startDate = new Date(now.getTime() - ranges[timeRange]);
        filtered = MOCK_THREATS.filter(t => {
          const threatDate = new Date(t.timestamp || t.created_at);
          return threatDate >= startDate;
        });
      }

      // Map to only needed columns
      filtered = filtered
        .map(threat => {
          const filtered: any = {};
          ANALYTICS_COLUMNS.forEach(col => {
            filtered[col] = threat[col];
          });
          return filtered;
        })
        .sort((a, b) => new Date(a.timestamp || a.created_at).getTime() - new Date(b.timestamp || b.created_at).getTime());

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
  }, [timeRange]);

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const totalThreats = threats.length;
  const avgRiskScore = threats.length > 0 
    ? threats.reduce((acc, t) => acc + (t.risk_score || 0), 0) / threats.length 
    : 0;
  const criticalCount = threats.filter(t => t.threat_level === "CRITICAL").length;
  const highCount = threats.filter(t => t.threat_level === "HIGH").length;
  const uniqueCountries = new Set(threats.map(t => t.country).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header Section */}
      <div className="relative border-b border-border/50 bg-gradient-to-br from-card/50 via-card/30 to-background overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(139,92,246,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.05),transparent_50%)]" />
        
        <div className="relative container mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">Analytics & Reports</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">Advanced threat intelligence analytics and insights</p>
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
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Threats</div>
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
            <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-500/20 bg-blue-500/5">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
                <Globe className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Countries</div>
                <div className="text-xl font-bold text-blue-500">{uniqueCountries}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10">
                <BarChart3 className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Avg Risk</div>
                <div className="text-xl font-bold text-foreground">{avgRiskScore.toFixed(1)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-6 space-y-6">
        {/* Time Range Selector */}
        <Card className="border border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">Time Range:</span>
                <div className="flex gap-2">
                  {(["all", "24h", "7d", "30d", "90d"] as const).map((range) => (
                    <Button
                      key={range}
                      variant={timeRange === range ? "default" : "outline"}
                      size="sm"
                      className="h-8 px-4 text-xs"
                      onClick={() => setTimeRange(range)}
                    >
                      {range === "all" ? "All Data" : range === "24h" ? "Last 24 Hours" : range === "7d" ? "Last 7 Days" : range === "30d" ? "Last 30 Days" : "Last 90 Days"}
                    </Button>
                  ))}
                </div>
                {threats.length > 0 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({threats.length} threats in range)
                  </span>
                )}
              </div>
              <Button variant="outline" size="sm" className="h-8 px-4 text-xs">
                <Download className="h-3.5 w-3.5 mr-2" />
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts Grid */}
        {isLoading ? (
          <div className="grid gap-4">
            <Card className="border border-border/50">
              <CardHeader>
                <Skeleton className="h-5 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[360px] w-full" />
              </CardContent>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border border-border/50">
                <CardHeader>
                  <Skeleton className="h-5 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[320px] w-full" />
                </CardContent>
              </Card>
              <Card className="border border-border/50">
                <CardHeader>
                  <Skeleton className="h-5 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[320px] w-full" />
                </CardContent>
              </Card>
            </div>
            <Card className="border border-border/50">
              <CardHeader>
                <Skeleton className="h-5 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid gap-4">
            <TrendChart threats={threats} />

            <div className="grid gap-4 md:grid-cols-2">
              <TopCountriesChart threats={threats} />
              <RiskDistributionChart threats={threats} />
            </div>

            <TemporalPatternsChart threats={threats} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
