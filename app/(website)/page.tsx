import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function IndexPage() {
  const headersList = await headers();

  // 1. Try to detect country from standard CDN/Vercel/Cloudflare headers
  const countryHeader =
    headersList.get("x-vercel-ip-country") ||
    headersList.get("cf-ipcountry") ||
    headersList.get("x-country-code") ||
    "";
  const country = countryHeader.toUpperCase();

  const regionHeader = headersList.get("x-vercel-ip-country-region") || "";
  const region = regionHeader.toUpperCase();

  const cityHeader = headersList.get("x-vercel-ip-city") || headersList.get("cf-ipcity") || "";
  const city = cityHeader.toLowerCase();

  // France visits get French
  if (country === "FR") {
    redirect("/fr");
  }

  // Switzerland visits
  if (country === "CH") {
    // If the visitor is from Geneva (region GE or city matching Geneva/Genève), show French.
    // Otherwise, default to German.
    if (
      region === "GE" ||
      city.includes("geneve") ||
      city.includes("genève") ||
      city.includes("geneva")
    ) {
      redirect("/fr");
    } else {
      redirect("/de");
    }
  }

  // Germany or Austria visits get German
  if (country === "DE" || country === "AT") {
    redirect("/de");
  }

  // Netherlands visits get Dutch
  if (country === "NL") {
    redirect("/nl");
  }

  // 2. Fallback to Accept-Language header
  const acceptLanguage = headersList.get("accept-language") || "";
  const languages = acceptLanguage.split(",").map((lang) => lang.split(";")[0].trim().toLowerCase());

  // Find first matching language that we support
  const detectedLanguage = languages.find((lang) => {
    if (lang.startsWith("fr")) return true;
    if (lang.startsWith("de")) return true;
    if (lang.startsWith("nl")) return true;
    return false;
  });

  if (detectedLanguage) {
    if (detectedLanguage.startsWith("fr")) redirect("/fr");
    if (detectedLanguage.startsWith("de")) redirect("/de");
    if (detectedLanguage.startsWith("nl")) redirect("/nl");
  }

  // 3. Default fallback for other countries and languages is English
  redirect("/en");
}

