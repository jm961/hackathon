import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Shield, AlertCircle } from "lucide-react";

interface RiskDistributionChartProps {
  threats?: any[];
}

const COLORS = [
  "#22c55e", // green (0-10)
  "#4ade80", // green (10-20)
  "#86efac", // light green (20-30)
  "#fbbf24", // amber (30-40)
  "#f59e0b", // amber (40-50)
  "#f97316", // orange (50-60)
  "#fb923c", // orange (60-70)
  "#ef4444", // red (70-80)
  "#dc2626", // red (80-90)
  "#b91c1c", // dark red (90-100)
];

export const RiskDistributionChart = ({ threats }: RiskDistributionChartProps) => {
  const buckets = Array.from({ length: 10 }, (_, i) => ({
    range: `${i * 10}-${(i + 1) * 10}`,
    label: i === 9 ? "90-100" : `${i * 10}-${(i + 1) * 10}`,
    count: 0,
  }));

  threats?.forEach((threat) => {
    const score = threat.risk_score || 0;
    const bucketIndex = Math.min(Math.floor(score / 10), 9);
    buckets[bucketIndex].count++;
  });

  const data = buckets.map((bucket, index) => ({
    ...bucket,
    color: COLORS[index],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = buckets.reduce((sum, b) => sum + b.count, 0);
      const percent = total > 0 ? ((data.count / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <div className="text-xs font-semibold mb-1 text-muted-foreground">
            Risk Score Range
          </div>
          <div className="text-sm font-bold mb-1">{data.label}</div>
          <div className="text-xs text-muted-foreground">
            {data.count} {data.count === 1 ? 'threat' : 'threats'} ({percent}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border border-border/50 bg-card/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg font-semibold">Risk Score Distribution</CardTitle>
            </div>
            <CardDescription className="text-sm mt-1">
              Threat distribution across risk score ranges
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {buckets.every(b => b.count === 0) ? (
          <div className="flex flex-col items-center justify-center h-[320px] text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">No risk data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  opacity={0.2}
                  vertical={false}
                />
                <XAxis 
                  dataKey="label" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={600}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            {/* Risk Range Legend */}
            <div className="grid grid-cols-5 gap-2 pt-4 border-t border-border/50">
              {buckets.map((bucket, index) => (
                <div 
                  key={index}
                  className="flex flex-col items-center gap-1 p-2 rounded border border-border/50 bg-background/50"
                >
                  <div 
                    className="w-full h-2 rounded" 
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <div className="text-xs font-medium">{bucket.label}</div>
                  <div className="text-xs text-muted-foreground">{bucket.count}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
