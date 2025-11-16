import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe as GlobeIcon, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Globe from "react-globe.gl";
import { getCountryCoordinates } from "@/lib/countryCoordinates";

interface GeographicMapProps {
  threats?: any[];
}

export const GeographicMap = ({ threats }: GeographicMapProps) => {
  const globeEl = useRef<any>();
  const [hoveredCountry, setHoveredCountry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Process threat data by country
  const countryData = threats?.reduce((acc: any, threat) => {
    const country = threat.country || "Unknown";
    const code = threat.country_code || "??";
    const key = `${country}|${code}`;
    
    if (!acc[key]) {
      acc[key] = {
        country,
        code,
        count: 0,
        threats: [],
      };
    }
    
    acc[key].count += 1;
    acc[key].threats.push(threat);
    
    return acc;
  }, {});

  const countryPoints = Object.values(countryData || {}).map((item: any) => {
    const coords = getCountryCoordinates(item.code);
    return {
      ...item,
      lat: coords.lat,
      lng: coords.lng,
      // Size based on threat count (normalized)
      size: Math.max(0.3, Math.min(2, item.count / 10)),
      // Color based on threat level
      color: getThreatColor(item.threats),
    };
  });

  const maxCount = Math.max(...countryPoints.map((c: any) => c.count), 1);

  useEffect(() => {
    if (globeEl.current && countryPoints.length > 0) {
      // Auto-rotate
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
      
      // Set initial camera position
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2 }, 1000);
      
      setIsLoading(false);
    }
  }, [countryPoints.length]);

  const handlePointClick = (point: any) => {
    setHoveredCountry(point);
  };

  const resetView = () => {
    if (globeEl.current) {
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2 }, 1000);
    }
  };

  return (
    <div className="space-y-4">
      {/* 3D Globe */}
      <Card className="border border-border/50 bg-card/50 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <GlobeIcon className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-lg font-semibold">3D Threat Globe</CardTitle>
              </div>
              <CardDescription className="text-sm mt-1">
                Interactive 3D visualization of threat origins by country
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetView}
              className="h-8"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-2" />
              Reset View
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {countryPoints.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">No geographic data available</p>
            </div>
          ) : (
            <div className="relative h-[400px] rounded-lg overflow-hidden border border-border/50 bg-background">
              <Globe
                ref={globeEl}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                pointsData={countryPoints}
                pointLat={(d: any) => d.lat}
                pointLng={(d: any) => d.lng}
                pointColor={(d: any) => d.color}
                pointRadius={(d: any) => d.size}
                pointLabel={(d: any) => `
                  <div style="
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    max-width: 200px;
                  ">
                    <div style="font-weight: bold; margin-bottom: 4px;">${d.country}</div>
                    <div style="font-size: 11px; opacity: 0.9;">${d.count} ${d.count === 1 ? 'threat' : 'threats'}</div>
                  </div>
                `}
                onPointClick={handlePointClick}
                pointResolution={2}
                showAtmosphere={true}
                atmosphereColor="#3a82f6"
                atmosphereAltitude={0.15}
                enablePointerInteraction={true}
              />
              
              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Country List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.values(countryData || {})
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 12)
          .map((item: any, index) => (
            <Card 
              key={index} 
              className={`border border-border/50 bg-card/50 hover:bg-card/80 transition-all cursor-pointer ${
                hoveredCountry?.country === item.country ? 'ring-2 ring-primary' : ''
              }`}
              onMouseEnter={() => setHoveredCountry(item)}
              onMouseLeave={() => setHoveredCountry(null)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getFlagEmoji(item.code)}</span>
                    <div>
                      <p className="text-sm font-medium">{item.country}</p>
                      <p className="text-xs text-muted-foreground">{item.code}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="font-bold"
                    style={{ 
                      backgroundColor: getThreatColor(item.threats) + '20',
                      color: getThreatColor(item.threats),
                      borderColor: getThreatColor(item.threats) + '40'
                    }}
                  >
                    {item.count}
                  </Badge>
                </div>
                <div className="w-full bg-muted/50 rounded-full h-2 mt-3">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ 
                      width: `${(item.count / maxCount) * 100}%`,
                      backgroundColor: getThreatColor(item.threats)
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Hovered Country Details */}
      {hoveredCountry && (
        <Card className="border border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{getFlagEmoji(hoveredCountry.code)}</span>
              <div>
                <h4 className="text-lg font-semibold">{hoveredCountry.country}</h4>
                <p className="text-sm text-muted-foreground">Country Code: {hoveredCountry.code}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Threats</div>
                <div className="text-2xl font-bold mt-1">{hoveredCountry.count}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Critical</div>
                <div className="text-2xl font-bold text-red-500 mt-1">
                  {hoveredCountry.threats.filter((t: any) => t.threat_level === 'CRITICAL').length}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">High</div>
                <div className="text-2xl font-bold text-orange-500 mt-1">
                  {hoveredCountry.threats.filter((t: any) => t.threat_level === 'HIGH').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

function getThreatColor(threats: any[]): string {
  if (!threats || threats.length === 0) return "#6b7280";
  
  const criticalCount = threats.filter(t => t.threat_level === "CRITICAL").length;
  const highCount = threats.filter(t => t.threat_level === "HIGH").length;
  
  if (criticalCount > 0) return "#ef4444"; // red
  if (highCount > 0) return "#f97316"; // orange
  return "#3b82f6"; // blue
}

function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode === "??") return "🌍";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
