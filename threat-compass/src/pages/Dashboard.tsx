import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  TrendingUp, 
  Globe,
  Zap,
  Clock,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { ThreatLevelChart } from "@/components/dashboard/ThreatLevelChart";
import { AttackTypeChart } from "@/components/dashboard/AttackTypeChart";
import { ThreatTimeline } from "@/components/dashboard/ThreatTimeline";
import { RecentThreats } from "@/components/dashboard/RecentThreats";
import { GeographicMap } from "@/components/dashboard/GeographicMap";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MOCK_THREATS } from "@/lib/mockData";
import { useState, useEffect } from "react";
import { loadThreatData } from "@/lib/csvLoader";

// Columns needed for Dashboard page
const DASHBOARD_COLUMNS = [
  "id",
  "threat_level",
  "final_recommended_action",
  "risk_score",
  "created_at",
  "attack_type",
  "country_code",
  "country",
  "latitude",
  "longitude",
  "timestamp",
] as const;

const Dashboard = () => {
  const [threats, setThreats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadThreats = async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);
    
    try {
      // Load data from n8n workflow (JSON) or CSV fallback
      const loadedThreats = await loadThreatData();
      
      if (loadedThreats && loadedThreats.length > 0) {
        // Filter to only needed columns
        const filteredThreats = loadedThreats.map(threat => {
          const filtered: any = {};
          DASHBOARD_COLUMNS.forEach(col => {
            filtered[col] = threat[col];
          });
          return filtered;
        }).sort((a, b) => new Date(b.created_at || b.timestamp).getTime() - new Date(a.created_at || a.timestamp).getTime());
        
        setThreats(filteredThreats);
        setLastUpdated(new Date());
      } else {
        // Fallback to mock data if no data loaded
        const filteredThreats = MOCK_THREATS.map(threat => {
          const filtered: any = {};
          DASHBOARD_COLUMNS.forEach(col => {
            filtered[col] = threat[col];
          });
          return filtered;
        }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        setThreats(filteredThreats);
        setLastUpdated(new Date());
        console.log(`✅ Loaded ${filteredThreats.length} threats at ${new Date().toLocaleTimeString()}`);
      }
    } catch (error) {
      console.error('❌ Failed to load threat data:', error);
      // Fallback to mock data on error
      const filteredThreats = MOCK_THREATS.map(threat => {
        const filtered: any = {};
        DASHBOARD_COLUMNS.forEach(col => {
          filtered[col] = threat[col];
        });
        return filtered;
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setThreats(filteredThreats);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadThreats();
    
    // Auto-refresh every 10 seconds to get latest data from n8n workflow
    const refreshInterval = setInterval(() => {
      loadThreats(true);
    }, 10000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const stats = {
    total: threats?.length || 0,
    critical: threats?.filter((t) => t.threat_level === "CRITICAL").length || 0,
    high: threats?.filter((t) => t.threat_level === "HIGH").length || 0,
    medium: threats?.filter((t) => t.threat_level === "MEDIUM").length || 0,
    low: threats?.filter((t) => t.threat_level === "LOW").length || 0,
    blocked: threats?.filter((t) => t.final_recommended_action === "BLOCK").length || 0,
    monitored: threats?.filter((t) => t.final_recommended_action === "MONITOR").length || 0,
    avgRisk: threats?.reduce((acc, t) => acc + (t.risk_score || 0), 0) / (threats?.length || 1) || 0,
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header Section */}
      <div className="relative border-b border-border/50 bg-gradient-to-br from-card/50 via-card/30 to-background overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.05),transparent_50%)]" />
        
        <div className="relative container mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">Security Operations Dashboard</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">Real-time threat intelligence and security monitoring</p>
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
                onClick={() => {
                  console.log('🔄 Manual refresh triggered');
                  loadThreats(true);
                }}
                disabled={isRefreshing}
                className="h-8"
                title="Force refresh threat data"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Threats</div>
                <div className="text-xl font-bold text-foreground">{stats.total.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Critical</div>
                <div className="text-xl font-bold text-red-500">{stats.critical.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Blocked</div>
                <div className="text-xl font-bold text-green-500">{stats.blocked.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/10">
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Avg Risk</div>
                <div className="text-xl font-bold text-foreground">{stats.avgRisk.toFixed(1)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-6 space-y-6">
        {/* Enhanced KPI Cards */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border border-border/50">
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-7 w-16" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300 hover:shadow-lg group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
              <CardHeader className="pb-3 relative">
                <div className="flex items-center justify-between mb-3">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Threats
                  </CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-foreground">{stats.total.toLocaleString()}</div>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    <span>Active monitoring</span>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300 hover:shadow-lg group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-red-500/10 transition-colors" />
              <CardHeader className="pb-3 relative">
                <div className="flex items-center justify-between mb-3">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Critical Threats
                  </CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-red-500">{stats.critical.toLocaleString()}</div>
                  {stats.critical > 0 && (
                    <ArrowUpRight className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="text-xs text-muted-foreground">Requires immediate action</div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300 hover:shadow-lg group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-green-500/10 transition-colors" />
              <CardHeader className="pb-3 relative">
                <div className="flex items-center justify-between mb-3">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Threats Blocked
                  </CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-green-500">{stats.blocked.toLocaleString()}</div>
                  {stats.blocked > 0 && (
                    <ArrowDownRight className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="text-xs text-muted-foreground">Successfully mitigated</div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300 hover:shadow-lg group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-colors" />
              <CardHeader className="pb-3 relative">
                <div className="flex items-center justify-between mb-3">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Avg Risk Score
                  </CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                  </div>

                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-foreground">{stats.avgRisk.toFixed(1)}</div>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
                      style={{ width: `${Math.min(stats.avgRisk, 100)}%` }}
                    />
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Threat Level Distribution Cards */}
        {!isLoading && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border border-red-500/20 bg-red-500/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Critical
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-red-500 mt-2">{stats.critical}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.total > 0 ? ((stats.critical / stats.total) * 100).toFixed(1) : 0}% of total
                </div>
              </CardHeader>
            </Card>
            <Card className="border border-orange-500/20 bg-orange-500/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    High
                  </CardTitle>
                  <Zap className="h-4 w-4 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-orange-500 mt-2">{stats.high}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.total > 0 ? ((stats.high / stats.total) * 100).toFixed(1) : 0}% of total
                </div>
              </CardHeader>
            </Card>
            <Card className="border border-yellow-500/20 bg-yellow-500/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Medium
                  </CardTitle>
                  <Activity className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-yellow-500 mt-2">{stats.medium}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.total > 0 ? ((stats.medium / stats.total) * 100).toFixed(1) : 0}% of total
                </div>
              </CardHeader>
            </Card>
            <Card className="border border-green-500/20 bg-green-500/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Low
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-500 mt-2">{stats.low}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.total > 0 ? ((stats.low / stats.total) * 100).toFixed(1) : 0}% of total
                </div>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {isLoading ? (
            <>
              <Card className="border border-border/50">
                <CardHeader className="pb-4">
                  <Skeleton className="h-5 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[280px] w-full" />
                </CardContent>
              </Card>
              <Card className="border border-border/50">
                <CardHeader className="pb-4">
                  <Skeleton className="h-5 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[280px] w-full" />
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <ThreatLevelChart threats={threats} />
              <AttackTypeChart threats={threats} />
            </>
          )}
        </div>

        {/* Geographic Map */}
        {isLoading ? (
          <Card className="border border-border/50">
            <CardHeader className="pb-4">
              <Skeleton className="h-5 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[360px] w-full" />
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-border/50 bg-card/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-lg font-semibold">Geographic Threat Distribution</CardTitle>
              </div>
              <CardDescription className="text-sm mt-1">Global threat origin analysis and geographic patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <GeographicMap threats={threats} />
            </CardContent>
          </Card>
        )}

        {/* Timeline and Recent Threats */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {isLoading ? (
              <Card className="border border-border/50">
                <CardHeader className="pb-4">
                  <Skeleton className="h-5 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[280px] w-full" />
                </CardContent>
              </Card>
            ) : (
              <ThreatTimeline threats={threats} />
            )}
          </div>
          <div>
            {isLoading ? (
              <Card className="border border-border/50">
                <CardHeader className="pb-4">
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[360px] w-full" />
                </CardContent>
              </Card>
            ) : (
              <RecentThreats threats={threats} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
