import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Globe, Activity, Brain, Clock, Ban, Check } from "lucide-react";
import { format } from "date-fns";

interface ThreatDetailModalProps {
  threat: any;
  isOpen: boolean;
  onClose: () => void;
}

const getThreatColor = (level: string) => {
  const colors = {
    CRITICAL: "bg-threat-critical text-threat-critical-foreground",
    HIGH: "bg-threat-high text-threat-high-foreground",
    MEDIUM: "bg-threat-medium text-threat-medium-foreground",
    LOW: "bg-threat-low text-threat-low-foreground",
  };
  return colors[level as keyof typeof colors] || "bg-muted text-muted-foreground";
};

export const ThreatDetailModal = ({ threat, isOpen, onClose }: ThreatDetailModalProps) => {
  if (!threat) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl">Threat Analysis Details</DialogTitle>
              <div className="flex items-center gap-2">
                <Badge className={`${getThreatColor(threat.threat_level)} text-base px-3 py-1`}>
                  {threat.threat_level}
                </Badge>
                <span className="text-sm text-muted-foreground font-mono">{threat.source_ip}</span>
              </div>
            </div>
            <div className="text-right space-y-2">
              <Button variant="destructive" size="sm">
                <Ban className="h-4 w-4 mr-1" />
                Block IP
              </Button>
              <Button variant="outline" size="sm" className="ml-2">
                <Check className="h-4 w-4 mr-1" />
                Allow
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
            <TabsTrigger value="geo">Geolocation</TabsTrigger>
            <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
            <TabsTrigger value="ai">AI Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Risk Score</span>
                  </div>
                  <div className="text-2xl font-bold">{threat.risk_score || 0}</div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div
                      className="h-2 rounded-full gradient-danger"
                      style={{ width: `${threat.risk_score || 0}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Anomaly Score</span>
                  </div>
                  <div className="text-2xl font-bold">{threat.anomaly_score?.toFixed(2) || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Timestamp</span>
                  </div>
                  <div className="text-sm font-medium">
                    {format(new Date(threat.timestamp || threat.created_at), "PPpp")}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Source IP</span>
                    <p className="font-mono text-sm mt-1">{threat.source_ip}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Destination IP</span>
                    <p className="font-mono text-sm mt-1">{threat.destination_ip}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Protocol</span>
                    <p className="text-sm mt-1">{threat.protocol}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Attack Type</span>
                    <p className="text-sm mt-1">{threat.attack_type}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="intelligence" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <span className="text-xs text-muted-foreground">AbuseIPDB Score</span>
                  <p className="text-lg font-bold mt-1">{threat.abuseipdb_score || "N/A"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">OTX Pulses</span>
                  <p className="text-lg font-bold mt-1">{threat.otx_pulses || 0}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Malware Families</span>
                  <p className="text-sm mt-1">{threat.malware_families || "None detected"}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geo" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5" />
                  <span className="font-semibold">Geographic Information</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Country</span>
                    <p className="text-sm mt-1">{threat.country}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">City</span>
                    <p className="text-sm mt-1">{threat.city || "Unknown"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">ISP</span>
                    <p className="text-sm mt-1">{threat.isp || "Unknown"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Organization</span>
                    <p className="text-sm mt-1">{threat.organization || "Unknown"}</p>
                  </div>
                </div>
                {(threat.is_vpn_proxy || threat.is_datacenter || threat.is_tor) && (
                  <div className="flex gap-2 pt-4 border-t">
                    {threat.is_vpn_proxy && <Badge variant="destructive">VPN/Proxy</Badge>}
                    {threat.is_datacenter && <Badge variant="destructive">Datacenter</Badge>}
                    {threat.is_tor && <Badge variant="destructive">Tor</Badge>}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <span className="text-sm font-semibold">Risk Factors</span>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {threat.risk_factors?.split(",").map((factor: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {factor.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Severity Level</span>
                    <p className="text-sm mt-1">{threat.severity_level}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">High Risk Country</span>
                    <p className="text-sm mt-1">{threat.is_high_risk_country ? "Yes" : "No"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="h-5 w-5" />
                  <span className="font-semibold">AI Analysis</span>
                </div>
                
                <div className="space-y-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Final Verdict</span>
                    <Badge className={getThreatColor(threat.final_threat_level)}>
                      {threat.final_verdict}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Confidence Score</span>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-muted-foreground/20 rounded-full h-2">
                        <div
                          className="h-2 rounded-full gradient-primary"
                          style={{ width: `${threat.final_confidence || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{threat.final_confidence}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Recommended Action</span>
                    <p className="text-sm font-medium mt-1">{threat.final_recommended_action}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Reasoning</span>
                    <p className="text-sm mt-2 leading-relaxed">{threat.final_reasoning}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
