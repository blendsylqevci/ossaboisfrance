import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  try {
    const payload = await getPayload({ config });

    const filePath = path.join(process.cwd(), "public/images/houses/liberte etage me atike/10 pedm.png");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, error: "File 10 pedm.png does not exist at " + filePath });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fileSize = fs.statSync(filePath).size;
    const mimetype = "image/png";

    console.log("Attempting to upload 10 pedm.png directly...");
    const mediaDoc = await payload.create({
      collection: "media",
      data: {
        alt: "Test alt for 10 pedm.png",
        mediaType: "material_layer",
      },
      file: {
        data: fileBuffer,
        name: "10 pedm.png",
        mimetype: mimetype,
        size: fileSize,
      },
    });

    return NextResponse.json({ success: true, doc: mediaDoc });
  } catch (error: any) {
    console.error("Upload 10 pedm.png failed with error:", error);
    return NextResponse.json({
      success: false,
      message: error.message,
      stack: error.stack,
      detail: error.detail || error.originalError?.message || error.cause?.message || "No further details"
    });
  }
}
