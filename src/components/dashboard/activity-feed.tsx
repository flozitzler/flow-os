"use client";

import { CheckCircle, AlertTriangle, Info, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFetch } from "@/lib/hooks";

interface ActivityEntry {
  time: string;
  event: string;
  type: "success" | "warning" | "info" | "error";
  source: string;
}

const typeConfig = {
  success: { icon: CheckCircle, dot: "bg-success" },
  warning: { icon: AlertTriangle, dot: "bg-warning" },
  info: { icon: Info, dot: "bg-info" },
  error: { icon: AlertCircle, dot: "bg-destructive" },
};

export function ActivityFeed() {
  const { data, loading } = useFetch<{ activity: ActivityEntry[] }>("/api/activity", 30000);

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Live Activity</h3>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-live" />
          <span className="text-[10px] text-muted-foreground">from logs</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-4 w-4 animate-spin text-gold" />
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {data?.activity.map((item, i) => {
            const config = typeConfig[item.type];
            return (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-white/[0.03]"
              >
                <div className="mt-1 shrink-0">
                  <div className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground/90 leading-relaxed font-mono break-all">
                    {item.event}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.source}</p>
                </div>
                {item.time && (
                  <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                    {item.time}
                  </span>
                )}
              </div>
            );
          })}
          {(!data?.activity || data.activity.length === 0) && (
            <p className="text-xs text-muted-foreground text-center py-4">No recent activity in logs</p>
          )}
        </div>
      )}
    </div>
  );
}
