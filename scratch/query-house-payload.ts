import { getPayload } from "payload";
import config from "../payload.config";

async function main() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'houses',
    where: { slug: { equals: 'monna-me-atike' } },
  });

  if (result.totalDocs === 0) {
    console.log("No house found!");
    process.exit(0);
  }

  const houseDoc = result.docs[0];
  console.log("--- HOUSE DOC LAYERS ---");
  console.log(JSON.stringify(houseDoc.layers, null, 2));

  console.log("--- HOUSE DOC PRICES ---");
  console.log("price60x160:", houseDoc.price60x160);
  console.log("price60x200:", houseDoc.price60x200);

  process.exit(0);
}

main().catch(console.error);
