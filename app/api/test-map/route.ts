import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import { mapHouseDocToConfiguratorData } from "@/lib/house-mapper";

export async function GET() {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: 'houses',
      where: { slug: { equals: 'monna-me-atike' } },
    });

    if (result.totalDocs === 0) {
      return NextResponse.json({ error: "No house doc found" });
    }

    const houseDoc = result.docs[0];

    // Fetch global house options to propagate dynamic pricing and metadata
    let globalOptions = null;
    try {
      globalOptions = await payload.findGlobal({
        slug: 'house-options',
        depth: 2,
      });
    } catch (error) {
      console.error('Failed to fetch global house options:', error);
    }

    const mediaMap: Record<string, string> = {};
    const configObj = houseDoc.dynamicFieldsConfig
      ? typeof houseDoc.dynamicFieldsConfig === 'string'
        ? JSON.parse(houseDoc.dynamicFieldsConfig)
        : houseDoc.dynamicFieldsConfig
      : {};

    const mediaIds: string[] = [];
    for (const fieldSlug in configObj) {
      const fieldConf = configObj[fieldSlug];
      if (fieldConf && fieldConf.enabled && fieldConf.options) {
        for (const layerKey in fieldConf.options) {
          const mediaId = fieldConf.options[layerKey];
          if (mediaId && typeof mediaId === 'string') {
            mediaIds.push(mediaId);
          }
        }
      }
    }

    if (mediaIds.length > 0) {
      try {
        const mediaDocs = await payload.find({
          collection: 'media',
          where: {
            id: {
              in: mediaIds,
            },
          },
          limit: mediaIds.length,
          depth: 0,
        });
        if (mediaDocs && mediaDocs.docs) {
          mediaDocs.docs.forEach((doc: any) => {
            mediaMap[doc.id] = doc.url || '';
          });
        }
      } catch (err) {
        console.error('Failed to pre-fetch override media docs:', err);
      }
    }

    const configuratorConfig = mapHouseDocToConfiguratorData(houseDoc, globalOptions, mediaMap, "en");

    return NextResponse.json({
      houseDoc: {
        id: houseDoc.id,
        slug: houseDoc.slug,
        title: houseDoc.title,
        price60x160: houseDoc.price60x160,
        price60x200: houseDoc.price60x200,
      },
      configuratorConfig
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack });
  }
}
