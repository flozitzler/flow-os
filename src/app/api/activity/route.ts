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
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read activity", detail: String(error) },
      { status: 500 }
    );
  }
}
