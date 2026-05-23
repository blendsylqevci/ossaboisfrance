import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config });

    const targetIds = [675, 681, 684, 682, 683, 686, 685, 687, 688, 676, 677, 678, 679, 680, 689, 690];
    const results = [];

    for (const id of targetIds) {
      try {
        const doc = await payload.findByID({
          collection: "media",
          id,
          depth: 0,
        });
        results.push({ id, exists: true, alt: doc.alt, filename: doc.filename });
      } catch (err: any) {
        results.push({ id, exists: false, error: err.message });
      }
    }

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
