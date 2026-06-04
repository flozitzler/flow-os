"use client";

import { useFetch } from "@/lib/hooks";
import { BarChart3, TrendingUp, Film, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  serviceProviders,
  getTotalMonthlySpend,
} from "@/lib/data";

interface AgentData {
  agents: Array<{ id: string; name: string; status: string; category: string; schedule: string; lastRun: string }>;
  summary: { total: number; running: number; idle: number; error: number };
}

interface PipelineData {
  channels: Array<{
    id: string; name: string; platform: string;
    totalVideos: number; uploadedCount: number; avgDuration: number;
    recentVideos: Array<{ date: string; title: string; duration: number; uploaded: boolean; url: string }>;
  }>;
  summary: { totalChannels: number; totalVideos: number; totalUploaded: number };
}

export default function AnalyticsPage() {
  const { data: agentData, loading: aLoading } = useFetch<AgentData>("/api/agents", 30000);
  const { data: pipeData, loading: pLoading } = useFetch<PipelineData>("/api/pipelines", 60000);

  if (aLoading || pLoading || !agentData || !pipeData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-gold" />
          <span className="text-sm">Loading analytics...</span>
        </div>
      </div>
    );
  }

  const totalSpend = getTotalMonthlySpend();
  const paidServices = serviceProviders.filter((s) => s.budgetCap > 0);

  // Agent category distribution
  const categories = agentData.agents.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {});
  const maxCat = Math.max(...Object.values(categories));

  // Videos per channel
  const maxVideos = Math.max(...pipeData.channels.map((c) => c.uploadedCount));

  // Videos per day (from recentVideos across all channels)
  const dateMap = new Map<string, number>();
  for (const ch of pipeData.channels) {
    for (const v of ch.recentVideos) {
      dateMap.set(v.date, (dateMap.get(v.date) || 0) + 1);
    }
  }
  const dateCounts = [...dateMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-7);
  const maxDayVideos = Math.max(...dateCounts.map((d) => d[1]), 1);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live system metrics from agents + pipelines
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-xl p-5 glow-gold">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Agents</p>
            <Bot className="h-4 w-4 text-gold" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{agentData.summary.total}</p>
          <p className="mt-1 text-xs text-success">{agentData.summary.running} running</p>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Videos Uploaded</p>
            <Film className="h-4 w-4 text-info" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{pipeData.summary.totalUploaded}</p>
          <p className="mt-1 text-xs text-muted-foreground">across {pipeData.summary.totalChannels} channels</p>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Monthly Spend</p>
            <TrendingUp className="h-4 w-4 text-warning" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">${totalSpend.toFixed(2)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{paidServices.length} paid services</p>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Errors</p>
            <BarChart3 className="h-4 w-4 text-destructive" />
          </div>
          <p className={cn("mt-2 text-2xl font-bold", agentData.summary.error > 0 ? "text-destructive" : "text-success")}>
            {agentData.summary.error}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {agentData.summary.error > 0 ? "needs attention" : "all clear"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Agent Category Distribution */}
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-5">Agents by Category</h3>
          <div className="space-y-3">
            {Object.entries(categories)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground capitalize">{cat}</span>
                    <span className="text-xs font-mono text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold-dim to-gold transition-all duration-500"
                      style={{ width: `${(count / maxCat) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Videos Per Channel */}
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-5">Videos Per Channel</h3>
          <div className="space-y-3">
            {pipeData.channels.map((ch) => (
              <div key={ch.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground">{ch.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {ch.uploadedCount} ({ch.platform})
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-info/60 to-info transition-all duration-500"
                    style={{ width: `${(ch.uploadedCount / maxVideos) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Upload Activity */}
        {dateCounts.length > 0 && (
          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-5">Upload Activity (Last 7 days)</h3>
            <div className="flex items-end gap-3 h-32">
              {dateCounts.map(([date, count]) => (
                <div key={date} className="flex-1 flex flex-col items-center gap-2 group">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-gold-dim/60 to-gold/60 group-hover:from-gold-dim group-hover:to-gold transition-all duration-300"
                    style={{ height: `${(count / maxDayVideos) * 100}px` }}
                  />
                  <span className="text-[9px] text-muted-foreground">{date.split("-").slice(1).join("/")}</span>
                  <span className="text-[10px] font-mono text-foreground">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Credits */}
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">API Credits Usage</h3>
          <div className="space-y-3">
            {paidServices.map((s) => {
              const pct = (s.creditsUsed / s.creditsTotal) * 100;
              return (
                <div key={s.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground">{s.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {s.creditsUsed.toLocaleString()} / {s.creditsTotal.toLocaleString()} {s.creditUnit}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        pct > 80 ? "bg-gradient-to-r from-warning to-warning/60" : "bg-gradient-to-r from-gold-dim to-gold"
                      )}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
