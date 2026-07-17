import { unstable_cache } from "next/cache";
import { getPayload } from "payload";

import config from "@/payload.config";
import { HOMEPAGE_CONTENT_CACHE_TAG } from "@/lib/cache-tags";
import type { Locale } from "@/lib/i18n";

const getCachedHomepageContent = unstable_cache(
  async (locale: Locale) => {
    const payload = await getPayload({ config });

    const categoriesPromise = payload.find({
      collection: "house-categories",
      limit: 100,
      locale,
    });

    const housesPromise = payload.find({
      collection: "houses",
      limit: 100,
      depth: 1,
      locale,
    });

    const globalOptionsPromise = payload
      .findGlobal({
        slug: "house-options",
        locale,
      })
      .catch((error) => {
        console.error("Failed to fetch global house options on homepage:", error);
        return null;
      });

    const [categories, houses, globalOptions] = await Promise.all([
      categoriesPromise,
      housesPromise,
      globalOptionsPromise,
    ]);

    return { categories, houses, globalOptions };
  },
  ["homepage-content-v1"],
  {
    revalidate: 600,
    tags: [HOMEPAGE_CONTENT_CACHE_TAG],
  }
);

/**
 * Keep CMS/database reads cached even though per-visitor hero rotation makes
 * the homepage HTML dynamic. Payload hooks invalidate this cache on changes.
 */
export function getHomepageContent(locale: Locale) {
  return getCachedHomepageContent(locale);
}
