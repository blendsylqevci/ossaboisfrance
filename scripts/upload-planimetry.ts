/**
 * Upload planimetry from public/planimetries-raw/ and link to house slug(s).
 *
 * Usage:
 *   npx tsx scripts/upload-planimetry.ts "A FRAME HOUSE.png" a-frame-house a-frame-house-me-kulm
 */
import { getPayload } from "payload";
import config from "../payload.config";
import { uploadPlanimetryFromRaw } from "../lib/upload-planimetry-from-raw";

async function main() {
  const [, , rawFilename, ...slugs] = process.argv;

  if (!rawFilename || slugs.length === 0) {
    console.error(
      'Usage: npx tsx scripts/upload-planimetry.ts "<filename in planimetries-raw>" <house-slug> [...]'
    );
    process.exit(1);
  }

  const payload = await getPayload({ config });
  const result = await uploadPlanimetryFromRaw(payload, {
    filename: rawFilename,
    houseSlugs: slugs,
    alt: `Planimétrie ${slugs.join(" / ")}`,
  });

  console.log("Planimetry uploaded and linked:");
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
