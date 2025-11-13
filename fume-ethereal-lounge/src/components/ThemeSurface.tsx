import React from "react";
import { cn } from "@/lib/utils";

type ThemeSurfaceProps = {
  className?: string;
  children: React.ReactNode;
};

// Dark token set used previously for public/guest pages
const darkTokens = {
  "--background": "0 0% 3%",
  "--foreground": "0 0% 98%",
  "--card": "270 15% 8%",
  "--card-foreground": "0 0% 98%",
  "--popover": "270 20% 6%",
  "--popover-foreground": "0 0% 98%",
  "--primary": "45 100% 65%",
  "--primary-foreground": "0 0% 10%",
  "--secondary": "270 60% 45%",
  "--secondary-foreground": "0 0% 98%",
  "--muted": "270 15% 15%",
  "--muted-foreground": "0 0% 65%",
  "--accent": "180 70% 50%",
  "--accent-foreground": "0 0% 10%",
  "--destructive": "0 84.2% 60.2%",
  "--destructive-foreground": "0 0% 98%",
  "--border": "270 20% 18%",
  "--input": "270 20% 18%",
  "--ring": "45 100% 65%",
  "--gradient-mystical": "linear-gradient(135deg, hsl(270 60% 25%), hsl(270 80% 15%), hsl(0 0% 5%))",
  "--gradient-gold": "linear-gradient(135deg, hsl(45 100% 65%), hsl(35 100% 50%))",
  "--gradient-purple": "linear-gradient(135deg, hsl(270 60% 45%), hsl(280 70% 35%))",
  "--gradient-overlay": "linear-gradient(180deg, hsla(0 0% 0% / 0.8), hsla(0 0% 0% / 0.4))",
  "--shadow-glow": "0 0 40px hsl(45 100% 65% / 0.3)",
  "--shadow-card": "0 10px 40px hsl(270 60% 10% / 0.5)",
} as React.CSSProperties;

export function PublicTheme({ className, children }: ThemeSurfaceProps) {
  return (
    <div
      className={cn("bg-background text-foreground", className)}
      style={darkTokens}
      data-theme-scope="public"
    >
      {children}
    </div>
  );
}

// Optional light theme surface for explicit scoped overrides (not required since globals are light)
const lightTokens = {
  "--background": "0 0% 100%",
  "--foreground": "240 10% 3.9%",
  "--card": "0 0% 100%",
  "--card-foreground": "240 10% 3.9%",
  "--popover": "0 0% 100%",
  "--popover-foreground": "240 10% 3.9%",
  "--primary": "45 100% 65%",
  "--primary-foreground": "0 0% 10%",
  "--secondary": "270 30% 96%",
  "--secondary-foreground": "270 30% 25%",
  "--muted": "240 5% 96%",
  "--muted-foreground": "240 3.8% 46%",
  "--accent": "240 5% 96%",
  "--accent-foreground": "240 10% 20%",
  "--destructive": "0 84.2% 60.2%",
  "--destructive-foreground": "0 0% 98%",
  "--border": "240 6% 90%",
  "--input": "240 6% 90%",
  "--ring": "45 100% 65%",
} as React.CSSProperties;

export function LightTheme({ className, children }: ThemeSurfaceProps) {
  return (
    <div className={cn(className)} style={lightTokens} data-theme-scope="light">
      {children}
    </div>
  );
}

export default PublicTheme;


