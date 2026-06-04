import { NextResponse } from "next/server";
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";

const VIRAL_DIR = join(process.env.HOME || "/Users/franzccm", "projects/viral-channels");
const HISTORY_DIR = join(VIRAL_DIR, "history");
const LOGS_DIR = join(VIRAL_DIR, "logs");

interface VideoEntry {
  date: string;
  title: string;
  summary: string;
  duration: number;
  uploaded: boolean;
  url: string;
}

interface ChannelStats {
  id: string;
  name: string;
  platform: string;
  totalVideos: number;
  lastUpload: string | null;
  lastTitle: string | null;
  lastUrl: string | null;
  avgDuration: number;
  uploadedCount: number;
  recentVideos: VideoEntry[];
  lastLogLines: string[];
  logUpdated: string;
}

const CHANNEL_META: Record<string, { name: string; platform: string }> = {
  llmempire: { name: "AI Empire (@LLMEmpire)", platform: "YouTube" },
  ruleofwealth: { name: "Rule of Wealth (@RuleOfWealth)", platform: "YouTube" },
  glowup: { name: "Glow Up Protocol", platform: "YouTube" },
  pawdrama: { name: "Paw Drama (@paw_drama_stories)", platform: "TikTok" },
};

function getLastLogLines(channel: string, count = 5): { lines: string[]; updated: string } {
  const logFile = join(LOGS_DIR, `${channel}_stdout.log`);
  if (!existsSync(logFile)) return { lines: [], updated: "No log" };
  try {
    const stat = statSync(logFile);
    const content = readFileSync(logFile, "utf8");
    const lines = content.trim().split("\n").filter(Boolean).slice(-count);
    const diff = Date.now() - stat.mtimeMs;
    let updated = "Unknown";
    if (diff < 60_000) updated = "Just now";
    else if (diff < 3600_000) updated = `${Math.round(diff / 60_000)} min ago`;
    else if (diff < 86400_000) updated = `${Math.round(diff / 3600_000)}h ago`;
    else updated = `${Math.round(diff / 86400_000)}d ago`;
    return { lines, updated };
  } catch {
    return { lines: [], updated: "Error" };
  }
}

export async function GET() {
  try {
    const historyFiles = readdirSync(HISTORY_DIR).filter((f) => f.endsWith(".json"));

    // Channel configs
    let config: Record<string, unknown> = {};
    try {
      config = JSON.parse(readFileSync(join(VIRAL_DIR, "config.json"), "utf8"));
    } catch {
      // no config
    }

    const channels: ChannelStats[] = [];

    for (const [channelId, meta] of Object.entries(CHANNEL_META)) {
      const histFile = join(HISTORY_DIR, `${channelId}.json`);
      let videos: VideoEntry[] = [];

      if (existsSync(histFile)) {
        try {
          videos = JSON.parse(readFileSync(histFile, "utf8"));
        } catch {
          videos = [];
        }
      }

      const uploaded = videos.filter((v) => v.uploaded);
      const avgDur = videos.length > 0 ? videos.reduce((s, v) => s + (v.duration || 0), 0) / videos.length : 0;
      const last = uploaded[uploaded.length - 1];
      const logData = getLastLogLines(channelId);

      channels.push({
        id: channelId,
        name: meta.name,
        platform: meta.platform,
        totalVideos: videos.length,
        lastUpload: last?.date || null,
        lastTitle: last?.title || null,
        lastUrl: last?.url || null,
        avgDuration: Math.round(avgDur),
        uploadedCount: uploaded.length,
        recentVideos: videos.slice(-5).reverse(),
        lastLogLines: logData.lines,
        logUpdated: logData.updated,
      });
    }

    // Morning brief pipeline
    const mbLogFile = "/tmp/morningbrief/launchd_stdout.log";
    const mbLog = getLastLogLines("morningbrief", 10);
    let morningBriefLog: string[] = [];
    if (existsSync(mbLogFile)) {
      try {
        const content = readFileSync(mbLogFile, "utf8");
        morningBriefLog = content.trim().split("\n").filter(Boolean).slice(-10);
      } catch {
        // ignore
      }
    }

    const summary = {
      totalChannels: channels.length,
      totalVideos: channels.reduce((s, c) => s + c.totalVideos, 0),
      totalUploaded: channels.reduce((s, c) => s + c.uploadedCount, 0),
    };

    return NextResponse.json({ channels, morningBriefLog, summary });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read pipeline data", detail: String(error) },
      { status: 500 }
    );
  }
}
