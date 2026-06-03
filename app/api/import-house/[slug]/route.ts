import { NextResponse } from "next/server";
import {
  getHouseImportConfig,
  listHouseImportSlugs,
  resolveHouseImportSlug,
} from "@/lib/house-import-registry";
import { runHouseImportRoute } from "@/lib/run-house-import-route";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const { slug: rawSlug } = await context.params;
  const slug = decodeURIComponent(rawSlug);
  const config = getHouseImportConfig(slug);

  if (!config) {
    return NextResponse.json(
      {
        success: false,
        error: `No import config for slug "${slug}".`,
        resolvedSlug: resolveHouseImportSlug(slug),
        availableSlugs: listHouseImportSlugs(),
      },
      { status: 404 }
    );
  }

  return runHouseImportRoute(config);
}
