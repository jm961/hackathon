import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";

interface AttackTypeChartProps {
  threats?: any[];
}

const COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // green
  "#ef4444", // red
  "#06b6d4", // cyan
  "#f97316", // orange
  "#6366f1", // indigo
  "#14b8a6", // teal
];

export const AttackTypeChart = ({ threats }: AttackTypeChartProps) => {
  const attackCounts = threats?.reduce((acc: any, threat) => {
    const type = threat.attack_type || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(attackCounts || {})
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
    .map((item, index) => ({
      ...item,
      color: COLORS[index % COLORS.length],
    }));

  const totalTypes = Object.keys(attackCounts || {}).length;
  const totalThreats = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percent = totalThreats > 0 ? ((data.value / totalThreats) * 100).toFixed(1) : 0;
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded" 
              style={{ backgroundColor: data.color }}
            />
            <span className="font-semibold text-sm">{data.name}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {data.value} {data.value === 1 ? 'threat' : 'threats'} ({percent}%)
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
            <CardTitle className="text-lg font-semibold">Attack Type Distribution</CardTitle>
            <CardDescription className="text-sm mt-1">
              Top {Math.min(8, totalTypes)} attack types detected
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>{totalThreats} total</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[320px] text-muted-foreground">
            <BarChart3 className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">No attack data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart 
                data={data} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  opacity={0.2}
                  horizontal={true}
                  vertical={false}
                />
                <XAxis 
                  type="number" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={140}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  radius={[0, 6, 6, 0]}
                  animationDuration={600}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            {/* Attack Type List */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border/50">
              {data.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-background/50"
                >
                  <div 
                    className="w-2.5 h-2.5 rounded flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.value} {item.value === 1 ? 'threat' : 'threats'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
