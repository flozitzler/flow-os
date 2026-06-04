import { NextResponse } from "next/server";
import { execSync } from "child_process";

export async function POST(request: Request) {
  try {
    const { label, action } = await request.json();

    if (!label || !action) {
      return NextResponse.json({ error: "Missing label or action" }, { status: 400 });
    }

    if (!["start", "stop"].includes(action)) {
      return NextResponse.json({ error: "Action must be 'start' or 'stop'" }, { status: 400 });
    }

    // Validate label format to prevent injection
    if (!/^[a-z0-9.-]+$/i.test(label)) {
      return NextResponse.json({ error: "Invalid agent label" }, { status: 400 });
    }

    const uid = process.getuid?.() ?? 501;

    if (action === "start") {
      // kickstart forces the agent to run immediately
      const cmd = `launchctl kickstart gui/${uid}/${label} 2>&1`;
      try {
        const output = execSync(cmd, { encoding: "utf8", timeout: 10000 });
        return NextResponse.json({ success: true, action: "started", label, output: output.trim() });
      } catch (err: unknown) {
        const error = err as { stderr?: string; message?: string };
        // kickstart may return exit code 36 if already running — that's fine
        const stderr = error.stderr || error.message || "";
        if (stderr.includes("36")) {
          return NextResponse.json({ success: true, action: "already_running", label });
        }
        return NextResponse.json({ success: false, error: stderr }, { status: 500 });
      }
    }

    if (action === "stop") {
      const cmd = `launchctl kill SIGTERM gui/${uid}/${label} 2>&1`;
      try {
        const output = execSync(cmd, { encoding: "utf8", timeout: 10000 });
        return NextResponse.json({ success: true, action: "stopped", label, output: output.trim() });
      } catch (err: unknown) {
        const error = err as { stderr?: string; message?: string };
        const stderr = error.stderr || error.message || "";
        // Process might not be running — that's okay
        if (stderr.includes("3") || stderr.includes("No such process")) {
          return NextResponse.json({ success: true, action: "already_stopped", label });
        }
        return NextResponse.json({ success: false, error: stderr }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to control agent", detail: String(error) },
      { status: 500 }
    );
  }
}
