import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import config from "@/payload.config";

export type SiteSettingsView = {
  comingSoonEnabled: boolean;
};

async function fetchSiteSettings(): Promise<SiteSettingsView> {
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

export const getSiteSettings = unstable_cache(
  fetchSiteSettings,
  ["site-settings"],
  { tags: ["site-settings"], revalidate: 60 }
);
