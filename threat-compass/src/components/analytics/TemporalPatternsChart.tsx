import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Clock, AlertCircle } from "lucide-react";

interface TemporalPatternsChartProps {
  threats?: any[];
}

const COLORS = Array.from({ length: 24 }, (_, hour) => {
  // Color gradient from blue (night) to orange (day) to blue (night)
  if (hour >= 6 && hour < 12) {
    // Morning: blue to cyan
    return `hsl(${210 + (hour - 6) * 2}, 70%, 50%)`;
  } else if (hour >= 12 && hour < 18) {
    // Afternoon: cyan to orange
    return `hsl(${222 + (hour - 12) * 8}, 70%, 50%)`;
  } else if (hour >= 18 && hour < 22) {
    // Evening: orange to red
    return `hsl(${30 - (hour - 18) * 5}, 70%, 50%)`;
  } else {
    // Night: red to blue
    return `hsl(${10 + (hour >= 22 ? hour - 22 : hour + 2) * 10}, 70%, 40%)`;
  }
});

export const TemporalPatternsChart = ({ threats }: TemporalPatternsChartProps) => {
  const hourCounts = Array.from({ length: 24 }, (_, hour) => ({
    hour: hour.toString().padStart(2, "0") + ":00",
    hourNum: hour,
    count: 0,
  }));

  threats?.forEach((threat) => {
    const hour = threat.hour || new Date(threat.timestamp || threat.created_at).getHours();
    hourCounts[hour].count++;
  });

  const data = hourCounts.map((item, index) => ({
    ...item,
    color: COLORS[index],
  }));

  const maxCount = Math.max(...data.map(d => d.count));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <div className="text-xs font-semibold mb-1 text-muted-foreground">
            Time of Day
          </div>
          <div className="text-sm font-bold mb-1">{data.hour}</div>
          <div className="text-xs text-muted-foreground">
            {data.count} {data.count === 1 ? 'threat' : 'threats'} detected
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
              <Clock className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg font-semibold">Threats by Hour of Day</CardTitle>
            </div>
            <CardDescription className="text-sm mt-1">
              24-hour threat activity pattern and temporal analysis
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {hourCounts.every(h => h.count === 0) ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">No temporal data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart 
                data={data} 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  opacity={0.2}
                  vertical={false}
                />
                <XAxis 
                  dataKey="hour" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval={2}
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
            
            {/* Peak Hours Summary */}
            <div className="pt-4 border-t border-border/50">
              <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                Peak Activity Hours
              </div>
              <div className="flex flex-wrap gap-2">
                {data
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .filter(item => item.count > 0)
                  .map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-background/50"
                    >
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-medium">{item.hour}</span>
                      <span className="text-xs text-muted-foreground">({item.count})</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
