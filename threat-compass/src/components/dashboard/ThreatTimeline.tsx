import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";

interface ThreatTimelineProps {
  threats?: any[];
}

export const ThreatTimeline = ({ threats }: ThreatTimelineProps) => {
  const timelineData = threats?.reduce((acc: any, threat) => {
    const date = format(new Date(threat.timestamp || threat.created_at), "MMM dd");
    if (!acc[date]) {
      acc[date] = { date, CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    }
    acc[date][threat.threat_level] = (acc[date][threat.threat_level] || 0) + 1;
    return acc;
  }, {});

  const data = Object.values(timelineData || {}).slice(-30);

  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold">Threat Timeline</CardTitle>
        <CardDescription className="text-xs mt-1">Last 30 days threat activity</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="CRITICAL"
              stroke="hsl(var(--threat-critical))"
              strokeWidth={2}
            />
            <Line type="monotone" dataKey="HIGH" stroke="hsl(var(--threat-high))" strokeWidth={2} />
            <Line
              type="monotone"
              dataKey="MEDIUM"
              stroke="hsl(var(--threat-medium))"
              strokeWidth={2}
            />
            <Line type="monotone" dataKey="LOW" stroke="hsl(var(--threat-low))" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
