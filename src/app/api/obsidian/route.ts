import { NextResponse } from "next/server";
import { readdirSync, statSync, readFileSync } from "fs";
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

export async function GET() {
  try {
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
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read Obsidian vault", detail: String(error) },
      { status: 500 }
    );
  }
}
