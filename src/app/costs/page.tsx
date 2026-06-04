"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  ArrowRight,
  Loader2,
  Shield,
  Zap,
  Video,
  Brain,
  Volume2,
  Film,
  MessageSquare,
  PlayCircle,
  Mail,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  serviceProviders,
  dailySpendHistory,
  costOptimizations,
  getTotalMonthlySpend,
  getTotalMonthlyBudget,
  getTotalPotentialSavings,
  getProvidersAtRisk,
  type ServiceProvider,
  type CostOptimization,
} from "@/lib/data";

const iconMap: Record<string, LucideIcon> = {
  Video,
  Brain,
  Zap,
  Volume2,
  Film,
  MessageSquare,
  PlayCircle,
  Mail,
  Globe,
};

const healthColors = {
  healthy: { dot: "bg-success", text: "text-success", label: "Healthy" },
  warning: { dot: "bg-warning", text: "text-warning", label: "Watch" },
  critical: { dot: "bg-destructive", text: "text-destructive", label: "Over" },
};

const effortBadge = {
  low: "bg-success/10 text-success",
  medium: "bg-warning/10 text-warning",
  high: "bg-destructive/10 text-destructive",
};

const statusBadge = {
  suggested: "bg-info/10 text-info",
  "in-progress": "bg-warning/10 text-warning",
  applied: "bg-success/10 text-success",
};

// ── Period Selector ──────────────────────────────────────────────────

type Period = "today" | "week" | "month";

function getSpendForPeriod(period: Period) {
  const history = dailySpendHistory;
  switch (period) {
    case "today":
      return history[history.length - 1].total;
    case "week":
      return history.reduce((s, d) => s + d.total, 0);
    case "month":
      return getTotalMonthlySpend();
  }
}

// ── Service Row Component ────────────────────────────────────────────

function ServiceRow({ service }: { service: ServiceProvider }) {
  const Icon = iconMap[service.icon] || DollarSign;
  const health = healthColors[service.health];
  const budgetPct = service.budgetCap > 0
    ? Math.min((service.currentSpend / service.budgetCap) * 100, 100)
    : 0;
  const creditPct = (service.creditsUsed / service.creditsTotal) * 100;

  return (
    <div className="glass rounded-xl p-5 transition-all duration-300 hover:border-gold/20">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{service.name}</h3>
            <p className="text-xs text-muted-foreground">{service.costUnit}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={cn("h-2 w-2 rounded-full", health.dot, service.health !== "healthy" && "animate-pulse-live")} />
          <span className={cn("text-xs font-medium", health.text)}>{health.label}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        {/* Spend */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Spend</p>
          <p className="text-lg font-bold text-foreground">
            {service.currentSpend > 0 ? `$${service.currentSpend.toFixed(2)}` : "Free"}
          </p>
          {service.budgetCap > 0 && (
            <p className="text-[10px] text-muted-foreground">of ${service.budgetCap.toFixed(2)} cap</p>
          )}
        </div>

        {/* Today */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Today</p>
          <p className="text-lg font-bold text-foreground">{service.usedToday.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">
            {service.dailyLimit ? `/ ${service.dailyLimit.toLocaleString()} limit` : service.creditUnit}
          </p>
        </div>

        {/* Credits */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Credits</p>
          <p className="text-lg font-bold text-foreground">{creditPct.toFixed(0)}%</p>
          <p className="text-[10px] text-muted-foreground">
            {service.creditsUsed.toLocaleString()} / {service.creditsTotal.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Budget Bar */}
      {service.budgetCap > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Budget Usage</span>
            <span className={cn("text-xs font-mono font-medium", budgetPct > 80 ? "text-warning" : "text-gold")}>
              {budgetPct.toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                budgetPct > 90
                  ? "bg-gradient-to-r from-destructive to-destructive/60"
                  : budgetPct > 70
                    ? "bg-gradient-to-r from-warning to-warning/60"
                    : "bg-gradient-to-r from-gold-dim to-gold"
              )}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Credit Usage Bar (for free services) */}
      {service.budgetCap === 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Quota Usage</span>
            <span className="text-xs font-mono font-medium text-gold">{creditPct.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-info/60 to-info transition-all duration-700"
              style={{ width: `${Math.min(creditPct, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Daily Limit Warning */}
      {service.atLimit && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 text-warning" />
          <span className="text-xs text-warning">Daily limit reached — resets at midnight WITA</span>
        </div>
      )}
    </div>
  );
}

// ── Optimization Card ────────────────────────────────────────────────

function OptimizationCard({ opt }: { opt: CostOptimization }) {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(opt.status === "applied");

  function handleApply() {
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      setApplied(true);
      toast.success(`Optimization applied: ${opt.title}`, {
        description: `Estimated saving: $${opt.potentialSaving.toFixed(2)}/mo`,
      });
    }, 1500);
  }

  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04]">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10">
        <Lightbulb className="h-4 w-4 text-gold" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-sm font-medium text-foreground">{opt.title}</h4>
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", effortBadge[opt.effort])}>
            {opt.effort} effort
          </span>
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", applied ? statusBadge["applied"] : statusBadge[opt.status])}>
            {applied ? "Applied" : opt.status}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{opt.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-success">
            Save ${opt.potentialSaving.toFixed(2)}/mo
          </span>
          {!applied && (
            <button
              onClick={handleApply}
              disabled={applying}
              className="flex items-center gap-1.5 rounded-md bg-gold/10 px-3 py-1.5 text-[11px] font-medium text-gold transition-colors hover:bg-gold/20 disabled:opacity-50"
            >
              {applying ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ArrowRight className="h-3 w-3" />
              )}
              {applying ? "Applying..." : "Apply"}
            </button>
          )}
          {applied && (
            <div className="flex items-center gap-1 text-success">
              <CheckCircle className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium">Active</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────

export default function CostsPage() {
  const [period, setPeriod] = useState<Period>("month");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const totalSpend = getSpendForPeriod(period);
  const totalBudget = getTotalMonthlyBudget();
  const totalSavings = getTotalPotentialSavings();
  const atRisk = getProvidersAtRisk();

  const paidProviders = serviceProviders.filter((s) => s.budgetCap > 0);
  const freeProviders = serviceProviders.filter((s) => s.budgetCap === 0);

  const maxDaySpend = Math.max(...dailySpendHistory.map((d) => d.total));

  const categories = [
    { key: "all", label: "All Services" },
    { key: "ai-model", label: "AI Models" },
    { key: "video", label: "Video" },
    { key: "social", label: "Social" },
    { key: "infra", label: "Infrastructure" },
    { key: "email", label: "Email" },
  ];

  const filteredProviders =
    categoryFilter === "all"
      ? serviceProviders
      : serviceProviders.filter((s) => s.category === categoryFilter);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-gold" /> Costs & Credits
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track every dollar, optimize every call
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-white/[0.02] p-1">
          {(["today", "week", "month"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all capitalize",
                period === p
                  ? "bg-gold/10 text-gold"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-xl p-5 glow-gold">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {period === "today" ? "Today" : period === "week" ? "This Week" : "This Month"}
          </p>
          <p className="mt-2 text-3xl font-bold text-foreground">${totalSpend.toFixed(2)}</p>
          {period === "month" && (
            <p className="mt-1 text-xs text-muted-foreground">of ${totalBudget.toFixed(2)} budget</p>
          )}
        </div>

        <div className="glass rounded-xl p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Daily Avg</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            ${(dailySpendHistory.reduce((s, d) => s + d.total, 0) / dailySpendHistory.length).toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-success flex items-center gap-1">
            <TrendingDown className="h-3 w-3" /> -12% vs last week
          </p>
        </div>

        <div className="glass rounded-xl p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Potential Savings</p>
          <p className="mt-2 text-3xl font-bold text-success">${totalSavings.toFixed(2)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {costOptimizations.filter((o) => o.status === "suggested").length} optimizations available
          </p>
        </div>

        <div className="glass rounded-xl p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Budget Alerts</p>
          <p className={cn("mt-2 text-3xl font-bold", atRisk.length > 0 ? "text-warning" : "text-success")}>
            {atRisk.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {atRisk.length > 0
              ? `${atRisk.map((s) => s.name).join(", ")} over 70%`
              : "All services within budget"}
          </p>
        </div>
      </div>

      {/* Spend Trend Chart */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">7-Day Spend Trend</h3>
        <p className="text-xs text-muted-foreground mb-5">Daily cost breakdown across all paid services</p>
        <div className="flex items-end gap-3 h-40">
          {dailySpendHistory.map((d, i) => {
            const isToday = i === dailySpendHistory.length - 1;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-navy-lighter border border-border rounded-lg px-3 py-1.5 pointer-events-none z-10 whitespace-nowrap">
                  <p className="text-xs font-semibold text-foreground">${d.total.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">{d.date}</p>
                </div>
                {/* Bar */}
                <div
                  className={cn(
                    "w-full rounded-t transition-all duration-500",
                    isToday
                      ? "bg-gradient-to-t from-gold-dim to-gold"
                      : "bg-gradient-to-t from-gold-dim/40 to-gold/40 group-hover:from-gold-dim/70 group-hover:to-gold/70"
                  )}
                  style={{ height: `${(d.total / maxDaySpend) * 120}px` }}
                />
                <span className={cn("text-[10px] font-medium", isToday ? "text-gold" : "text-muted-foreground")}>
                  {d.date.split(" ")[1] || d.date}
                </span>
                <span className="text-[10px] font-mono text-foreground">${d.total.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Service Breakdown
        </h2>
        <div className="flex gap-1 rounded-lg border border-border bg-white/[0.02] p-1">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium transition-all",
                categoryFilter === cat.key
                  ? "bg-gold/10 text-gold"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredProviders.map((service) => (
          <ServiceRow key={service.id} service={service} />
        ))}
      </div>

      {/* Cost Optimizations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-gold" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Cost Optimizations
          </h2>
          <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-gold">
            Save ${totalSavings.toFixed(2)}/mo
          </span>
        </div>
        <div className="space-y-3">
          {costOptimizations.map((opt) => (
            <OptimizationCard key={opt.id} opt={opt} />
          ))}
        </div>
      </div>
    </div>
  );
}
