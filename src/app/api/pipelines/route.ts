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

function getLiveData() {
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

  return { channels, morningBriefLog, summary };
}

function getSnapshotData() {
  const channels: ChannelStats[] = [
    {
      id: "llmempire",
      name: "AI Empire (@LLMEmpire)",
      platform: "YouTube",
      totalVideos: 187,
      lastUpload: "2026-06-05",
      lastTitle: "OpenAI Just Changed Everything — Here's What No One Told You",
      lastUrl: "https://youtube.com/shorts/example1",
      avgDuration: 58,
      uploadedCount: 174,
      recentVideos: [
        { date: "2026-06-05", title: "OpenAI Just Changed Everything — Here's What No One Told You", summary: "", duration: 59, uploaded: true, url: "https://youtube.com/shorts/example1" },
        { date: "2026-06-04", title: "Claude 4.6 vs GPT-5: The Test Nobody Expected", summary: "", duration: 57, uploaded: true, url: "https://youtube.com/shorts/example2" },
        { date: "2026-06-03", title: "This AI Agent Replaced an Entire Marketing Team", summary: "", duration: 61, uploaded: true, url: "" },
        { date: "2026-06-02", title: "Why Every Developer Should Learn Agent Architecture", summary: "", duration: 55, uploaded: true, url: "" },
        { date: "2026-06-01", title: "The $0 AI Stack That Makes $5K/Month", summary: "", duration: 58, uploaded: true, url: "" },
      ],
      lastLogLines: ["[14:22:01] Pipeline complete for llmempire", "[14:21:58] Video uploaded successfully", "[14:21:30] Post-processing done"],
      logUpdated: "2h ago",
    },
    {
      id: "ruleofwealth",
      name: "Rule of Wealth (@RuleOfWealth)",
      platform: "YouTube",
      totalVideos: 142,
      lastUpload: "2026-06-05",
      lastTitle: "Warren Buffett's #1 Rule About AI Investing",
      lastUrl: "https://youtube.com/shorts/example3",
      avgDuration: 54,
      uploadedCount: 131,
      recentVideos: [
        { date: "2026-06-05", title: "Warren Buffett's #1 Rule About AI Investing", summary: "", duration: 52, uploaded: true, url: "https://youtube.com/shorts/example3" },
        { date: "2026-06-04", title: "This Simple Budget Rule Changed My Life", summary: "", duration: 56, uploaded: true, url: "" },
        { date: "2026-06-03", title: "Why Rich People Never Use Credit Cards", summary: "", duration: 53, uploaded: true, url: "" },
      ],
      lastLogLines: ["[11:15:02] Pipeline complete for ruleofwealth", "[11:14:58] Video uploaded"],
      logUpdated: "5h ago",
    },
    {
      id: "glowup",
      name: "Glow Up Protocol",
      platform: "YouTube",
      totalVideos: 68,
      lastUpload: "2026-06-04",
      lastTitle: "5 Morning Habits That Changed My Face in 30 Days",
      lastUrl: "",
      avgDuration: 52,
      uploadedCount: 61,
      recentVideos: [
        { date: "2026-06-04", title: "5 Morning Habits That Changed My Face in 30 Days", summary: "", duration: 54, uploaded: true, url: "" },
        { date: "2026-06-03", title: "The Protein Myth Nobody Talks About", summary: "", duration: 49, uploaded: true, url: "" },
      ],
      lastLogLines: ["[09:45:12] Pipeline complete for glowup"],
      logUpdated: "1d ago",
    },
    {
      id: "pawdrama",
      name: "Paw Drama (@paw_drama_stories)",
      platform: "TikTok",
      totalVideos: 94,
      lastUpload: "2026-06-05",
      lastTitle: "When Your Cat Discovers the Printer",
      lastUrl: "",
      avgDuration: 47,
      uploadedCount: 89,
      recentVideos: [
        { date: "2026-06-05", title: "When Your Cat Discovers the Printer", summary: "", duration: 45, uploaded: true, url: "" },
        { date: "2026-06-04", title: "The Great Curtain Heist of 2026", summary: "", duration: 48, uploaded: true, url: "" },
        { date: "2026-06-03", title: "Cat vs Roomba: Round 47", summary: "", duration: 50, uploaded: true, url: "" },
      ],
      lastLogLines: ["[19:32:05] Pipeline complete for pawdrama", "[19:31:58] Video uploaded to TikTok"],
      logUpdated: "3h ago",
    },
  ];

  const morningBriefLog = [
    "[09:00:02] Morning Brief pipeline started",
    "[09:00:15] Fetching AI news from 12 sources...",
    "[09:01:22] 8 articles collected, scoring relevance...",
    "[09:01:45] Script generated via DeepSeek (fallback)",
    "[09:02:10] HeyGen API call initiated (1/1 daily)",
    "[09:04:30] Avatar video rendering complete",
    "[09:05:12] Post-processing: subtitles + watermark + BGM",
    "[09:06:45] Uploaded to YouTube: AI News Brief — June 5, 2026",
    "[09:06:48] Slack notification sent to #ai-news",
    "[09:06:50] Pipeline complete — total: 6m 48s",
  ];

  const summary = {
    totalChannels: channels.length,
    totalVideos: channels.reduce((s, c) => s + c.totalVideos, 0),
    totalUploaded: channels.reduce((s, c) => s + c.uploadedCount, 0),
  };

  return { channels, morningBriefLog, summary };
}

export async function GET() {
  try {
    // Try live filesystem data first
    if (!existsSync(HISTORY_DIR)) throw new Error("No local data");
    const data = getLiveData();
    return NextResponse.json(data);
  } catch {
    // Fallback: running on Vercel or no local data
    return NextResponse.json(getSnapshotData());
  }
}
