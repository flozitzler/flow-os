"use client";

import { useFetch } from "@/lib/hooks";
import { MetricCard } from "@/components/dashboard/metric-card";
import { AgentCard } from "@/components/dashboard/agent-card";
import { PipelineCard } from "@/components/dashboard/pipeline-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { CostWidget } from "@/components/dashboard/cost-widget";
import { Loader2 } from "lucide-react";
import type { Metric } from "@/lib/data";

interface AgentData {
  agents: Array<{
    id: string;
    name: string;
    label: string;
    description: string;
    status: "running" | "idle" | "error" | "scheduled";
    pid: number | null;
    exitCode: number | null;
    lastRun: string;
    nextRun: string | null;
    schedule: string;
    category: string;
    icon: string;
    script: string;
    logFile: string | null;
    lastLog: string[];
    successRate?: number;
  }>;
  summary: { total: number; running: number; idle: number; error: number };
}

interface PipelineData {
  channels: Array<{
    id: string;
    name: string;
    platform: string;
    totalVideos: number;
    lastUpload: string | null;
    lastTitle: string | null;
    lastUrl: string | null;
    avgDuration: number;
    uploadedCount: number;
  }>;
  summary: { totalChannels: number; totalVideos: number; totalUploaded: number };
}

export default function Dashboard() {
  const { data: agentData, loading: agentsLoading } = useFetch<AgentData>("/api/agents", 30000);
  const { data: pipelineData } = useFetch<PipelineData>("/api/pipelines", 60000);

  const liveMetrics: Metric[] = agentData
    ? [
        {
          label: "Total Agents",
          value: String(agentData.summary.total),
          change: `${agentData.summary.running} running`,
          trend: "up" as const,
        },
        {
          label: "Running Now",
          value: String(agentData.summary.running),
          change: `${agentData.summary.idle} idle`,
          trend: agentData.summary.running > 5 ? ("up" as const) : ("neutral" as const),
        },
        {
          label: "Errors",
          value: String(agentData.summary.error),
          change: agentData.summary.error > 0 ? "needs attention" : "all clear",
          trend: agentData.summary.error > 0 ? ("down" as const) : ("up" as const),
        },
        {
          label: "Videos Produced",
          value: pipelineData ? String(pipelineData.summary.totalUploaded) : "...",
          change: pipelineData ? `across ${pipelineData.summary.totalChannels} channels` : "",
          trend: "up" as const,
        },
      ]
    : [];

  // Show top 8 agents on dashboard (running first, then most active)
  const dashboardAgents = agentData?.agents
    .filter((a) => !a.label.includes("antigravity") && !a.label.includes("lili-morningbrief") && !a.label.includes("shadowwhispers"))
    .slice(0, 8) || [];

  if (agentsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-gold" />
          <span className="text-sm">Loading live system data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Metrics Row */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {liveMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left Column: Agents + Pipelines */}
        <div className="xl:col-span-2 space-y-6">
          {/* Live Agents */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Live Agents
              </h2>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse-live" />
                <span className="text-xs text-gold font-mono">
                  {agentData?.summary.running || 0} running &middot; refreshes every 30s
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {dashboardAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={{
                    ...agent,
                    successRate: agent.status === "running" ? 100 : agent.status === "error" ? 0 : 95,
                    category: agent.category as "content" | "social" | "research" | "ops",
                  }}
                />
              ))}
            </div>
          </section>

          {/* Viral Channels */}
          {pipelineData && (
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Viral Channels ({pipelineData.summary.totalUploaded} videos uploaded)
              </h2>
              <div className="space-y-3">
                {pipelineData.channels.map((ch) => (
                  <div
                    key={ch.id}
                    className="flex items-center gap-4 rounded-lg border border-border bg-white/[0.02] p-4 transition-all duration-200 hover:bg-white/[0.04]"
                  >
                    <div className="shrink-0 text-gold">
                      <span className="text-xs font-mono uppercase bg-gold/10 rounded px-2 py-1">
                        {ch.platform}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground">{ch.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">
                        Last: {ch.lastTitle || "No uploads yet"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground">{ch.uploadedCount}</p>
                      <p className="text-[10px] text-muted-foreground">videos</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-foreground">{ch.avgDuration}s</p>
                      <p className="text-[10px] text-muted-foreground">avg dur</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <CostWidget />
          <QuickActions />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
