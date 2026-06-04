import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const VAULT_PATH = join(process.env.HOME || "/Users/franzccm", "SecondBrain");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
  }

  // Security: ensure path is within vault
  const fullPath = path.startsWith("/") ? path : join(VAULT_PATH, path);
  if (!fullPath.startsWith(VAULT_PATH)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  if (!existsSync(fullPath)) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  try {
    const content = readFileSync(fullPath, "utf8");
    return NextResponse.json({ content, path: fullPath });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read note", detail: String(error) },
      { status: 500 }
    );
  }
}
