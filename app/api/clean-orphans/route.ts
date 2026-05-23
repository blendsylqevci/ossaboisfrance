import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config });

    // Find all media files where 'house' is null/undefined
    const orphans = await payload.find({
      collection: "media",
      where: {
        house: {
          exists: false,
        },
      },
      limit: 1000,
      depth: 0,
    });

    console.log(`Found ${orphans.totalDocs} unlinked media files.`);

    return NextResponse.json({
      success: true,
      count: orphans.totalDocs,
      samples: orphans.docs.slice(0, 10).map((d: any) => ({
        id: d.id,
        filename: d.filename,
        url: d.url,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
