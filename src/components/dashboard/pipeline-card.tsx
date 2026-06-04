"use client";

import { CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Pipeline } from "@/lib/data";

const statusIcons = {
  active: Loader2,
  queued: Clock,
  completed: CheckCircle,
  failed: AlertCircle,
};

const statusColors = {
  active: "text-info",
  queued: "text-muted-foreground",
  completed: "text-success",
  failed: "text-destructive",
};

const progressColors = {
  active: "from-info to-info/60",
  queued: "from-muted-foreground to-muted-foreground/60",
  completed: "from-success to-success/60",
  failed: "from-destructive to-destructive/60",
};

export function PipelineCard({ pipeline }: { pipeline: Pipeline }) {
  const StatusIcon = statusIcons[pipeline.status];

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-white/[0.02] p-4 transition-all duration-200 hover:bg-white/[0.04]">
      <div className={cn("shrink-0", statusColors[pipeline.status])}>
        <StatusIcon
          className={cn("h-5 w-5", pipeline.status === "active" && "animate-spin")}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground truncate">{pipeline.name}</h4>
          <span className="text-xs text-muted-foreground ml-2 shrink-0">{pipeline.stage}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className={cn(
              "h-full rounded-full bg-gradient-to-r transition-all duration-700",
              progressColors[pipeline.status]
            )}
            style={{ width: `${pipeline.progress}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Output: {pipeline.output}</span>
          <span className="text-[10px] text-muted-foreground">{pipeline.progress}%</span>
        </div>
      </div>
    </div>
  );
}
