export type AgentStatus = "running" | "idle" | "error" | "scheduled";

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  lastRun: string;
  nextRun: string | null;
  schedule: string;
  successRate: number;
  icon: string;
  category: "content" | "social" | "research" | "ops";
}

export interface Pipeline {
  id: string;
  name: string;
  stage: string;
  progress: number;
  status: "active" | "queued" | "completed" | "failed";
  output: string;
  lastCompleted: string;
}

export interface Metric {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

// ── Cost & Credits Tracking ──────────────────────────────────────────

export type BillingCycle = "daily" | "monthly" | "pay-per-use";

export interface ServiceProvider {
  id: string;
  name: string;
  icon: string;
  category: "ai-model" | "video" | "social" | "infra" | "email";
  billingCycle: BillingCycle;
  /** Monthly budget cap in USD */
  budgetCap: number;
  /** Current month spend in USD */
  currentSpend: number;
  /** Credits/calls used today */
  usedToday: number;
  /** Daily limit (null = unlimited) */
  dailyLimit: number | null;
  /** Total credits in current billing period */
  creditsTotal: number;
  /** Credits used in current billing period */
  creditsUsed: number;
  creditUnit: string;
  costPerUnit: number;
  costUnit: string;
  /** Is this service currently at its limit? */
  atLimit: boolean;
  /** Status for alerts */
  health: "healthy" | "warning" | "critical";
}

export interface DailySpend {
  date: string;
  total: number;
  breakdown: Record<string, number>;
}

export interface CostOptimization {
  id: string;
  title: string;
  description: string;
  potentialSaving: number;
  effort: "low" | "medium" | "high";
  status: "suggested" | "in-progress" | "applied";
  provider: string;
}

export const serviceProviders: ServiceProvider[] = [
  {
    id: "heygen",
    name: "HeyGen",
    icon: "Video",
    category: "video",
    billingCycle: "monthly",
    budgetCap: 29.00,
    currentSpend: 26.11,
    usedToday: 1,
    dailyLimit: 1,
    creditsTotal: 30,
    creditsUsed: 27,
    creditUnit: "API calls",
    costPerUnit: 0.97,
    costUnit: "per call",
    atLimit: true,
    health: "critical",
  },
  {
    id: "claude-api",
    name: "Claude API",
    icon: "Brain",
    category: "ai-model",
    billingCycle: "pay-per-use",
    budgetCap: 50.00,
    currentSpend: 21.35,
    usedToday: 8200,
    dailyLimit: null,
    creditsTotal: 1000000,
    creditsUsed: 423000,
    creditUnit: "tokens",
    costPerUnit: 0.015,
    costUnit: "per 1K tokens",
    atLimit: false,
    health: "healthy",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    icon: "Zap",
    category: "ai-model",
    billingCycle: "pay-per-use",
    budgetCap: 10.00,
    currentSpend: 2.51,
    usedToday: 420,
    dailyLimit: null,
    creditsTotal: 500000,
    creditsUsed: 168000,
    creditUnit: "tokens",
    costPerUnit: 0.0014,
    costUnit: "per 1K tokens",
    atLimit: false,
    health: "healthy",
  },
  {
    id: "openai-tts",
    name: "OpenAI TTS",
    icon: "Volume2",
    category: "ai-model",
    billingCycle: "pay-per-use",
    budgetCap: 15.00,
    currentSpend: 7.41,
    usedToday: 1,
    dailyLimit: null,
    creditsTotal: 500,
    creditsUsed: 247,
    creditUnit: "generations",
    costPerUnit: 0.03,
    costUnit: "per generation",
    atLimit: false,
    health: "healthy",
  },
  {
    id: "seedance",
    name: "Seedance / B-Roll",
    icon: "Film",
    category: "video",
    billingCycle: "monthly",
    budgetCap: 20.00,
    currentSpend: 15.20,
    usedToday: 1,
    dailyLimit: 5,
    creditsTotal: 100,
    creditsUsed: 76,
    creditUnit: "clips",
    costPerUnit: 0.20,
    costUnit: "per clip",
    atLimit: false,
    health: "warning",
  },
  {
    id: "slack-api",
    name: "Slack API",
    icon: "MessageSquare",
    category: "social",
    billingCycle: "monthly",
    budgetCap: 0,
    currentSpend: 0,
    usedToday: 32,
    dailyLimit: null,
    creditsTotal: 10000,
    creditsUsed: 3420,
    creditUnit: "messages",
    costPerUnit: 0,
    costUnit: "free tier",
    atLimit: false,
    health: "healthy",
  },
  {
    id: "youtube-api",
    name: "YouTube Data API",
    icon: "PlayCircle",
    category: "social",
    billingCycle: "daily",
    budgetCap: 0,
    currentSpend: 0,
    usedToday: 52,
    dailyLimit: 10000,
    creditsTotal: 10000,
    creditsUsed: 52,
    creditUnit: "quota units",
    costPerUnit: 0,
    costUnit: "free tier",
    atLimit: false,
    health: "healthy",
  },
  {
    id: "resend",
    name: "Resend (Email)",
    icon: "Mail",
    category: "email",
    billingCycle: "monthly",
    budgetCap: 0,
    currentSpend: 0,
    usedToday: 120,
    dailyLimit: 3000,
    creditsTotal: 3000,
    creditsUsed: 1040,
    creditUnit: "emails",
    costPerUnit: 0,
    costUnit: "free tier",
    atLimit: false,
    health: "healthy",
  },
  {
    id: "chrome-cdp",
    name: "Chrome CDP",
    icon: "Globe",
    category: "infra",
    billingCycle: "daily",
    budgetCap: 0,
    currentSpend: 0,
    usedToday: 14,
    dailyLimit: null,
    creditsTotal: 999,
    creditsUsed: 14,
    creditUnit: "sessions",
    costPerUnit: 0,
    costUnit: "self-hosted",
    atLimit: false,
    health: "healthy",
  },
];

export const dailySpendHistory: DailySpend[] = [
  { date: "May 30", total: 4.10, breakdown: { heygen: 0.97, "claude-api": 1.80, deepseek: 0.31, "openai-tts": 0.62, seedance: 0.40 } },
  { date: "May 31", total: 2.60, breakdown: { heygen: 0.97, "claude-api": 0.88, deepseek: 0.15, "openai-tts": 0.30, seedance: 0.30 } },
  { date: "Jun 1",  total: 3.45, breakdown: { heygen: 0.97, "claude-api": 1.40, deepseek: 0.28, "openai-tts": 0.50, seedance: 0.30 } },
  { date: "Jun 2",  total: 3.80, breakdown: { heygen: 0.97, "claude-api": 1.55, deepseek: 0.34, "openai-tts": 0.54, seedance: 0.40 } },
  { date: "Jun 3",  total: 2.92, breakdown: { heygen: 0.97, "claude-api": 1.10, deepseek: 0.21, "openai-tts": 0.34, seedance: 0.30 } },
  { date: "Jun 4",  total: 3.25, breakdown: { heygen: 0.97, "claude-api": 1.30, deepseek: 0.25, "openai-tts": 0.43, seedance: 0.30 } },
  { date: "Jun 5",  total: 2.10, breakdown: { heygen: 0.97, "claude-api": 0.65, deepseek: 0.12, "openai-tts": 0.18, seedance: 0.18 } },
];

export const costOptimizations: CostOptimization[] = [
  {
    id: "opt-1",
    title: "Switch morning brief to DeepSeek",
    description: "Morning Brief currently uses Claude API for summarization. DeepSeek handles this at 10x lower cost with comparable quality for news summaries.",
    potentialSaving: 8.40,
    effort: "low",
    status: "suggested",
    provider: "claude-api",
  },
  {
    id: "opt-2",
    title: "Cache repeated Seedance prompts",
    description: "38% of b-roll requests use identical prompts. Caching outputs would eliminate redundant API calls.",
    potentialSaving: 5.50,
    effort: "medium",
    status: "suggested",
    provider: "seedance",
  },
  {
    id: "opt-3",
    title: "Batch TTS instead of per-scene",
    description: "Currently generating TTS per scene. Batching the full script into one call reduces overhead by ~40%.",
    potentialSaving: 4.20,
    effort: "low",
    status: "in-progress",
    provider: "openai-tts",
  },
  {
    id: "opt-4",
    title: "Use Claude Haiku for agent ops digest",
    description: "The ops digest is a simple summarization task. Haiku handles it at 1/10th the cost of Opus.",
    potentialSaving: 3.60,
    effort: "low",
    status: "suggested",
    provider: "claude-api",
  },
  {
    id: "opt-5",
    title: "Reduce breaking news scan frequency",
    description: "Scanning every 6h catches 95% of news. The 4x/day cadence costs 2x what 2x/day would with minimal coverage loss.",
    potentialSaving: 2.80,
    effort: "low",
    status: "suggested",
    provider: "deepseek",
  },
];

/** Computed helpers */
export function getTotalMonthlySpend() {
  return serviceProviders.reduce((sum, s) => sum + s.currentSpend, 0);
}

export function getTotalMonthlyBudget() {
  return serviceProviders.reduce((sum, s) => sum + s.budgetCap, 0);
}

export function getTotalPotentialSavings() {
  return costOptimizations
    .filter((o) => o.status !== "applied")
    .reduce((sum, o) => sum + o.potentialSaving, 0);
}

export function getProvidersAtRisk() {
  return serviceProviders.filter(
    (s) => s.budgetCap > 0 && s.currentSpend / s.budgetCap > 0.7
  );
}
