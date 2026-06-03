import type { Locale } from "@/lib/i18n";

export type PlanimetryRoom = {
  label: string;
  area: number;
};

/** Room labels matching the A Frame House plan (m² on planimetry). */
const A_FRAME_PLANIMETRY_ROOMS: PlanimetryRoom[] = [
  { label: "Salon", area: 19.97 },
  { label: "Cuisine", area: 11.04 },
  { label: "Chambre", area: 9.49 },
  { label: "Salle de bain", area: 4.84 },
  { label: "Entrée", area: 4.74 },
  { label: "Terrasse principale", area: 11.73 },
  { label: "Terrasse", area: 8.4 },
  { label: "Terrasse entrée", area: 4.8 },
];

const FALLBACK_BY_SLUG: Record<string, PlanimetryRoom[]> = {
  "a-frame-house": A_FRAME_PLANIMETRY_ROOMS,
  "a-frame-house-me-kulm": A_FRAME_PLANIMETRY_ROOMS,
};

const ROOM_LABEL_I18N: Record<string, Partial<Record<Locale, string>>> = {
  Salon: { en: "Living room", de: "Wohnzimmer", nl: "Woonkamer" },
  Cuisine: { en: "Kitchen", de: "Küche", nl: "Keuken" },
  Chambre: { en: "Bedroom", de: "Schlafzimmer", nl: "Slaapkamer" },
  "Salle de bain": { en: "Bathroom", de: "Badezimmer", nl: "Badkamer" },
  Entrée: { en: "Entrance", de: "Eingang", nl: "Entree" },
  "Terrasse principale": {
    en: "Main terrace",
    de: "Hauptterrasse",
    nl: "Hoofdterras",
  },
  Terrasse: { en: "Terrace", de: "Terrasse", nl: "Terras" },
  "Terrasse entrée": {
    en: "Entrance terrace",
    de: "Eingangsterrasse",
    nl: "Entree terras",
  },
};

function normalizeRooms(raw: unknown): PlanimetryRoom[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const label = "label" in item ? String((item as { label: unknown }).label).trim() : "";
      const area = Number((item as { area: unknown }).area);
      if (!label || !Number.isFinite(area)) return null;
      return { label, area };
    })
    .filter((r): r is PlanimetryRoom => r !== null);
}

export function getPlanimetryRooms(
  slug: string,
  cmsDetails: unknown,
  locale: Locale
): PlanimetryRoom[] {
  const fromCms = normalizeRooms(cmsDetails);
  const rooms = fromCms.length > 0 ? fromCms : FALLBACK_BY_SLUG[slug] ?? [];

  return rooms.map((room) => ({
    label: ROOM_LABEL_I18N[room.label]?.[locale] ?? room.label,
    area: room.area,
  }));
}

export function formatPlanimetryArea(area: number, locale: Locale): string {
  const formatted = Number.isInteger(area) ? String(area) : area.toFixed(2);
  return locale === "en" ? `${formatted} m²` : `${formatted} m²`;
}

export function resolvePlanimetryDisplayUrl(
  planimetryUrl: string | null | undefined,
  planimetryVisualUrl: string | null | undefined
): string | null {
  return planimetryVisualUrl || planimetryUrl || null;
}

export function planimetryModalCopy(locale: Locale) {
  return {
    spacesTitle:
      locale === "en"
        ? "Spaces & surfaces"
        : locale === "de"
          ? "Räume & Flächen"
          : locale === "nl"
            ? "Ruimtes & oppervlaktes"
            : "Espaces & surfaces",
    noDetails:
      locale === "en"
        ? "Room details for this plan are not available yet."
        : locale === "de"
          ? "Raumdetails für diesen Plan sind noch nicht verfügbar."
          : locale === "nl"
            ? "Kamerdetails voor dit plan zijn nog niet beschikbaar."
            : "Les détails des pièces pour ce plan ne sont pas encore disponibles.",
  };
}
