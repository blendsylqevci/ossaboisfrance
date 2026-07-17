import { getPayload } from "payload";
import config from "@/payload.config";

export type SiteSettingsView = {
  comingSoonEnabled: boolean;
};

/**
 * Read during ISR generation; the CMS hook invalidates every locale layout.
 * Errors intentionally propagate so ISR keeps serving its last known-good page
 * instead of caching a fail-open maintenance value for the full safety TTL.
 */
export async function getSiteSettings(): Promise<SiteSettingsView> {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({
    slug: "site-settings",
    depth: 0,
  });
  return {
    comingSoonEnabled: Boolean(
      (doc as { comingSoonEnabled?: boolean }).comingSoonEnabled
    ),
  };
}
