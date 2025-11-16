import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import { ThreatFilters as ThreatFiltersType } from "@/pages/Threats";

interface ThreatFiltersProps {
  filters: ThreatFiltersType;
  setFilters: (filters: ThreatFiltersType) => void;
  threats?: any[];
}

export const ThreatFilters = ({ filters, setFilters, threats }: ThreatFiltersProps) => {
  const threatLevels = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const protocols = ["TCP", "UDP", "ICMP"];
  const verdicts = ["Malicious", "Suspicious", "Benign"];
  const actions = ["BLOCK", "MONITOR", "ALLOW"];

  const attackTypes = [...new Set(threats?.map((t) => t.attack_type).filter(Boolean))];
  const countries = [...new Set(threats?.map((t) => t.country).filter(Boolean))];

  const handleCheckbox = (field: keyof ThreatFiltersType, value: string) => {
    const current = filters[field] as string[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFilters({ ...filters, [field]: updated });
  };

  const clearFilters = () => {
    setFilters({
      threatLevels: [],
      attackTypes: [],
      countries: [],
      riskScoreRange: [0, 100],
      dateRange: { from: undefined, to: undefined },
      protocols: [],
      verdicts: [],
      actions: [],
      searchIp: "",
    });
  };

  const activeFiltersCount =
    filters.threatLevels.length +
    filters.attackTypes.length +
    filters.countries.length +
    filters.protocols.length +
    filters.verdicts.length +
    filters.actions.length +
    (filters.searchIp ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </h3>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clearFilters}>
            <X className="h-3 w-3 mr-1" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>

      <div className="space-y-5">
        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Search IP Address</Label>
          <Input
            placeholder="192.168.1.1"
            value={filters.searchIp}
            onChange={(e) => setFilters({ ...filters, searchIp: e.target.value })}
            className="font-mono text-xs h-8"
          />
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">Threat Level</Label>
          <div className="space-y-2">
            {threatLevels.map((level) => (
              <div key={level} className="flex items-center gap-2">
                <Checkbox
                  id={level}
                  checked={filters.threatLevels.includes(level)}
                  onCheckedChange={() => handleCheckbox("threatLevels", level)}
                />
                <label htmlFor={level} className="text-xs cursor-pointer font-medium">
                  {level}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">Risk Score Range</Label>
          <Slider
            min={0}
            max={100}
            step={1}
            value={filters.riskScoreRange}
            onValueChange={(value) => setFilters({ ...filters, riskScoreRange: value as [number, number] })}
            className="mt-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{filters.riskScoreRange[0]}</span>
            <span>{filters.riskScoreRange[1]}</span>
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">Protocol</Label>
          <div className="space-y-2">
            {protocols.map((protocol) => (
              <div key={protocol} className="flex items-center gap-2">
                <Checkbox
                  id={protocol}
                  checked={filters.protocols.includes(protocol)}
                  onCheckedChange={() => handleCheckbox("protocols", protocol)}
                />
                <label htmlFor={protocol} className="text-xs cursor-pointer font-medium">
                  {protocol}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">Verdict</Label>
          <div className="space-y-2">
            {verdicts.map((verdict) => (
              <div key={verdict} className="flex items-center gap-2">
                <Checkbox
                  id={verdict}
                  checked={filters.verdicts.includes(verdict)}
                  onCheckedChange={() => handleCheckbox("verdicts", verdict)}
                />
                <label htmlFor={verdict} className="text-xs cursor-pointer font-medium">
                  {verdict}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">Recommended Action</Label>
          <div className="space-y-2">
            {actions.map((action) => (
              <div key={action} className="flex items-center gap-2">
                <Checkbox
                  id={action}
                  checked={filters.actions.includes(action)}
                  onCheckedChange={() => handleCheckbox("actions", action)}
                />
                <label htmlFor={action} className="text-xs cursor-pointer font-medium">
                  {action}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
