"use client";

import { useState } from "react";
import { useFetch } from "@/lib/hooks";
import { AgentCard } from "@/components/dashboard/agent-card";
import { Loader2 } from "lucide-react";

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
  }>;
  summary: { total: number; running: number; idle: number; error: number };
}

const categories = [
  { key: "all", label: "All" },
  { key: "running", label: "Running" },
  { key: "viral", label: "Viral" },
  { key: "social", label: "Social" },
  { key: "content", label: "Content" },
  { key: "research", label: "Research" },
  { key: "ops", label: "Operations" },
  { key: "infra", label: "Infrastructure" },
  { key: "error", label: "Errors" },
];

export default function AgentsPage() {
  const [filter, setFilter] = useState("all");
  const { data, loading } = useFetch<AgentData>("/api/agents", 15000);

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-gold" />
          <span className="text-sm">Reading launchd agents...</span>
        </div>
      </div>
    );
  }

  const filtered =
    filter === "all"
      ? data.agents
      : filter === "running"
        ? data.agents.filter((a) => a.status === "running")
        : filter === "error"
          ? data.agents.filter((a) => a.status === "error")
          : data.agents.filter((a) => a.category === filter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Agents
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({data.summary.total} total)
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live from <code className="text-gold/80 text-xs">launchctl list</code> &mdash;{" "}
            <span className="text-success">{data.summary.running} running</span>,{" "}
            <span className="text-muted-foreground">{data.summary.idle} idle</span>
            {data.summary.error > 0 && (
              <>, <span className="text-destructive">{data.summary.error} errors</span></>
            )}
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-white/[0.02] p-1 flex-wrap">
          {categories.map((cat) => {
            const count =
              cat.key === "all"
                ? data.agents.length
                : cat.key === "running"
                  ? data.agents.filter((a) => a.status === "running").length
                  : cat.key === "error"
                    ? data.agents.filter((a) => a.status === "error").length
                    : data.agents.filter((a) => a.category === cat.key).length;
            return (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                  filter === cat.key
                    ? "bg-gold/10 text-gold"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((agent) => (
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
      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No agents match this filter.
        </p>
      )}
    </div>
  );
}
