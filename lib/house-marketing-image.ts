/** Marketing photography for listing cards; configurator layers keep their aligned originals. */
export function hasHouseMarketingImage(slug: string): boolean {
  return slug === "symphonie-avec-attique" || slug === "symphonie-me-atike";
}

export function getHouseMarketingImage(slug: string, defaultImage: string): string {
  if (hasHouseMarketingImage(slug)) {
    return "/images/marketing/symphonie-claire-voie-viroc.webp";
  }

  return defaultImage;
}
