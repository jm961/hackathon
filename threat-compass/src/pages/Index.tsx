import { Link } from "react-router-dom";
import { 
  Shield, 
  AlertTriangle, 
  BarChart3, 
  Zap, 
  Globe, 
  Lock, 
  Activity,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { loadThreatData } from "@/lib/csvLoader";

const Index = () => {
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    blocked: 0,
    avgRisk: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const threats = await loadThreatData();
        if (threats && threats.length > 0) {
          setStats({
            total: threats.length,
            critical: threats.filter((t: any) => t.threat_level === "CRITICAL").length,
            blocked: threats.filter((t: any) => t.final_recommended_action === "BLOCK").length,
            avgRisk: threats.reduce((acc: number, t: any) => acc + (t.risk_score || 0), 0) / threats.length || 0,
          });
        }
      } catch (error) {
        console.warn('Failed to load stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Real-Time Threat Detection",
      description: "Advanced AI-powered threat intelligence with continuous monitoring and instant alerts",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive threat analysis with risk scoring, geographic mapping, and trend visualization",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Globe,
      title: "Global Intelligence",
      description: "Worldwide threat intelligence with geolocation tracking and country-level risk assessment",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Zap,
      title: "Automated Response",
      description: "Intelligent decision-making with AI recommendations for blocking, monitoring, or investigation",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Lock,
      title: "Multi-Layer Security",
      description: "Combined analysis from multiple threat intelligence sources including AbuseIPDB, VirusTotal, and OTX",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      icon: Activity,
      title: "Continuous Monitoring",
      description: "24/7 security operations with automated workflow processing and real-time updates",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border/50">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        
        <div className="relative container mx-auto px-8 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm mb-8">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                AI-Powered Threat Intelligence
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/80">
              Secure Your Network with
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Intelligent Threat Detection
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Advanced cybersecurity platform combining AI analysis, global threat intelligence, 
              and automated response to protect your infrastructure from emerging threats.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link to="/dashboard">
                  <Activity className="mr-2 h-5 w-5" />
                  View Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                <Link to="/threats">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Explore Threats
                </Link>
              </Button>
            </div>

            {/* Stats */}
            {!isLoading && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {stats.total.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Total Threats
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500 mb-1">
                    {stats.critical.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Critical
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500 mb-1">
                    {stats.blocked.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Blocked
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {stats.avgRisk.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Avg Risk
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Comprehensive Security Platform
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need for modern threat intelligence and security operations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300 hover:shadow-lg group"
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Key Benefits Section */}
      <div className="border-t border-border/50 bg-card/30">
        <div className="container mx-auto px-8 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold tracking-tight mb-4">
                Why Choose Threat Compass?
              </h2>
              <p className="text-lg text-muted-foreground">
                Built for security teams who demand excellence
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">AI-Powered Analysis</h3>
                  <p className="text-muted-foreground">
                    Dual AI model analysis (GPT-4 & Gemini) for comprehensive threat assessment 
                    with confidence scoring and agreement detection.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Real-Time Updates</h3>
                  <p className="text-muted-foreground">
                    Automatic data synchronization from n8n workflows with live dashboard updates 
                    every 30 seconds.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Multi-Source Intelligence</h3>
                  <p className="text-muted-foreground">
                    Aggregated data from AbuseIPDB, VirusTotal, OTX, and geolocation services 
                    for complete threat context.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Actionable Insights</h3>
                  <p className="text-muted-foreground">
                    Clear recommendations (BLOCK, MONITOR, INVESTIGATE) with detailed reasoning 
                    and risk factor analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t border-border/50">
        <div className="container mx-auto px-8 py-24">
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.15),transparent_50%)]" />
            <div className="relative p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
                Explore the dashboard to see real-time threat intelligence, analyze security patterns, 
                and make data-driven security decisions.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="h-12 px-8">
                  <Link to="/dashboard">
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8">
                  <Link to="/analytics">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    View Analytics
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
