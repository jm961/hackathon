import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { AlertTriangle, Zap, Activity, CheckCircle } from "lucide-react";

interface ThreatLevelChartProps {
  threats?: any[];
}

const COLORS = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#22c55e",
};

const ICONS = {
  CRITICAL: AlertTriangle,
  HIGH: Zap,
  MEDIUM: Activity,
  LOW: CheckCircle,
};

export const ThreatLevelChart = ({ threats }: ThreatLevelChartProps) => {
  const data = [
    {
      name: "CRITICAL",
      value: threats?.filter((t) => t.threat_level === "CRITICAL").length || 0,
      color: COLORS.CRITICAL,
      icon: ICONS.CRITICAL,
    },
    {
      name: "HIGH",
      value: threats?.filter((t) => t.threat_level === "HIGH").length || 0,
      color: COLORS.HIGH,
      icon: ICONS.HIGH,
    },
    {
      name: "MEDIUM",
      value: threats?.filter((t) => t.threat_level === "MEDIUM").length || 0,
      color: COLORS.MEDIUM,
      icon: ICONS.MEDIUM,
    },
    {
      name: "LOW",
      value: threats?.filter((t) => t.threat_level === "LOW").length || 0,
      color: COLORS.LOW,
      icon: ICONS.LOW,
    },
  ].filter((d) => d.value > 0);

  const total = threats?.length || 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percent = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.payload.color }}
            />
            <span className="font-semibold text-sm">{data.name}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {data.value} threats ({percent}%)
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => {
          const Icon = data.find(d => d.name === entry.value)?.icon || AlertTriangle;
          const item = data.find(d => d.name === entry.value);
          const percent = total > 0 ? ((item?.value || 0) / total * 100).toFixed(1) : 0;
          
          return (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <Icon className="h-3.5 w-3.5" style={{ color: entry.color }} />
              <span className="text-xs font-medium">{entry.value}</span>
              <span className="text-xs text-muted-foreground">
                ({item?.value || 0} - {percent}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="border border-border/50 bg-card/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Threat Level Distribution</CardTitle>
            <CardDescription className="text-sm mt-1">
              {total.toLocaleString()} {total === 1 ? 'threat' : 'threats'} analyzed
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[320px] text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">No threat data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  animationDuration={600}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke={entry.color}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            <CustomLegend payload={data.map((d, i) => ({ 
              value: d.name, 
              color: d.color,
              payload: d 
            }))} />
            
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
              {data.map((item, index) => {
                const Icon = item.icon;
                const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                return (
                  <div 
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-background/50"
                  >
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: item.color }}
                    />
                    <Icon className="h-4 w-4 flex-shrink-0" style={{ color: item.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.value} ({percent}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
