"use client";

import { useFetch } from "@/lib/hooks";
import { Loader2, ExternalLink, Film, Clock, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface PipelineData {
  channels: ChannelStats[];
  morningBriefLog: string[];
  summary: { totalChannels: number; totalVideos: number; totalUploaded: number };
}

export default function PipelinesPage() {
  const { data, loading } = useFetch<PipelineData>("/api/pipelines", 30000);

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-gold" />
          <span className="text-sm">Reading pipeline history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Content Pipelines</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live from <code className="text-gold/70 text-xs">~/projects/viral-channels/history/</code> &mdash;{" "}
          {data.summary.totalUploaded} videos across {data.summary.totalChannels} channels
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass rounded-xl p-5 glow-gold">
          <div className="flex items-center gap-2 mb-2">
            <Film className="h-4 w-4 text-gold" />
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Videos</p>
          </div>
          <p className="text-3xl font-bold text-foreground">{data.summary.totalVideos}</p>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Upload className="h-4 w-4 text-success" />
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Uploaded</p>
          </div>
          <p className="text-3xl font-bold text-success">{data.summary.totalUploaded}</p>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-info" />
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Channels</p>
          </div>
          <p className="text-3xl font-bold text-foreground">{data.summary.totalChannels}</p>
        </div>
      </div>

      {/* Channel Details */}
      {data.channels.map((ch) => (
        <div key={ch.id} className="glass rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono uppercase bg-gold/10 text-gold rounded px-2 py-1 font-semibold">
                {ch.platform}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{ch.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {ch.uploadedCount} uploaded &middot; avg {ch.avgDuration}s &middot; log updated {ch.logUpdated}
                </p>
              </div>
            </div>
            {ch.lastUrl && (
              <a
                href={ch.lastUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold hover:bg-gold/20 transition-colors"
              >
                Latest <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* Recent Videos */}
          {ch.recentVideos.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground">Recent Videos</h4>
              {ch.recentVideos.map((v, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg bg-white/[0.02] p-3 hover:bg-white/[0.04] transition-colors"
                >
                  <div className={cn("h-2 w-2 rounded-full shrink-0", v.uploaded ? "bg-success" : "bg-warning")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{v.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {v.date} &middot; {Math.round(v.duration)}s
                    </p>
                  </div>
                  {v.url && (
                    <a
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold/60 hover:text-gold shrink-0"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Last Log Lines */}
          {ch.lastLogLines.length > 0 && (
            <div>
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Last Log Output</h4>
              <div className="rounded-lg bg-black/30 border border-border p-3 font-mono text-[11px] text-muted-foreground space-y-0.5 max-h-32 overflow-y-auto">
                {ch.lastLogLines.map((line, i) => (
                  <p key={i} className={cn(
                    line.toLowerCase().includes("error") && "text-destructive",
                    line.toLowerCase().includes("uploaded") && "text-success",
                    line.toLowerCase().includes("done") && "text-gold",
                  )}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Morning Brief Logs */}
      {data.morningBriefLog.length > 0 && (
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Morning Brief Pipeline Log</h3>
          <div className="rounded-lg bg-black/30 border border-border p-3 font-mono text-[11px] text-muted-foreground space-y-0.5 max-h-48 overflow-y-auto">
            {data.morningBriefLog.map((line, i) => (
              <p key={i} className={cn(
                line.toLowerCase().includes("error") && "text-destructive",
                line.toLowerCase().includes("success") && "text-success",
                line.toLowerCase().includes("upload") && "text-gold",
              )}>
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
