import { NextResponse } from "next/server";
import { listHouseImportSlugs } from "@/lib/house-import-registry";

/** Lists all canonical slugs importable via `/api/import-house/{slug}`. */
export async function GET() {
  return NextResponse.json({
    success: true,
    count: listHouseImportSlugs().length,
    slugs: listHouseImportSlugs(),
    usage: "GET /api/import-house/{slug} — same safe engine as /api/import-*",
  });
}
