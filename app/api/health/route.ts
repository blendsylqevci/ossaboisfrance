import { NextResponse } from "next/server";

/** Lightweight uptime check — no database (safe for UptimeRobot). */
export function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

export function HEAD() {
  return new NextResponse(null, { status: 200 });
}
