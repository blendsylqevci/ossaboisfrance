import { revalidatePath } from "next/cache";

const LOCALES = ["fr", "en", "de", "nl"];

/**
 * On-demand revalidation for house-related pages. Safe to call from Payload
 * hooks: if it runs outside a Next request context (e.g. CLI scripts), it
 * swallows the error so a CMS save is never blocked.
 */
export function revalidateHousePaths(slug?: string): void {
  try {
    for (const locale of LOCALES) {
      revalidatePath(`/${locale}/maisons`);
      if (slug) {
        revalidatePath(`/${locale}/maisons/${slug}`);
      }
      revalidatePath(`/${locale}`);
    }
  } catch (err) {
    console.warn("[revalidate-house] skipped (no request context):", err);
  }
}
