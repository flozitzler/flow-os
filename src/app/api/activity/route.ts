import { NextResponse } from "next/server";
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";

interface ActivityEntry {
  time: string;
  event: string;
  type: "success" | "warning" | "info" | "error";
  source: string;
}

function getRecentLogEntries(logFile: string, source: string, count = 5): ActivityEntry[] {
  if (!existsSync(logFile)) return [];
  try {
    const content = readFileSync(logFile, "utf8");
    const lines = content.trim().split("\n").filter(Boolean).slice(-count);
    return lines.map((line) => {
      // Try to extract timestamp
      const timeMatch = line.match(/\[(\d{2}:\d{2}:\d{2})\]/);
      const time = timeMatch ? timeMatch[1] : "";

      // Determine type from content
      let type: ActivityEntry["type"] = "info";
      const lower = line.toLowerCase();
      if (lower.includes("error") || lower.includes("fail") || lower.includes("traceback")) type = "error";
      else if (lower.includes("warn") || lower.includes("429") || lower.includes("retry")) type = "warning";
      else if (lower.includes("success") || lower.includes("uploaded") || lower.includes("done") || lower.includes("complete")) type = "success";

      return { time, event: line.slice(0, 150), type, source };
    });
  } catch {
    return [];
  }
}

function getSnapshotActivity(): ActivityEntry[] {
  return [
    { time: "14:22", event: "[14:22:01] Pipeline complete for llmempire — video uploaded to YouTube", type: "success", source: "AI Empire" },
    { time: "13:45", event: "[13:45:12] Instagram bot replied to 7 comments on @aibyflo", type: "success", source: "IG Comment Monitor" },
    { time: "13:00", event: "[13:00:03] Viral pipeline triggered for llmempire (scheduled)", type: "info", source: "AI Empire" },
    { time: "12:10", event: "[12:10:02] Paw Drama pipeline started — scripting phase", type: "info", source: "Paw Drama" },
    { time: "11:15", event: "[11:15:02] Pipeline complete for ruleofwealth", type: "success", source: "Rule of Wealth" },
    { time: "10:00", event: "[10:00:05] Rule of Wealth pipeline triggered (scheduled)", type: "info", source: "Rule of Wealth" },
    { time: "09:30", event: "[09:30:00] Comment responder cycle — checked 4 channels, replied to 12 comments", type: "success", source: "Viral Comments" },
    { time: "09:06", event: "[09:06:50] Morning Brief complete — uploaded to YouTube, Slack notified", type: "success", source: "Morning Brief" },
    { time: "09:02", event: "[09:02:10] HeyGen API call initiated (1/1 daily)", type: "warning", source: "Morning Brief" },
    { time: "09:00", event: "[09:00:15] Morning Brief pipeline started — fetching from 12 sources", type: "info", source: "Morning Brief" },
    { time: "08:55", event: "[08:55:30] DeepSeek fallback activated for script generation", type: "warning", source: "Morning Brief" },
    { time: "08:00", event: "[08:00:02] AI Empire pipeline triggered (scheduled run 1/3)", type: "info", source: "AI Empire" },
    { time: "07:00", event: "[07:00:05] Morning News Agent — 14 articles collected, brief sent to Slack", type: "success", source: "Morning News" },
    { time: "05:00", event: "[05:00:01] AIVE daily pipeline triggered", type: "info", source: "AI Video Empire" },
    { time: "02:30", event: "[02:30:00] IG Welcome Sequence — 3 new follower DMs sent", type: "success", source: "IG Welcome" },
    { time: "02:00", event: "[02:00:02] Auto Carousel generated — 4 slides for tomorrow", type: "success", source: "IG Auto Carousel" },
    { time: "01:00", event: "[01:00:04] Discord News — 6 AI headlines posted", type: "success", source: "Discord News" },
    { time: "00:30", event: "[00:30:01] IG Research Agents — trending topic analysis complete", type: "success", source: "IG Research" },
    { time: "00:00", event: "[00:00:03] IG Daily Content generated — 2 posts scheduled", type: "success", source: "IG Daily Content" },
  ];
}

export async function GET() {
  try {
    const entries: ActivityEntry[] = [];

    // Morning brief logs
    entries.push(...getRecentLogEntries("/tmp/morningbrief/launchd_stdout.log", "Morning Brief", 5));
    entries.push(...getRecentLogEntries("/tmp/morningbrief/shorts_scheduler.log", "Shorts Scheduler", 3));

    // Viral channel logs
    const viralLogDir = join(process.env.HOME || "/Users/franzccm", "projects/viral-channels/logs");
    if (existsSync(viralLogDir)) {
      for (const channel of ["llmempire", "ruleofwealth", "glowup", "pawdrama"]) {
        entries.push(
          ...getRecentLogEntries(join(viralLogDir, `${channel}_stdout.log`), channel, 3)
        );
      }
      entries.push(
        ...getRecentLogEntries(join(viralLogDir, "comments_stdout.log"), "Comment Monitor", 3)
      );
      // Today's dated logs
      const today = new Date().toISOString().split("T")[0];
      entries.push(
        ...getRecentLogEntries(join(viralLogDir, `comments_${today}.log`), "Comment Monitor", 3)
      );
    }

    // aibyflo logs
    entries.push(...getRecentLogEntries("/tmp/aibyflo_comment_stdout.log", "IG Comment Monitor", 3));

    // If no entries found from live logs, use snapshot
    if (entries.length === 0) {
      return NextResponse.json({ activity: getSnapshotActivity() });
    }

    // Sort by recency (we use file mod time as proxy — entries with timestamps first)
    entries.sort((a, b) => {
      if (a.time && b.time) return b.time.localeCompare(a.time);
      if (a.time) return -1;
      if (b.time) return 1;
      return 0;
    });

    // Deduplicate very similar entries
    const seen = new Set<string>();
    const unique = entries.filter((e) => {
      const key = e.event.slice(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({ activity: unique.slice(0, 30) });
  } catch {
    // Fallback: running on Vercel
    return NextResponse.json({ activity: getSnapshotActivity() });
  }
}
