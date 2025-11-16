import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { TrendingUp, AlertCircle } from "lucide-react";

interface TrendChartProps {
  threats?: any[];
}

const COLORS = {
  total: "#3b82f6",
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#22c55e",
};

export const TrendChart = ({ threats }: TrendChartProps) => {
  const data = threats?.reduce((acc: any, threat) => {
    const date = format(new Date(threat.timestamp || threat.created_at), "MMM dd");
    if (!acc[date]) {
      acc[date] = { date, CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, total: 0 };
    }
    acc[date][threat.threat_level] = (acc[date][threat.threat_level] || 0) + 1;
    acc[date].total += 1;
    return acc;
  }, {});

  const chartData = Object.values(data || {});

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <div className="text-xs font-semibold mb-2 text-muted-foreground">
            {payload[0].payload.date}
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs font-medium">{entry.name}:</span>
              <span className="text-xs font-semibold">{entry.value}</span>
            </div>
          ))}
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
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg font-semibold">Threat Trends Over Time</CardTitle>
            </div>
            <CardDescription className="text-sm mt-1">
              Threat activity by level across selected time range
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[360px] text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">No trend data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
              <XAxis 
                dataKey="date" 
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
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke={COLORS.total}
                strokeWidth={3}
                name="Total Threats"
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="CRITICAL"
                stroke={COLORS.CRITICAL}
                strokeWidth={2}
                name="Critical"
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="HIGH" 
                stroke={COLORS.HIGH} 
                strokeWidth={2} 
                name="High"
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="MEDIUM"
                stroke={COLORS.MEDIUM}
                strokeWidth={2}
                name="Medium"
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="LOW" 
                stroke={COLORS.LOW} 
                strokeWidth={2} 
                name="Low"
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
