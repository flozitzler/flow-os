"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Metric } from "@/lib/data";

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

export function MetricCard({ metric }: { metric: Metric }) {
  const TrendIcon = trendIcons[metric.trend];

  return (
    <div className="glass rounded-xl p-5 glow-gold transition-all duration-300 hover:border-gold/20">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {metric.label}
      </p>
      <div className="mt-2 flex items-end justify-between">
        <p className="text-3xl font-bold tracking-tight text-foreground">
          {metric.value}
        </p>
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            metric.trend === "up" && "text-success",
            metric.trend === "down" && "text-warning",
            metric.trend === "neutral" && "text-muted-foreground"
          )}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          <span>{metric.change}</span>
        </div>
      </div>
    </div>
  );
}
