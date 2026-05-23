import { getPayload } from "payload";
import config from "../payload.config";

async function test() {
  try {
    console.log("Initializing Payload...");
    const payload = await getPayload({ config });
    console.log("Payload initialized successfully.");

    // Query category Maison toiture terrasse avec étage
    const categorySearch = await payload.find({
      collection: "house-categories",
      where: { slug: { equals: "maison-sans-faitage" } },
      limit: 1,
    });

    if (categorySearch.totalDocs === 0) {
      throw new Error("Category 'maison-sans-faitage' not found in database.");
    }
    const categoryId = categorySearch.docs[0].id;
    console.log("Category ID:", categoryId);

    // Let's print existing media records to see what IDs exist
    const mediaDocs = await payload.find({
      collection: "media",
      limit: 10,
    });
    console.log("Existing media IDs:", mediaDocs.docs.map((d: any) => d.id));

    // Try creating the test house document to see the exact Postgres error
    console.log("Trying to insert house document...");
    const result = await payload.create({
      collection: "houses",
      locale: "fr",
      data: {
        title: "Test Liberte",
        slug: "liberte-etage-me-atike-test",
        category: categoryId,
        price60x160: 1,
        price60x200: 1,
        defaultImage: 690, // let's see if 690 exists
        finalImage: 689,
        layers: {
          backgroundLayer: 675,
          constructionLayer: 681,
        },
        perdhesa: {
          bruto: 1,
          neto: 1,
        },
      },
    });

    console.log("Created successfully! Result ID:", result.id);
  } catch (error: any) {
    console.error("Test execution failed with error:");
    console.error(error);
    if (error.originalError) {
      console.error("Original Error:", error.originalError);
    }
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
  }
  process.exit(0);
}

test();
