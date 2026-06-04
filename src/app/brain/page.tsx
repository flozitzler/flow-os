"use client";

import { useState } from "react";
import { Brain, FolderOpen, FileText, Search, ChevronRight, ArrowLeft, Loader2, X } from "lucide-react";
import { useFetch } from "@/lib/hooks";
import { cn } from "@/lib/utils";

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

interface ObsidianData {
  folders: VaultFolder[];
  notes: VaultNote[];
  homeContent: string;
  summary: { totalNotes: number; totalFolders: number; lastUpdated: string | null; vaultPath: string };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3600_000) return `${Math.round(diff / 60_000)} min ago`;
  if (diff < 86400_000) return `${Math.round(diff / 3600_000)}h ago`;
  return `${Math.round(diff / 86400_000)}d ago`;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

// Simple markdown renderer (headings, bold, links, lists, tables, code blocks)
function renderMarkdown(md: string) {
  const lines = md.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let inTable = false;
  let tableRows: string[][] = [];

  function flushTable() {
    if (tableRows.length === 0) return;
    elements.push(
      <div key={`table-${elements.length}`} className="overflow-x-auto my-3">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              {tableRows[0].map((cell, j) => (
                <th key={j} className="border border-border px-2 py-1.5 text-left text-muted-foreground font-semibold bg-white/[0.02]">
                  {cell.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.slice(2).map((row, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                {row.map((cell, j) => (
                  <td key={j} className="border border-border px-2 py-1.5 text-foreground/80">
                    {cell.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (inTable) flushTable();
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      elements.push(
        <code key={i} className="block text-[11px] font-mono text-gold/80 bg-black/30 px-3 py-0.5">
          {line}
        </code>
      );
      continue;
    }

    // Table rows
    if (line.includes("|") && line.trim().startsWith("|")) {
      inTable = true;
      const cells = line.split("|").slice(1, -1);
      // Skip separator rows (---|---)
      if (cells.every((c) => c.trim().match(/^[-:]+$/))) {
        tableRows.push(cells);
        continue;
      }
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Headings
    if (line.startsWith("# ")) {
      elements.push(<h1 key={i} className="text-lg font-bold text-foreground mt-4 mb-2">{line.slice(2)}</h1>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-sm font-semibold text-foreground mt-4 mb-1.5 uppercase tracking-wider">{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-sm font-medium text-gold mt-3 mb-1">{line.slice(4)}</h3>);
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="border-l-2 border-gold/30 pl-3 text-xs text-muted-foreground italic my-1">
          {line.slice(2)}
        </blockquote>
      );
    } else if (line.startsWith("- ")) {
      elements.push(
        <div key={i} className="flex gap-2 text-xs text-foreground/80 ml-2">
          <span className="text-gold/60">-</span>
          <span>{line.slice(2)}</span>
        </div>
      );
    } else if (line.startsWith("---")) {
      elements.push(<hr key={i} className="border-border my-3" />);
    } else if (line.trim()) {
      elements.push(<p key={i} className="text-xs text-foreground/80 leading-relaxed">{line}</p>);
    } else {
      elements.push(<div key={i} className="h-1" />);
    }
  }

  if (inTable) flushTable();

  return elements;
}

export default function BrainPage() {
  const { data, loading } = useFetch<ObsidianData>("/api/obsidian", 60000);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState<string | null>(null);
  const [noteLoading, setNoteLoading] = useState(false);
  const [folderFilter, setFolderFilter] = useState<string | null>(null);
  const [showHome, setShowHome] = useState(true);

  async function openNote(path: string) {
    setNoteLoading(true);
    setShowHome(false);
    try {
      const res = await fetch(`/api/obsidian/note?path=${encodeURIComponent(path)}`);
      const json = await res.json();
      setNoteContent(json.content);
      setSelectedNote(path);
    } catch {
      setNoteContent("Failed to load note.");
    }
    setNoteLoading(false);
  }

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-gold" />
          <span className="text-sm">Reading ~/SecondBrain...</span>
        </div>
      </div>
    );
  }

  const filteredNotes = data.notes.filter((n) => {
    const matchesSearch = !searchQuery ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.folder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = !folderFilter || n.folder === folderFilter;
    return matchesSearch && matchesFolder;
  });

  const selectedTitle = selectedNote
    ? selectedNote.split("/").pop()?.replace(".md", "")
    : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-5 w-5 text-gold" /> Second Brain
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            <code className="text-gold/70 text-xs">{data.summary.vaultPath}</code> &mdash;{" "}
            {data.summary.totalNotes} notes in {data.summary.totalFolders} folders
          </p>
        </div>
        {!showHome && (
          <button
            onClick={() => { setShowHome(true); setSelectedNote(null); setNoteContent(null); }}
            className="flex items-center gap-1.5 rounded-lg bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold hover:bg-gold/20 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Home.md
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/30 focus:outline-none focus:ring-1 focus:ring-gold/20 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left: Folders + Notes */}
        <div className="space-y-4">
          {/* PARA Folders */}
          <div className="space-y-2">
            <button
              onClick={() => setFolderFilter(null)}
              className={cn(
                "w-full rounded-lg p-2 text-left text-xs font-medium transition-colors",
                !folderFilter ? "bg-gold/10 text-gold" : "text-muted-foreground hover:bg-white/5"
              )}
            >
              All folders ({data.summary.totalNotes})
            </button>
            {data.folders.map((folder) => (
              <button
                key={folder.name}
                onClick={() => setFolderFilter(folder.name)}
                className={cn(
                  "w-full flex items-center justify-between rounded-lg p-3 text-left transition-all",
                  folderFilter === folder.name
                    ? "glass border-gold/20 text-gold"
                    : "hover:bg-white/[0.03] text-foreground"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <FolderOpen className={cn("h-4 w-4", folderFilter === folder.name ? "text-gold" : "text-muted-foreground")} />
                  <div>
                    <p className="text-sm font-medium">{folder.name}</p>
                    {folder.subfolders.length > 0 && (
                      <p className="text-[10px] text-muted-foreground">{folder.subfolders.join(", ")}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{folder.noteCount}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Note viewer or Home.md */}
        <div className="xl:col-span-2">
          {showHome && !selectedNote && (
            <div className="glass rounded-xl p-6 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gold">Home.md — Command Center</h3>
                <span className="text-[10px] text-muted-foreground">
                  Last updated: {data.summary.lastUpdated ? timeAgo(data.summary.lastUpdated) : "Unknown"}
                </span>
              </div>
              <div className="prose-sm">{renderMarkdown(data.homeContent)}</div>
            </div>
          )}

          {noteLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-gold" />
            </div>
          )}

          {selectedNote && noteContent && !noteLoading && (
            <div className="glass rounded-xl p-6 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gold">{selectedTitle}</h3>
                <button
                  onClick={() => { setSelectedNote(null); setNoteContent(null); setShowHome(true); }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="prose-sm">{renderMarkdown(noteContent)}</div>
            </div>
          )}

          {!showHome && !selectedNote && !noteLoading && (
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {folderFilter ? `${folderFilter}` : "All Notes"} ({filteredNotes.length})
              </h3>
              <div className="space-y-1">
                {filteredNotes.map((note) => (
                  <button
                    key={note.path}
                    onClick={() => openNote(note.path)}
                    className="w-full flex items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-4 w-4 text-gold/60 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{note.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {note.folder} &middot; {formatSize(note.size)}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                      {timeAgo(note.modified)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes list below Home.md when in home view */}
          {showHome && (
            <div className="glass rounded-xl p-5 mt-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Recent Notes
              </h3>
              <div className="space-y-1">
                {filteredNotes.slice(0, 15).map((note) => (
                  <button
                    key={note.path}
                    onClick={() => openNote(note.path)}
                    className="w-full flex items-center justify-between rounded-lg p-2.5 text-left transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-3.5 w-3.5 text-gold/60 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{note.title}</p>
                        <p className="text-[10px] text-muted-foreground">{note.folder}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                      {timeAgo(note.modified)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
