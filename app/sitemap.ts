import { MetadataRoute } from "next";
import { getPayload } from "payload";
import payloadConfig from "@/payload.config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://ossaboisfrance.com";
  const locales = ["fr", "en", "de", "nl"];

  // 1. Static routes
  const staticPaths = [
    "",
    "/maisons",
    "/qui-sommes-nous",
    "/contact",
    "/b2b",
    "/realisations",
    "/mentions-legales",
    "/politique-de-confidentialite",
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Generate localized entries for static routes
  for (const path of staticPaths) {
    // Add default (root/fr) path
    sitemapEntries.push({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: path === "" ? 1.0 : path === "/maisons" ? 0.9 : 0.7,
    });

    // Add paths for each language locale
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: path === "" ? 1.0 : path === "/maisons" ? 0.9 : 0.7,
      });
    }
  }

  // 2. Dynamic house routes from Payload CMS
  try {
    const payload = await getPayload({ config: payloadConfig });
    const housesRes = await payload.find({
      collection: "houses",
      limit: 100,
      depth: 0,
    });

    for (const house of housesRes.docs) {
      const slug = house.slug;

      // Default (without locale prefix)
      sitemapEntries.push({
        url: `${baseUrl}/maisons/${slug}`,
        lastModified: new Date(house.updatedAt || new Date()),
        changeFrequency: "weekly",
        priority: 0.8,
      });

      // Localized paths
      for (const locale of locales) {
        sitemapEntries.push({
          url: `${baseUrl}/${locale}/maisons/${slug}`,
          lastModified: new Date(house.updatedAt || new Date()),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  } catch (error) {
    console.error("Error generating dynamic routes for sitemap:", error);
  }

  return sitemapEntries;
}
