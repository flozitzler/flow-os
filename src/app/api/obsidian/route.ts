import { NextResponse } from "next/server";
import { readdirSync, statSync, readFileSync, existsSync } from "fs";
import { join, relative } from "path";

const VAULT_PATH = join(process.env.HOME || "/Users/franzccm", "SecondBrain");

interface VaultFolder {
  name: string;
  path: string;
  noteCount: number;
  subfolders: string[];
}

interface VaultNote {
  title: string;
  path: string;
  relativePath: string;
  folder: string;
  size: number;
  modified: string;
  modifiedMs: number;
  preview: string;
}

function walkDir(dir: string): string[] {
  const files: string[] = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      if (entry.name === "Assets") continue;
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...walkDir(fullPath));
      } else if (entry.name.endsWith(".md")) {
        files.push(fullPath);
      }
    }
  } catch {
    // skip inaccessible dirs
  }
  return files;
}

function getSnapshotData() {
  const folders: VaultFolder[] = [
    { name: "1-Projects", path: "", noteCount: 24, subfolders: ["Flowsulting", "Viral Channels", "Internship", "AI Empire"] },
    { name: "2-Areas", path: "", noteCount: 18, subfolders: ["Health", "Finance", "Career", "Relationships"] },
    { name: "3-Resources", path: "", noteCount: 45, subfolders: ["AI Tools", "Automation", "Business", "Templates"] },
    { name: "4-Archive", path: "", noteCount: 32, subfolders: ["Old Projects", "Completed", "Reference"] },
  ];

  const notes: VaultNote[] = [
    { title: "Home", path: "Home.md", relativePath: "Home.md", folder: "Root", size: 4200, modified: "2026-06-05T08:00:00Z", modifiedMs: Date.now() - 3600000, preview: "Command center for all systems and projects" },
    { title: "Flowsulting Launch Plan", path: "", relativePath: "1-Projects/Flowsulting/Launch Plan.md", folder: "1-Projects", size: 3100, modified: "2026-06-05T10:00:00Z", modifiedMs: Date.now() - 7200000, preview: "Q2 2026 launch plan for AI consulting business" },
    { title: "Viral Pipeline Architecture", path: "", relativePath: "1-Projects/Viral Channels/Architecture.md", folder: "1-Projects", size: 2800, modified: "2026-06-04T14:00:00Z", modifiedMs: Date.now() - 86400000, preview: "Two-voice dialogue format with Minecraft bg + zoom punch captions" },
    { title: "Agent Infrastructure", path: "", relativePath: "1-Projects/AI Empire/Infrastructure.md", folder: "1-Projects", size: 5200, modified: "2026-06-03T16:00:00Z", modifiedMs: Date.now() - 172800000, preview: "33 launchd agents, 6 cron jobs, 9 always-on daemons" },
    { title: "Internship Report Progress", path: "", relativePath: "1-Projects/Internship/Progress.md", folder: "1-Projects", size: 1800, modified: "2026-06-04T18:00:00Z", modifiedMs: Date.now() - 72000000, preview: "Studienarbeit chapters 1-3 complete, working on chapter 4" },
    { title: "Weekly Review — W23", path: "", relativePath: "2-Areas/Career/Weekly Review W23.md", folder: "2-Areas", size: 1200, modified: "2026-06-02T20:00:00Z", modifiedMs: Date.now() - 259200000, preview: "Flow OS shipped, AI OS deployed, 3 viral channels running" },
    { title: "AI Tools Comparison", path: "", relativePath: "3-Resources/AI Tools/Comparison.md", folder: "3-Resources", size: 3400, modified: "2026-05-30T12:00:00Z", modifiedMs: Date.now() - 518400000, preview: "Claude vs GPT vs DeepSeek — cost, quality, speed benchmarks" },
    { title: "HeyGen API Notes", path: "", relativePath: "3-Resources/Automation/HeyGen API.md", folder: "3-Resources", size: 2100, modified: "2026-05-28T10:00:00Z", modifiedMs: Date.now() - 691200000, preview: "1 call/day enforced by lockfile, avatar 167a2a23, Madelyn only" },
    { title: "Revenue Tracker", path: "", relativePath: "2-Areas/Finance/Revenue.md", folder: "2-Areas", size: 900, modified: "2026-06-02T09:00:00Z", modifiedMs: Date.now() - 259200000, preview: "June total: EUR 2,300 — consulting + internship" },
    { title: "Content Calendar", path: "", relativePath: "1-Projects/Viral Channels/Content Calendar.md", folder: "1-Projects", size: 1600, modified: "2026-06-01T15:00:00Z", modifiedMs: Date.now() - 345600000, preview: "Daily schedule: llmempire 3x, ruleofwealth 2x, pawdrama 2x" },
  ];

  const homeContent = `# Command Center

## Active Systems
| System | Status | Schedule |
|--------|--------|----------|
| Morning Brief | Running | 09:00 WITA daily |
| Viral Pipeline | Running | 3-7x daily across 4 channels |
| @aibyflo Instagram | Running | 7 automated scripts |
| X (@wizard_flo) | Running | Daily post + weekly blog |
| Chrome CDP | Running | Always on, port 9222 |

## Current Focus
- Flowsulting launch: chatbot demo + landing page
- Internship report: Chapter 4 in progress
- Growing social presence across platforms

## Quick Stats
- **33** launchd agents loaded
- **9** always-on daemons
- **4** viral channels producing daily
- **455+** videos uploaded total

## This Week
- Deployed Flow OS dashboard with live agent monitoring
- Updated AI OS with June 5 data
- Continued internship report (ch3 done, ch4 started)
- LinkedIn build-in-public series ongoing

---
*Last updated: June 5, 2026*`;

  const summary = {
    totalNotes: 119,
    totalFolders: 4,
    lastUpdated: new Date().toISOString(),
    vaultPath: "~/SecondBrain",
  };

  return { folders, notes, homeContent, summary };
}

export async function GET() {
  try {
    if (!existsSync(VAULT_PATH)) throw new Error("No vault");

    // Get all markdown files
    const allFiles = walkDir(VAULT_PATH);

    // Build folder structure
    const topLevelDirs = readdirSync(VAULT_PATH, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith(".") && d.name !== "Assets")
      .sort((a, b) => a.name.localeCompare(b.name));

    const folders: VaultFolder[] = topLevelDirs.map((dir) => {
      const dirPath = join(VAULT_PATH, dir.name);
      const notes = walkDir(dirPath);
      const subfolders = readdirSync(dirPath, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith("."))
        .map((d) => d.name);

      return {
        name: dir.name,
        path: dirPath,
        noteCount: notes.length,
        subfolders,
      };
    });

    // Build notes list with metadata
    const notes: VaultNote[] = allFiles.map((filePath) => {
      const stat = statSync(filePath);
      const relPath = relative(VAULT_PATH, filePath);
      const parts = relPath.split("/");
      const folder = parts.length > 1 ? parts[0] : "Root";
      const content = readFileSync(filePath, "utf8");

      // Get first non-empty, non-heading line as preview
      const lines = content.split("\n").filter((l) => l.trim() && !l.startsWith("#") && !l.startsWith("---") && !l.startsWith(">"));
      const preview = lines[0]?.slice(0, 120) || "";

      return {
        title: parts[parts.length - 1].replace(".md", ""),
        path: filePath,
        relativePath: relPath,
        folder,
        size: stat.size,
        modified: stat.mtime.toISOString(),
        modifiedMs: stat.mtimeMs,
        preview,
      };
    });

    // Sort by most recently modified
    notes.sort((a, b) => b.modifiedMs - a.modifiedMs);

    // Home.md content
    let homeContent = "";
    try {
      homeContent = readFileSync(join(VAULT_PATH, "Home.md"), "utf8");
    } catch {
      homeContent = "Home.md not found";
    }

    const summary = {
      totalNotes: notes.length,
      totalFolders: folders.length,
      lastUpdated: notes[0]?.modified || null,
      vaultPath: VAULT_PATH,
    };

    return NextResponse.json({ folders, notes, homeContent, summary });
  } catch {
    // Fallback: running on Vercel
    return NextResponse.json(getSnapshotData());
  }
}
