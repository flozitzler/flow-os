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

export const agents: Agent[] = [
  {
    id: "morning-brief",
    name: "Morning Brief",
    description: "Daily AI news digest via Slack + email",
    status: "idle",
    lastRun: "Today 09:00",
    nextRun: "Tomorrow 09:00",
    schedule: "Daily 09:00 WITA",
    successRate: 98,
    icon: "Newspaper",
    category: "research",
  },
  {
    id: "breaking-news",
    name: "Breaking News Scanner",
    description: "Monitors AI news sources every 6 hours",
    status: "running",
    lastRun: "Today 15:00",
    nextRun: "Today 21:00",
    schedule: "Every 6h",
    successRate: 95,
    icon: "Zap",
    category: "research",
  },
  {
    id: "blog-email",
    name: "Blog Email Agent",
    description: "Automated blog newsletter distribution",
    status: "idle",
    lastRun: "Today 10:30",
    nextRun: "Tomorrow 10:30",
    schedule: "Daily 10:30 WITA",
    successRate: 100,
    icon: "Mail",
    category: "content",
  },
  {
    id: "longform-video",
    name: "Longform Video Pipeline",
    description: "HeyGen avatar video production",
    status: "scheduled",
    lastRun: "Yesterday 09:00",
    nextRun: "Tomorrow 09:00",
    schedule: "Daily 09:00 WITA",
    successRate: 92,
    icon: "Video",
    category: "content",
  },
  {
    id: "viral-pipeline",
    name: "Viral Clips Pipeline",
    description: "Two-voice dialogue with Minecraft bg",
    status: "idle",
    lastRun: "Today 14:00",
    nextRun: null,
    schedule: "On demand",
    successRate: 88,
    icon: "Flame",
    category: "content",
  },
  {
    id: "instagram-bot",
    name: "Instagram Automation",
    description: "@aibyflo comment monitor + Telegram bot",
    status: "running",
    lastRun: "2 min ago",
    nextRun: null,
    schedule: "Always on",
    successRate: 97,
    icon: "Instagram",
    category: "social",
  },
  {
    id: "x-poster",
    name: "X Auto-Poster",
    description: "Automated posts to @wizard_flo",
    status: "idle",
    lastRun: "Today 12:00",
    nextRun: "Today 18:00",
    schedule: "3x daily",
    successRate: 91,
    icon: "Twitter",
    category: "social",
  },
  {
    id: "agent-ops-digest",
    name: "Agent Ops Digest",
    description: "Daily digest of all agent activities",
    status: "scheduled",
    lastRun: "Yesterday 17:00",
    nextRun: "Today 17:00",
    schedule: "Mon-Fri 17:00 WITA",
    successRate: 100,
    icon: "BarChart3",
    category: "ops",
  },
  {
    id: "linkedin-publisher",
    name: "LinkedIn Publisher",
    description: "Build-in-public post series",
    status: "idle",
    lastRun: "2 days ago",
    nextRun: null,
    schedule: "On demand",
    successRate: 100,
    icon: "Linkedin",
    category: "social",
  },
];

export const pipelines: Pipeline[] = [
  {
    id: "heygen-daily",
    name: "HeyGen Daily Video",
    stage: "Post-Production",
    progress: 85,
    status: "active",
    output: "YouTube + Slack",
    lastCompleted: "Yesterday",
  },
  {
    id: "viral-clip",
    name: "Viral Clip Generator",
    stage: "Idle",
    progress: 0,
    status: "queued",
    output: "Instagram Reels",
    lastCompleted: "2 days ago",
  },
  {
    id: "bali-content",
    name: "Bali State of Mind",
    stage: "Completed",
    progress: 100,
    status: "completed",
    output: "YouTube",
    lastCompleted: "Today",
  },
  {
    id: "paw-drama",
    name: "Paw Drama Series",
    stage: "Scripting",
    progress: 25,
    status: "active",
    output: "Instagram + TikTok",
    lastCompleted: "3 days ago",
  },
];

export const metrics: Metric[] = [
  { label: "Active Agents", value: "9", change: "+2 this week", trend: "up" },
  { label: "Tasks Today", value: "47", change: "+12 vs yesterday", trend: "up" },
  { label: "API Calls", value: "1,284", change: "-8% vs avg", trend: "down" },
  { label: "Success Rate", value: "96.2%", change: "+1.4%", trend: "up" },
];

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
    currentSpend: 24.17,
    usedToday: 1,
    dailyLimit: 1,
    creditsTotal: 30,
    creditsUsed: 25,
    creditUnit: "API calls",
    costPerUnit: 0.97,
    costUnit: "per call",
    atLimit: true,
    health: "warning",
  },
  {
    id: "claude-api",
    name: "Claude API",
    icon: "Brain",
    category: "ai-model",
    billingCycle: "pay-per-use",
    budgetCap: 50.00,
    currentSpend: 18.40,
    usedToday: 12400,
    dailyLimit: null,
    creditsTotal: 1000000,
    creditsUsed: 384000,
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
    currentSpend: 2.14,
    usedToday: 847,
    dailyLimit: null,
    creditsTotal: 500000,
    creditsUsed: 142000,
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
    currentSpend: 6.80,
    usedToday: 3,
    dailyLimit: null,
    creditsTotal: 500,
    creditsUsed: 227,
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
    currentSpend: 14.50,
    usedToday: 2,
    dailyLimit: 5,
    creditsTotal: 100,
    creditsUsed: 72,
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
    usedToday: 47,
    dailyLimit: null,
    creditsTotal: 10000,
    creditsUsed: 3200,
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
    usedToday: 84,
    dailyLimit: 10000,
    creditsTotal: 10000,
    creditsUsed: 84,
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
    usedToday: 847,
    dailyLimit: 3000,
    creditsTotal: 3000,
    creditsUsed: 847,
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
    usedToday: 23,
    dailyLimit: null,
    creditsTotal: 999,
    creditsUsed: 23,
    creditUnit: "sessions",
    costPerUnit: 0,
    costUnit: "self-hosted",
    atLimit: false,
    health: "healthy",
  },
];

export const dailySpendHistory: DailySpend[] = [
  { date: "May 28", total: 3.12, breakdown: { heygen: 0.97, "claude-api": 1.20, deepseek: 0.18, "openai-tts": 0.45, seedance: 0.32 } },
  { date: "May 29", total: 2.84, breakdown: { heygen: 0.97, "claude-api": 0.95, deepseek: 0.22, "openai-tts": 0.38, seedance: 0.32 } },
  { date: "May 30", total: 4.10, breakdown: { heygen: 0.97, "claude-api": 1.80, deepseek: 0.31, "openai-tts": 0.62, seedance: 0.40 } },
  { date: "May 31", total: 2.60, breakdown: { heygen: 0.97, "claude-api": 0.88, deepseek: 0.15, "openai-tts": 0.30, seedance: 0.30 } },
  { date: "Jun 1",  total: 3.45, breakdown: { heygen: 0.97, "claude-api": 1.40, deepseek: 0.28, "openai-tts": 0.50, seedance: 0.30 } },
  { date: "Jun 2",  total: 3.80, breakdown: { heygen: 0.97, "claude-api": 1.55, deepseek: 0.34, "openai-tts": 0.54, seedance: 0.40 } },
  { date: "Jun 3",  total: 2.92, breakdown: { heygen: 0.97, "claude-api": 1.10, deepseek: 0.21, "openai-tts": 0.34, seedance: 0.30 } },
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

export const recentActivity = [
  { time: "15:02", event: "Breaking News Scanner found 3 new articles", type: "info" as const },
  { time: "14:45", event: "Instagram bot replied to 5 comments on @aibyflo", type: "success" as const },
  { time: "14:30", event: "Longform video uploaded to YouTube", type: "success" as const },
  { time: "12:00", event: "X post published: AI agent architectures thread", type: "info" as const },
  { time: "10:30", event: "Blog email sent to 847 subscribers", type: "success" as const },
  { time: "09:15", event: "Morning Brief delivered to Slack #ai-news", type: "success" as const },
  { time: "09:00", event: "HeyGen API call initiated (1/1 daily)", type: "warning" as const },
  { time: "08:55", event: "DeepSeek fallback activated for script gen", type: "warning" as const },
];
