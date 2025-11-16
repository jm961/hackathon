import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface RecentThreatsProps {
  threats?: any[];
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

export const RecentThreats = ({ threats }: RecentThreatsProps) => {
  const recent = threats?.slice(0, 10) || [];

  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold">Recent Threats</CardTitle>
        <CardDescription className="text-xs mt-1">Latest threat detections</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[360px] pr-4">
          <div className="space-y-3">
            {recent.map((threat, index) => (
              <div
                key={index}
                className="p-3 rounded border border-border/50 bg-card/30 hover:bg-card/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getThreatColor(threat.threat_level)}>{threat.threat_level}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(threat.timestamp || threat.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {threat.attack_type || "Unknown Attack"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {threat.source_ip}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">Risk:</span>
                    <div className="flex-1 bg-muted rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full gradient-danger"
                        style={{ width: `${threat.risk_score || 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{threat.risk_score || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
