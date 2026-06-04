"use client";

import Link from "next/link";
import { DollarSign, AlertTriangle, ArrowRight, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getTotalMonthlySpend,
  getTotalMonthlyBudget,
  getTotalPotentialSavings,
  getProvidersAtRisk,
  serviceProviders,
  dailySpendHistory,
} from "@/lib/data";

export function CostWidget() {
  const spend = getTotalMonthlySpend();
  const budget = getTotalMonthlyBudget();
  const savings = getTotalPotentialSavings();
  const atRisk = getProvidersAtRisk();
  const todaySpend = dailySpendHistory[dailySpendHistory.length - 1].total;
  const budgetPct = budget > 0 ? (spend / budget) * 100 : 0;

  const paidServices = serviceProviders.filter((s) => s.budgetCap > 0);

  return (
    <div className="glass rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-gold" /> Cost Tracker
        </h3>
        <Link
          href="/costs"
          className="flex items-center gap-1 text-[11px] font-medium text-gold hover:text-gold/80 transition-colors"
        >
          Details <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Today / Month */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white/[0.03] p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Today</p>
          <p className="text-xl font-bold text-foreground">${todaySpend.toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-white/[0.03] p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">This Month</p>
          <p className="text-xl font-bold text-foreground">${spend.toFixed(2)}</p>
        </div>
      </div>

      {/* Budget Bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Monthly Budget</span>
          <span className={cn("text-xs font-mono font-medium", budgetPct > 80 ? "text-warning" : "text-gold")}>
            {budgetPct.toFixed(0)}% used
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              budgetPct > 90
                ? "bg-gradient-to-r from-destructive to-destructive/60"
                : budgetPct > 70
                  ? "bg-gradient-to-r from-warning to-warning/60"
                  : "bg-gradient-to-r from-gold-dim to-gold"
            )}
            style={{ width: `${Math.min(budgetPct, 100)}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">${spend.toFixed(2)} of ${budget.toFixed(2)}</p>
      </div>

      {/* Per-Service Mini Bars */}
      <div className="space-y-2">
        {paidServices.map((s) => {
          const pct = (s.currentSpend / s.budgetCap) * 100;
          return (
            <div key={s.id} className="flex items-center gap-3">
              <span className="text-xs text-foreground w-20 truncate">{s.name}</span>
              <div className="flex-1 h-1 rounded-full bg-white/5">
                <div
                  className={cn(
                    "h-full rounded-full",
                    pct > 80 ? "bg-warning" : "bg-gold/60"
                  )}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground w-14 text-right">
                ${s.currentSpend.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      {atRisk.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
          <span className="text-xs text-warning">
            {atRisk.map((s) => s.name).join(", ")} — approaching budget cap
          </span>
        </div>
      )}

      {/* Savings Callout */}
      <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2">
        <TrendingDown className="h-3.5 w-3.5 text-success shrink-0" />
        <span className="text-xs text-success">
          ${savings.toFixed(2)}/mo savings available
        </span>
      </div>
    </div>
  );
}
