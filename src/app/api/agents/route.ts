import { NextResponse } from "next/server";
import { execSync } from "child_process";
import { readFileSync, statSync, existsSync, readdirSync } from "fs";
import { join } from "path";

interface PlistSchedule {
  Hour?: number;
  Minute?: number;
}

interface AgentInfo {
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
  category: "content" | "social" | "research" | "ops" | "infra" | "viral";
  icon: string;
  script: string;
  logFile: string | null;
  lastLog: string[];
}

const AGENT_META: Record<string, Partial<AgentInfo>> = {
  "com.exventure.morningbrief": {
    name: "Morning Brief Longform",
    description: "Daily AI news video via HeyGen + YouTube",
    category: "content",
    icon: "Newspaper",
  },
  "com.exventure.chrome-for-testing": {
    name: "Chrome CDP",
    description: "Headless Chrome on port 9222 for automation",
    category: "infra",
    icon: "Globe",
  },
  "com.exventure.keepawake": {
    name: "Keepawake Daemon",
    description: "Prevents system sleep for background agents",
    category: "infra",
    icon: "Shield",
  },
  "com.aibyflo.comment-monitor": {
    name: "IG Comment Monitor",
    description: "@aibyflo comment monitoring + auto-reply",
    category: "social",
    icon: "Camera",
  },
  "com.aibyflo.daily-content": {
    name: "IG Daily Content",
    description: "@aibyflo daily content generation",
    category: "social",
    icon: "Camera",
  },
  "com.aibyflo.auto-carousel": {
    name: "IG Auto Carousel",
    description: "@aibyflo carousel post generator",
    category: "social",
    icon: "Camera",
  },
  "com.aibyflo.newsletter": {
    name: "IG Newsletter",
    description: "@aibyflo newsletter distribution",
    category: "social",
    icon: "Mail",
  },
  "com.aibyflo.research-agents": {
    name: "IG Research Agents",
    description: "@aibyflo content research pipeline",
    category: "research",
    icon: "Zap",
  },
  "com.aibyflo.welcome-sequence": {
    name: "IG Welcome Sequence",
    description: "@aibyflo new follower welcome DMs",
    category: "social",
    icon: "Camera",
  },
  "com.aibyflo.telegram-bot": {
    name: "Telegram Bot",
    description: "Flo's Telegram notification bot (24/7)",
    category: "social",
    icon: "MessageCircle",
  },
  "com.viral.llmempire": {
    name: "AI Empire",
    description: "YouTube Shorts — @LLMEmpire viral AI content",
    category: "viral",
    icon: "Flame",
  },
  "com.viral.ruleofwealth": {
    name: "Rule of Wealth",
    description: "YouTube Shorts — @RuleOfWealth finance content",
    category: "viral",
    icon: "Flame",
  },
  "com.viral.glowup": {
    name: "Glow Up Protocol",
    description: "YouTube Shorts — self-improvement channel",
    category: "viral",
    icon: "Flame",
  },
  "com.viral.pawdrama": {
    name: "Paw Drama",
    description: "TikTok — cat compilation channel",
    category: "viral",
    icon: "Flame",
  },
  "com.viral.auto-scheduler": {
    name: "Viral Auto-Scheduler",
    description: "Daily scheduling for all viral channels",
    category: "ops",
    icon: "BarChart3",
  },
  "com.viral.analytics": {
    name: "Viral Analytics",
    description: "Weekly analytics review (Sundays 02:00)",
    category: "ops",
    icon: "BarChart3",
  },
  "com.viral.monitor": {
    name: "Viral Comment Monitor",
    description: "Comment engagement tracking across channels",
    category: "ops",
    icon: "BarChart3",
  },
  "com.viral.discord-bot": {
    name: "Discord Bot",
    description: "Community Discord bot for viral channels",
    category: "social",
    icon: "MessageCircle",
  },
  "com.viral.discord-news": {
    name: "Discord News",
    description: "AI news feed to Discord",
    category: "social",
    icon: "MessageCircle",
  },
  "com.viral.comments": {
    name: "Viral Comments",
    description: "YouTube comment auto-reply system",
    category: "social",
    icon: "MessageCircle",
  },
  "com.viral.free-clips": {
    name: "Free Clips",
    description: "Free clip distribution (inactive)",
    category: "viral",
    icon: "Flame",
  },
  "com.flo.morningnews": {
    name: "Morning News Agent",
    description: "Daily AI news research + Slack delivery",
    category: "research",
    icon: "Newspaper",
  },
  "com.franz.x-daily-post": {
    name: "X Daily Post",
    description: "Automated daily post to @wizard_flo",
    category: "social",
    icon: "MessageCircle",
  },
  "com.franz.x-weekly-blog": {
    name: "X Weekly Blog",
    description: "Weekly blog thread to @wizard_flo",
    category: "content",
    icon: "MessageCircle",
  },
  "com.bali.instagram-daily": {
    name: "Bali Instagram",
    description: "Daily Bali content posting",
    category: "social",
    icon: "Camera",
  },
  "com.aive.daily-pipeline": {
    name: "AI Video Empire Pipeline",
    description: "Daily video production pipeline",
    category: "content",
    icon: "Video",
  },
  "com.aive.editor-server": {
    name: "AIVE Editor Server",
    description: "Video editor backend server",
    category: "infra",
    icon: "Globe",
  },
  "com.speechflow.agent": {
    name: "SpeechFlow Agent",
    description: "Speech-to-text processing agent",
    category: "infra",
    icon: "Volume2",
  },
  "ai.hermes.gateway": {
    name: "Hermes Gateway",
    description: "Agent orchestration gateway",
    category: "infra",
    icon: "Globe",
  },
  "ai.openclaw.gateway": {
    name: "OpenClaw Gateway",
    description: "OpenClaw API gateway",
    category: "infra",
    icon: "Globe",
  },
  "com.exventure.antigravity": {
    name: "Antigravity (Disabled)",
    description: "Legacy agent — disabled",
    category: "infra",
    icon: "Globe",
  },
  "com.exventure.lili-morningbrief": {
    name: "Lili Morning Brief (Disabled)",
    description: "Legacy EXAI News Show — superseded",
    category: "content",
    icon: "Video",
  },
  "com.viral.shadowwhispers": {
    name: "Shadow Whispers (Dead)",
    description: "Shadow banned channel — unloaded",
    category: "viral",
    icon: "Flame",
  },
};

function parseSchedule(plistContent: string): string {
  // StartInterval
  const intervalMatch = plistContent.match(/<key>StartInterval<\/key>\s*<integer>(\d+)<\/integer>/);
  if (intervalMatch) {
    const secs = parseInt(intervalMatch[1]);
    if (secs < 60) return `Every ${secs}s`;
    if (secs < 3600) return `Every ${Math.round(secs / 60)} min`;
    return `Every ${Math.round(secs / 3600)}h`;
  }

  // StartCalendarInterval — single dict
  const hourMatches = [...plistContent.matchAll(/<key>Hour<\/key>\s*<integer>(\d+)<\/integer>/g)];
  const minuteMatches = [...plistContent.matchAll(/<key>Minute<\/key>\s*<integer>(\d+)<\/integer>/g)];

  if (hourMatches.length > 0) {
    const times = hourMatches.map((h, i) => {
      const hour = parseInt(h[1]);
      const minute = minuteMatches[i] ? parseInt(minuteMatches[i][1]) : 0;
      return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    });
    return times.join(" / ") + " WITA";
  }

  // KeepAlive
  if (plistContent.includes("<key>KeepAlive</key>")) return "Always on";
  if (plistContent.includes("<key>RunAtLoad</key>") && plistContent.includes("<true/>"))
    return "Run at load";

  return "On demand";
}

function extractScript(plistContent: string): string {
  const args = [...plistContent.matchAll(/<string>([^<]+)<\/string>/g)].map((m) => m[1]);
  const pyScript = args.find((a) => a.endsWith(".py"));
  if (pyScript) return pyScript;
  // Check bash -c
  const bashCmd = args.find((a) => a.includes(".py"));
  if (bashCmd) {
    const match = bashCmd.match(/([^\s]+\.py)/);
    if (match) return match[1];
  }
  return args.join(" ");
}

function extractLogFile(plistContent: string): string | null {
  const match = plistContent.match(/<key>StandardOutPath<\/key>\s*<string>([^<]+)<\/string>/);
  return match ? match[1] : null;
}

function getLastLogLines(logFile: string | null, count = 5): string[] {
  if (!logFile || !existsSync(logFile)) return [];
  try {
    const content = readFileSync(logFile, "utf8");
    const lines = content.trim().split("\n").filter(Boolean);
    return lines.slice(-count);
  } catch {
    return [];
  }
}

function getLastModified(logFile: string | null): string {
  if (!logFile || !existsSync(logFile)) return "Unknown";
  try {
    const stat = statSync(logFile);
    const diff = Date.now() - stat.mtimeMs;
    if (diff < 60_000) return "Just now";
    if (diff < 3600_000) return `${Math.round(diff / 60_000)} min ago`;
    if (diff < 86400_000) return `${Math.round(diff / 3600_000)}h ago`;
    return `${Math.round(diff / 86400_000)}d ago`;
  } catch {
    return "Unknown";
  }
}

export async function GET() {
  try {
    // Get launchctl status for all agents
    const launchctlOutput = execSync("launchctl list 2>/dev/null", { encoding: "utf8" });
    const launchctlMap = new Map<string, { pid: number | null; exitCode: number | null }>();

    for (const line of launchctlOutput.trim().split("\n").slice(1)) {
      const parts = line.trim().split(/\t/);
      if (parts.length >= 3) {
        const pid = parts[0] === "-" ? null : parseInt(parts[0]);
        const exitCode = parts[1] === "-" ? null : parseInt(parts[1]);
        const label = parts[2];
        launchctlMap.set(label, { pid, exitCode });
      }
    }

    // Read all plist files
    const launchAgentsDir = join(process.env.HOME || "/Users/franzccm", "Library/LaunchAgents");
    const plistFiles = readdirSync(launchAgentsDir).filter(
      (f) =>
        f.endsWith(".plist") &&
        (f.startsWith("com.exventure.") ||
          f.startsWith("com.aibyflo.") ||
          f.startsWith("com.viral.") ||
          f.startsWith("com.flo.") ||
          f.startsWith("com.franz.") ||
          f.startsWith("com.bali.") ||
          f.startsWith("com.aive.") ||
          f.startsWith("com.speechflow.") ||
          f.startsWith("ai.hermes.") ||
          f.startsWith("ai.openclaw."))
    );

    const agents: AgentInfo[] = plistFiles.map((filename) => {
      const label = filename.replace(".plist", "");
      const plistPath = join(launchAgentsDir, filename);
      const plistContent = readFileSync(plistPath, "utf8");

      const lcInfo = launchctlMap.get(label);
      const meta = AGENT_META[label] || { name: label, description: "", category: "ops" as const, icon: "Zap" };
      const logFile = extractLogFile(plistContent);
      const script = extractScript(plistContent);
      const schedule = parseSchedule(plistContent);

      // Determine status
      let status: AgentInfo["status"] = "idle";
      if (lcInfo) {
        if (lcInfo.pid && lcInfo.pid > 0) status = "running";
        else if (lcInfo.exitCode !== null && lcInfo.exitCode !== 0) status = "error";
        else status = "idle";
      }

      // Dead/disabled agents
      if (label.includes("antigravity") || label.includes("lili-morningbrief") || label.includes("shadowwhispers")) {
        status = "error";
      }

      return {
        id: label,
        name: meta.name || label,
        label,
        description: meta.description || "",
        status,
        pid: lcInfo?.pid ?? null,
        exitCode: lcInfo?.exitCode ?? null,
        lastRun: getLastModified(logFile),
        nextRun: null,
        schedule,
        category: meta.category || "ops",
        icon: meta.icon || "Zap",
        script,
        logFile,
        lastLog: getLastLogLines(logFile),
      };
    });

    // Sort: running first, then by category
    agents.sort((a, b) => {
      const statusOrder = { running: 0, error: 1, idle: 2, scheduled: 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    const summary = {
      total: agents.length,
      running: agents.filter((a) => a.status === "running").length,
      idle: agents.filter((a) => a.status === "idle").length,
      error: agents.filter((a) => a.status === "error").length,
    };

    return NextResponse.json({ agents, summary });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read agent data", detail: String(error) },
      { status: 500 }
    );
  }
}
