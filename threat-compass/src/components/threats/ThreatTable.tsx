import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface ThreatTableProps {
  threats?: any[];
  isLoading: boolean;
  onViewDetails: (threat: any) => void;
}

const getThreatColor = (level: string) => {
  const colors = {
    CRITICAL: "bg-red-500/10 text-red-500 border-red-500/20",
    HIGH: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    MEDIUM: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    LOW: "bg-green-500/10 text-green-500 border-green-500/20",
  };
  return colors[level as keyof typeof colors] || "bg-muted text-muted-foreground border-border";
};

const getActionColor = (action: string) => {
  const colors: Record<string, string> = {
    BLOCK: "bg-red-500/10 text-red-500 border-red-500/20",
    MONITOR: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    ALLOW: "bg-green-500/10 text-green-500 border-green-500/20",
    INVESTIGATE: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };
  return colors[action] || "bg-muted text-muted-foreground border-border";
};

export const ThreatTable = ({ threats, isLoading, onViewDetails }: ThreatTableProps) => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const paginatedThreats = threats?.slice((page - 1) * perPage, page * perPage) || [];
  const totalPages = Math.ceil((threats?.length || 0) / perPage);

  if (isLoading) {
    return (
      <Card className="border border-border/50 bg-card/50">
        <CardHeader className="pb-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/50 bg-card/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Threat List</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Showing <span className="font-medium text-foreground">{paginatedThreats.length}</span> of{" "}
              <span className="font-medium text-foreground">{threats?.length || 0}</span> threats
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Per page:</span>
            {[25, 50, 100].map((size) => (
              <Button
                key={size}
                variant={perPage === size ? "default" : "outline"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => {
                  setPerPage(size);
                  setPage(1);
                }}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {paginatedThreats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-sm font-medium text-foreground mb-1">No threats found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your filters to see more results</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border/50 overflow-hidden bg-background">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 bg-muted/30">
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timestamp</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source IP</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Country</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attack Type</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Threat Level</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk Score</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Verdict</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedThreats.map((threat, index) => (
                  <TableRow 
                    key={index} 
                    className="border-b border-border/50 hover:bg-card/50 transition-colors cursor-pointer"
                    onClick={() => onViewDetails(threat)}
                  >
                    <TableCell className="text-xs py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(threat.timestamp || threat.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs py-4 font-medium">
                      {threat.source_ip || "N/A"}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{getFlagEmoji(threat.country_code)}</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">{threat.country || "Unknown"}</span>
                          <span className="text-xs text-muted-foreground">{threat.country_code || "??"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className="text-xs font-medium border-border/50">
                        {threat.attack_type || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge className={`${getThreatColor(threat.threat_level)} text-xs font-semibold border`}>
                        {threat.threat_level || "UNKNOWN"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <div className="flex-1 bg-muted/50 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              (threat.risk_score || 0) >= 70 
                                ? "bg-red-500" 
                                : (threat.risk_score || 0) >= 50 
                                ? "bg-orange-500" 
                                : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(threat.risk_score || 0, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold w-8 text-right">{threat.risk_score || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="secondary" className="text-xs font-medium">
                        {threat.final_verdict || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge className={`${getActionColor(threat.final_recommended_action)} text-xs font-semibold border`}>
                        {threat.final_recommended_action || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 hover:bg-primary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(threat);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {paginatedThreats.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
            <div className="text-sm text-muted-foreground">
              Page <span className="font-medium text-foreground">{page}</span> of{" "}
              <span className="font-medium text-foreground">{totalPages || 1}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode === "??") return "🌍";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
