"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Search, Command, X, Bot, FileText, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFetch } from "@/lib/hooks";
import { cn } from "@/lib/utils";

interface AgentResult {
  id: string;
  name: string;
  status: string;
  category: string;
}

interface NoteResult {
  title: string;
  folder: string;
  path: string;
}

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [agentResults, setAgentResults] = useState<AgentResult[]>([]);
  const [noteResults, setNoteResults] = useState<NoteResult[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fetch agent summary for notification count (errors)
  const { data: agentData } = useFetch<{
    agents: AgentResult[];
    summary: { error: number; running: number };
  }>("/api/agents", 30000);

  const errorCount = agentData?.summary.error || 0;
  const errorAgents = agentData?.agents.filter((a) => a.status === "error") || [];

  // Keyboard shortcut
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotifOpen(false);
        setQuery("");
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Search effect
  useEffect(() => {
    if (!query.trim()) {
      setAgentResults([]);
      setNoteResults([]);
      return;
    }

    const q = query.toLowerCase();

    // Search agents
    if (agentData?.agents) {
      setAgentResults(
        agentData.agents
          .filter(
            (a) =>
              a.name.toLowerCase().includes(q) ||
              a.id.toLowerCase().includes(q) ||
              a.category.toLowerCase().includes(q)
          )
          .slice(0, 5)
      );
    }

    // Search notes (async)
    const controller = new AbortController();
    fetch("/api/obsidian", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.notes) {
          setNoteResults(
            data.notes
              .filter(
                (n: NoteResult) =>
                  n.title.toLowerCase().includes(q) || n.folder.toLowerCase().includes(q)
              )
              .slice(0, 5)
          );
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [query, agentData]);

  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 18
        ? "Good afternoon"
        : "Good evening";

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-navy/50 px-6 backdrop-blur-sm relative">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{greeting}, Franz</h1>
        <p className="text-xs text-muted-foreground">
          {now.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}{" "}
          &mdash; Bali, WITA
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <button
          onClick={() => {
            setSearchOpen(true);
            setTimeout(() => searchRef.current?.focus(), 100);
          }}
          className="flex h-9 items-center gap-2 rounded-lg border border-border bg-white/[0.03] px-3 text-sm text-muted-foreground transition-colors hover:bg-white/[0.06]"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="ml-2 hidden rounded border border-border bg-white/5 px-1.5 py-0.5 text-[10px] font-mono sm:inline-block">
            <Command className="inline h-2.5 w-2.5" />K
          </kbd>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white/[0.03] text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
            {errorCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                {errorCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-border glass-strong p-3 shadow-xl">
              <h4 className="text-xs font-semibold text-foreground mb-2">
                {errorCount > 0 ? "Agent Alerts" : "All Clear"}
              </h4>
              {errorAgents.length > 0 ? (
                <div className="space-y-2">
                  {errorAgents.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 rounded-lg bg-destructive/10 p-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">{a.name}</p>
                        <p className="text-[10px] text-muted-foreground">{a.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">All agents running normally.</p>
              )}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-dim text-sm font-bold text-navy">
          F
        </div>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24" onClick={() => setSearchOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg rounded-xl border border-border glass-strong p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search agents, notes, pipelines..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button onClick={() => { setSearchOpen(false); setQuery(""); }}>
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <div className="mt-3 max-h-80 overflow-y-auto space-y-3">
              {/* Agent results */}
              {agentResults.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Agents</p>
                  {agentResults.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => { setSearchOpen(false); setQuery(""); router.push("/agents"); }}
                      className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-white/[0.05] transition-colors"
                    >
                      <Bot className="h-4 w-4 text-gold shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">{a.name}</p>
                        <p className="text-[10px] text-muted-foreground">{a.category} &middot; {a.status}</p>
                      </div>
                      <div className={cn(
                        "ml-auto h-2 w-2 rounded-full",
                        a.status === "running" ? "bg-success" : a.status === "error" ? "bg-destructive" : "bg-muted-foreground"
                      )} />
                    </button>
                  ))}
                </div>
              )}

              {/* Note results */}
              {noteResults.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Notes</p>
                  {noteResults.map((n) => (
                    <button
                      key={n.path}
                      onClick={() => { setSearchOpen(false); setQuery(""); router.push("/brain"); }}
                      className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-white/[0.05] transition-colors"
                    >
                      <FileText className="h-4 w-4 text-gold/60 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">{n.title}</p>
                        <p className="text-[10px] text-muted-foreground">{n.folder}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {query && agentResults.length === 0 && noteResults.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No results for &ldquo;{query}&rdquo;</p>
              )}

              {!query && (
                <p className="text-xs text-muted-foreground text-center py-4">Type to search agents and notes...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
