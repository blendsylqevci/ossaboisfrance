import { getPayload } from "payload";
import config from "@/payload.config";

export type SiteSettingsView = {
  comingSoonEnabled: boolean;
};

/** Always read fresh from DB — maintenance toggle must not be cached. */
export async function getSiteSettings(): Promise<SiteSettingsView> {
  try {
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
  } catch {
    return { comingSoonEnabled: false };
  }
}
