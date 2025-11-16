import { Link, useLocation } from "react-router-dom";
import { Shield, LayoutDashboard, AlertTriangle, BarChart3, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/threats", label: "Threats", icon: AlertTriangle },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const currentTime = new Date().toLocaleTimeString("en-US", { 
    hour: "2-digit", 
    minute: "2-digit",
    hour12: false 
  });

  return (
    <nav className="border-b border-border/50 bg-card/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded border border-border/50 bg-background">
                <Shield className="h-4 w-4 text-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm tracking-tight text-foreground">Security Operations</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Threat Intelligence</span>
              </div>
            </Link>

            <div className="flex gap-0.5">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "text-foreground border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-mono">{currentTime}</span>
            </div>
            <div className="h-1 w-1 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground font-medium">Operational</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
