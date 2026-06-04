import { NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const SETTINGS_FILE = join(process.env.HOME || "/Users/franzccm", ".ai-os-settings.json");

const DEFAULTS: Record<string, boolean> = {
  "slack-notifications": true,
  "email-digest": true,
  "error-alerts": true,
  "browser-notifications": false,
  "auto-recovery": true,
  "rate-limiting": true,
  "debug-mode": false,
  "dry-run-mode": false,
  "log-retention": true,
  "auto-backup": true,
  "analytics-tracking": true,
  "glassmorphism": true,
  "animations": true,
  "compact-mode": false,
};

function readSettings(): Record<string, boolean> {
  if (!existsSync(SETTINGS_FILE)) return { ...DEFAULTS };
  try {
    return { ...DEFAULTS, ...JSON.parse(readFileSync(SETTINGS_FILE, "utf8")) };
  } catch {
    return { ...DEFAULTS };
  }
}

function writeSettings(settings: Record<string, boolean>) {
  writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export async function GET() {
  return NextResponse.json(readSettings());
}

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();
    if (typeof key !== "string" || typeof value !== "boolean") {
      return NextResponse.json({ error: "Invalid key/value" }, { status: 400 });
    }
    const settings = readSettings();
    settings[key] = value;
    writeSettings(settings);
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
