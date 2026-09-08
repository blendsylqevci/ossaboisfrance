import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import sharp from "sharp";
import type { Locale } from "@/lib/i18n";
import {
  isAcceptedCheckoutAgreementSnapshot,
  type AcceptedCheckoutAgreements,
} from "./checkout-legal.ts";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const CONTENT_BOTTOM = PAGE_HEIGHT - 64;
const MAX_REMOTE_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_ORDER_PDF_BYTES = 2 * 1024 * 1024;
const MAX_ORDER_OPTIONS = 100;
const MAX_ORDER_AMOUNT = 1_000_000_000;
const MAX_ORDER_SURFACE = 100_000;
const ALLOWED_REMOTE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const COLORS = {
  ink: "#1E293B",
  muted: "#64748B",
  line: "#E7E5DF",
  olive: "#5E6F4F",
  oliveDark: "#435139",
  wood: "#C5A880",
  ivory: "#FAF9F6",
  white: "#FFFFFF",
  softGreen: "#EEF2EA",
  softBlue: "#F4F7F8",
};

export type OrderPdfOption = {
  categoryLabel: string;
  optionLabel: string;
  calculation: string;
  totalPrice: number;
};

export type OrderPdfAgreements = AcceptedCheckoutAgreements;

export type OrderPdfData = {
  locale: Locale;
  orderRef: string;
  submittedAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  delivery: {
    streetAddress: string;
    city: string;
    zipCode: string;
    stateRegion: string;
    country: string;
    notes?: string;
  };
  house: {
    name: string;
    imageUrl?: string;
    structureSize: string;
  };
  surfaces: {
    net: number;
    gross: number;
    exteriorWalls: number;
    roof: number;
  };
  options: OrderPdfOption[];
  pricing: {
    baseStructure: number;
    optionsTotal: number;
    configurationSubtotal: number;
    truckCount: number;
    transport: number;
    installationMode: "ossa" | "professional";
    assembly: number;
    grandTotal: number;
  };
  agreements: OrderPdfAgreements;
  contactEmail: string;
};

type PdfCopy = {
  documentTitle: string;
  documentBadge: string;
  reference: string;
  submitted: string;
  customer: string;
  project: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  model: string;
  structure: string;
  surfaces: string;
  net: string;
  gross: string;
  walls: string;
  roof: string;
  configuration: string;
  component: string;
  selection: string;
  amount: string;
  baseStructure: string;
  transport: string;
  transportDescription: (trucks: number) => string;
  assembly: string;
  assemblyOssa: string;
  assemblyProfessional: string;
  optionsSubtotal: string;
  configurationSubtotal: string;
  total: string;
  exclVat: string;
  notes: string;
  declarations: string;
  declarationsIntro: string;
  accepted: string;
  nextSteps: string;
  nextStepsText: string;
  disclaimerTitle: string;
  disclaimer: string;
  imageDisclaimer: string;
  continued: string;
  page: string;
};

const COPY: Record<Locale, PdfCopy> = {
  fr: {
    documentTitle: "Récapitulatif de demande de devis",
    documentBadge: "ESTIMATION NON CONTRACTUELLE",
    reference: "Référence",
    submitted: "Demande enregistrée le",
    customer: "Coordonnées du client",
    project: "Projet et livraison",
    name: "Nom",
    email: "E-mail",
    phone: "Téléphone",
    address: "Adresse du chantier",
    model: "Modèle",
    structure: "Structure",
    surfaces: "Surfaces du projet",
    net: "Habitable (neto)",
    gross: "Au sol (bruto)",
    walls: "Murs extérieurs",
    roof: "Toiture",
    configuration: "Configuration et estimation",
    component: "Composant",
    selection: "Choix sélectionné",
    amount: "Montant HT",
    baseStructure: "Structure et ossature bois",
    transport: "Transport",
    transportDescription: (trucks) => `${trucks} camion(s) x 3 500 EUR`,
    assembly: "Montage",
    assemblyOssa: "Montage réalisé par Ossa Bois France",
    assemblyProfessional: "Montage par le client ou une entreprise tierce",
    optionsSubtotal: "Options sélectionnées",
    configurationSubtotal: "Sous-total maison configurée",
    total: "Estimation totale HT",
    exclVat: "TVA non incluse",
    notes: "Informations complémentaires",
    declarations: "Déclarations confirmées",
    declarationsIntro: "Confirmées lors de l'envoi de la demande. Elles ne constituent pas une signature de devis.",
    accepted: "CONFIRMÉ",
    nextSteps: "Prochaines étapes",
    nextStepsText: "Notre bureau d'études vérifie la faisabilité technique et l'accès au chantier. Un conseiller vous contactera pour valider les finitions, la TVA applicable et établir le devis contractuel définitif.",
    disclaimerTitle: "Information importante",
    disclaimer: "Ce document est un récapitulatif automatique de votre configuration. Il ne constitue ni une facture, ni un devis contractuel, ni une acceptation définitive du projet. Les surfaces, prix, délais, transport, montage, TVA, garanties et conditions restent soumis à l'étude technique, à la vérification du terrain et au devis signé par les parties.",
    imageDisclaimer: "Aperçu indicatif de la configuration",
    continued: "suite",
    page: "Page",
  },
  en: {
    documentTitle: "Quotation request summary",
    documentBadge: "NON-BINDING ESTIMATE",
    reference: "Reference",
    submitted: "Request recorded on",
    customer: "Customer details",
    project: "Project and delivery",
    name: "Name",
    email: "Email",
    phone: "Phone",
    address: "Construction site",
    model: "Model",
    structure: "Structure",
    surfaces: "Project areas",
    net: "Living area (neto)",
    gross: "Footprint (bruto)",
    walls: "Exterior walls",
    roof: "Roof",
    configuration: "Configuration and estimate",
    component: "Component",
    selection: "Selected choice",
    amount: "Amount excl. VAT",
    baseStructure: "Timber frame structure",
    transport: "Transport",
    transportDescription: (trucks) => `${trucks} truck(s) x EUR 3,500`,
    assembly: "Assembly",
    assemblyOssa: "Assembly performed by Ossa Bois France",
    assemblyProfessional: "Assembly by the customer or a third-party company",
    optionsSubtotal: "Selected options",
    configurationSubtotal: "Configured house subtotal",
    total: "Total estimate excl. VAT",
    exclVat: "VAT not included",
    notes: "Additional information",
    declarations: "Confirmed declarations",
    declarationsIntro: "Confirmed when the request was submitted. They do not constitute a signed quotation.",
    accepted: "CONFIRMED",
    nextSteps: "Next steps",
    nextStepsText: "Our engineering team reviews technical feasibility and site access. An advisor will contact you to validate finishes, applicable VAT and the final contractual quotation.",
    disclaimerTitle: "Important information",
    disclaimer: "This document is an automated summary of your configuration. It is not an invoice, a binding quotation or final project acceptance. Areas, prices, lead times, transport, assembly, VAT, warranties and terms remain subject to the technical study, site verification and a quotation signed by both parties.",
    imageDisclaimer: "Indicative configuration preview",
    continued: "continued",
    page: "Page",
  },
  de: {
    documentTitle: "Zusammenfassung der Angebotsanfrage",
    documentBadge: "UNVERBINDLICHE SCHÄTZUNG",
    reference: "Referenz",
    submitted: "Anfrage erfasst am",
    customer: "Kundendaten",
    project: "Projekt und Lieferung",
    name: "Name",
    email: "E-Mail",
    phone: "Telefon",
    address: "Baustellenadresse",
    model: "Modell",
    structure: "Struktur",
    surfaces: "Projektflächen",
    net: "Wohnfläche (neto)",
    gross: "Grundfläche (bruto)",
    walls: "Außenwände",
    roof: "Dach",
    configuration: "Konfiguration und Schätzung",
    component: "Komponente",
    selection: "Gewählte Ausführung",
    amount: "Betrag zzgl. MwSt.",
    baseStructure: "Holzrahmenstruktur",
    transport: "Transport",
    transportDescription: (trucks) => `${trucks} Lkw x 3.500 EUR`,
    assembly: "Montage",
    assemblyOssa: "Montage durch Ossa Bois France",
    assemblyProfessional: "Montage durch den Kunden oder ein Drittunternehmen",
    optionsSubtotal: "Ausgewählte Optionen",
    configurationSubtotal: "Zwischensumme konfiguriertes Haus",
    total: "Gesamtschätzung zzgl. MwSt.",
    exclVat: "MwSt. nicht enthalten",
    notes: "Zusätzliche Angaben",
    declarations: "Bestätigte Erklärungen",
    declarationsIntro: "Bei Übermittlung der Anfrage bestätigt. Sie stellen keine Unterzeichnung eines Angebots dar.",
    accepted: "BESTÄTIGT",
    nextSteps: "Nächste Schritte",
    nextStepsText: "Unser Planungsteam prüft die technische Machbarkeit und den Zugang zur Baustelle. Ein Berater kontaktiert Sie zur Bestätigung der Ausführung, der anwendbaren MwSt. und des endgültigen Vertragsangebots.",
    disclaimerTitle: "Wichtiger Hinweis",
    disclaimer: "Dieses Dokument ist eine automatisch erstellte Zusammenfassung Ihrer Konfiguration. Es ist weder eine Rechnung noch ein verbindliches Angebot oder eine endgültige Projektannahme. Flächen, Preise, Fristen, Transport, Montage, MwSt., Garantien und Bedingungen stehen unter dem Vorbehalt der technischen Prüfung, der Grundstücksprüfung und eines von beiden Parteien unterzeichneten Angebots.",
    imageDisclaimer: "Unverbindliche Konfigurationsvorschau",
    continued: "Fortsetzung",
    page: "Seite",
  },
  nl: {
    documentTitle: "Samenvatting offerteaanvraag",
    documentBadge: "VRIJBLIJVENDE RAMING",
    reference: "Referentie",
    submitted: "Aanvraag geregistreerd op",
    customer: "Klantgegevens",
    project: "Project en levering",
    name: "Naam",
    email: "E-mail",
    phone: "Telefoon",
    address: "Bouwplaats",
    model: "Model",
    structure: "Structuur",
    surfaces: "Projectoppervlakken",
    net: "Woonoppervlakte (neto)",
    gross: "Grondoppervlakte (bruto)",
    walls: "Buitenmuren",
    roof: "Dak",
    configuration: "Configuratie en raming",
    component: "Onderdeel",
    selection: "Geselecteerde keuze",
    amount: "Bedrag excl. btw",
    baseStructure: "Houtskeletstructuur",
    transport: "Transport",
    transportDescription: (trucks) => `${trucks} vrachtwagen(s) x EUR 3.500`,
    assembly: "Montage",
    assemblyOssa: "Montage uitgevoerd door Ossa Bois France",
    assemblyProfessional: "Montage door de klant of een derde onderneming",
    optionsSubtotal: "Geselecteerde opties",
    configurationSubtotal: "Subtotaal geconfigureerde woning",
    total: "Totale raming excl. btw",
    exclVat: "Btw niet inbegrepen",
    notes: "Aanvullende informatie",
    declarations: "Bevestigde verklaringen",
    declarationsIntro: "Bevestigd bij het verzenden van de aanvraag. Dit is geen ondertekende offerte.",
    accepted: "BEVESTIGD",
    nextSteps: "Volgende stappen",
    nextStepsText: "Ons engineeringteam beoordeelt de technische haalbaarheid en de bereikbaarheid. Een adviseur neemt contact met u op om de afwerking, toepasselijke btw en de definitieve contractuele offerte te bevestigen.",
    disclaimerTitle: "Belangrijke informatie",
    disclaimer: "Dit document is een automatisch overzicht van uw configuratie. Het is geen factuur, bindende offerte of definitieve projectaanvaarding. Oppervlakken, prijzen, termijnen, transport, montage, btw, garanties en voorwaarden blijven afhankelijk van de technische studie, controle van het terrein en een door beide partijen ondertekende offerte.",
    imageDisclaimer: "Indicatieve configuratiepreview",
    continued: "vervolg",
    page: "Pagina",
  },
};

function cleanText(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
}

function cleanMultilineText(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, " ")
    .split("\n")
    .map((line) => line.replace(/[\t ]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function assertText(name: string, value: unknown, maximumLength: number): asserts value is string {
  if (typeof value !== "string" || !cleanText(value) || value.length > maximumLength) {
    throw new TypeError(`Invalid order PDF field: ${name}.`);
  }
}

function assertNonNegativeFinite(
  name: string,
  value: unknown,
  maximum = MAX_ORDER_AMOUNT
): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > maximum) {
    throw new TypeError(`Invalid order PDF amount: ${name}.`);
  }
}

function sameCents(left: number, right: number): boolean {
  return Math.round(left * 100) === Math.round(right * 100);
}

function concatenateBytes(chunks: readonly Uint8Array[]): Buffer {
  const totalLength = chunks.reduce((length, chunk) => length + chunk.byteLength, 0);
  const output = Buffer.allocUnsafe(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output;
}

/**
 * Fail closed if a caller constructs a PDF from anything other than a complete,
 * internally consistent server-side quote snapshot. This is intentionally more
 * strict than visual formatting: an official-looking PDF must never document a
 * client-authored or internally inconsistent total.
 */
export function validateOrderPdfData(data: OrderPdfData): void {
  if (!data || typeof data !== "object") {
    throw new TypeError("Invalid order PDF data.");
  }
  if (
    !data.customer ||
    typeof data.customer !== "object" ||
    !data.delivery ||
    typeof data.delivery !== "object" ||
    !data.house ||
    typeof data.house !== "object" ||
    !data.surfaces ||
    typeof data.surfaces !== "object" ||
    !data.pricing ||
    typeof data.pricing !== "object" ||
    !data.agreements ||
    typeof data.agreements !== "object"
  ) {
    throw new TypeError("Invalid order PDF data structure.");
  }
  if (
    typeof data.locale !== "string" ||
    !Object.prototype.hasOwnProperty.call(COPY, data.locale)
  ) {
    throw new TypeError("Invalid order PDF locale.");
  }
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(data.orderRef)) {
    throw new TypeError("Invalid order PDF reference.");
  }
  if (Number.isNaN(new Date(data.submittedAt).getTime())) {
    throw new TypeError("Invalid order PDF submission date.");
  }
  if (Number.isNaN(new Date(data.agreements.acceptedAt).getTime())) {
    throw new TypeError("Invalid order PDF agreement date.");
  }

  assertText("customer.name", data.customer.name, 120);
  assertText("customer.email", data.customer.email, 254);
  assertText("customer.phone", data.customer.phone, 40);
  assertText("delivery.streetAddress", data.delivery.streetAddress, 200);
  assertText("delivery.city", data.delivery.city, 100);
  assertText("delivery.zipCode", data.delivery.zipCode, 20);
  assertText("delivery.stateRegion", data.delivery.stateRegion, 100);
  assertText("delivery.country", data.delivery.country, 80);
  if (
    data.delivery.notes !== undefined &&
    (typeof data.delivery.notes !== "string" || data.delivery.notes.length > 4_000)
  ) {
    throw new TypeError("Invalid order PDF field: delivery.notes.");
  }
  assertText("house.name", data.house.name, 120);
  assertText("house.structureSize", data.house.structureSize, 40);
  if (
    data.house.imageUrl !== undefined &&
    (typeof data.house.imageUrl !== "string" || data.house.imageUrl.length > 2_048)
  ) {
    throw new TypeError("Invalid order PDF field: house.imageUrl.");
  }
  assertText("agreements.version", data.agreements.version, 80);
  assertText("contactEmail", data.contactEmail, 254);

  for (const [name, value] of Object.entries(data.surfaces)) {
    assertNonNegativeFinite(`surfaces.${name}`, value, MAX_ORDER_SURFACE);
  }
  if (data.surfaces.gross <= 1) {
    throw new TypeError("Invalid order PDF surface: surfaces.gross.");
  }

  if (!Array.isArray(data.options) || data.options.length > MAX_ORDER_OPTIONS) {
    throw new TypeError("Invalid order PDF options.");
  }
  data.options.forEach((option, index) => {
    if (!option || typeof option !== "object") {
      throw new TypeError(`Invalid order PDF option: ${index}.`);
    }
    assertText(`options.${index}.categoryLabel`, option.categoryLabel, 160);
    assertText(`options.${index}.optionLabel`, option.optionLabel, 200);
    if (typeof option.calculation !== "string" || option.calculation.length > 300) {
      throw new TypeError(`Invalid order PDF field: options.${index}.calculation.`);
    }
    assertNonNegativeFinite(`options.${index}.totalPrice`, option.totalPrice);
  });

  for (const [name, value] of Object.entries(data.pricing)) {
    if (name === "installationMode") continue;
    assertNonNegativeFinite(`pricing.${name}`, value);
  }
  if (
    !Number.isSafeInteger(data.pricing.truckCount) ||
    data.pricing.truckCount < 1 ||
    data.pricing.truckCount > 100
  ) {
    throw new TypeError("Invalid order PDF truck count.");
  }
  if (data.pricing.installationMode !== "ossa" && data.pricing.installationMode !== "professional") {
    throw new TypeError("Invalid order PDF installation mode.");
  }
  if (data.pricing.installationMode === "professional" && data.pricing.assembly !== 0) {
    throw new TypeError("Professional assembly must not be charged in an order PDF.");
  }
  if (data.pricing.installationMode === "ossa" && data.pricing.assembly <= 0) {
    throw new TypeError("Ossa Bois assembly must have a positive amount in an order PDF.");
  }

  const optionSum = data.options.reduce((sum, option) => sum + option.totalPrice, 0);
  if (!sameCents(optionSum, data.pricing.optionsTotal)) {
    throw new TypeError("Order PDF option totals are inconsistent.");
  }
  if (!sameCents(
    data.pricing.baseStructure + data.pricing.optionsTotal,
    data.pricing.configurationSubtotal
  )) {
    throw new TypeError("Order PDF configuration subtotal is inconsistent.");
  }
  if (!sameCents(
    data.pricing.configurationSubtotal + data.pricing.transport + data.pricing.assembly,
    data.pricing.grandTotal
  )) {
    throw new TypeError("Order PDF grand total is inconsistent.");
  }
  if (!sameCents(data.pricing.transport, data.pricing.truckCount * 3_500)) {
    throw new TypeError("Order PDF transport total is inconsistent.");
  }

  if (
    data.agreements.shipping !== true ||
    data.agreements.terms !== true ||
    data.agreements.urban !== true ||
    data.agreements.privacy !== true
  ) {
    throw new TypeError("Order PDF agreements are incomplete.");
  }
  if (!isAcceptedCheckoutAgreementSnapshot(data.agreements, data.locale)) {
    throw new TypeError("Order PDF agreement snapshot does not match the accepted terms.");
  }
}

function formatMoney(value: number, locale: Locale): string {
  const localeCode = locale === "fr" ? "fr-FR" : locale === "de" ? "de-DE" : locale === "nl" ? "nl-NL" : "en-GB";
  return new Intl.NumberFormat(localeCode, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace(/[\u00A0\u202F]/g, " ");
}

function formatDate(value: string, locale: Locale): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return cleanText(value);
  const localeCode = locale === "fr" ? "fr-FR" : locale === "de" ? "de-DE" : locale === "nl" ? "nl-NL" : "en-GB";
  return new Intl.DateTimeFormat(localeCode, {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  })
    .format(date)
    .replace(/[\u00A0\u202F]/g, " ");
}

function configuredHttpsHosts(variableNames: string[]): Set<string> {
  const hosts = new Set<string>();
  for (const variableName of variableNames) {
    const rawValue = process.env[variableName];
    if (!rawValue) continue;
    try {
      const url = new URL(rawValue);
      if (url.protocol === "https:") hosts.add(url.hostname.toLowerCase());
    } catch {
      // A malformed optional environment value must not broaden the allowlist.
    }
  }
  return hosts;
}

export function isAllowedOrderPdfImageUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    if (url.username || url.password || (url.port && url.port !== "443")) return false;

    const hostname = url.hostname.toLowerCase();
    const siteHosts = configuredHttpsHosts(["NEXT_PUBLIC_SITE_URL"]);
    siteHosts.add("ossaboisfrance.com");
    siteHosts.add("www.ossaboisfrance.com");
    const supabaseHosts = configuredHttpsHosts([
      "NEXT_PUBLIC_SUPABASE_URL",
      "S3_ENDPOINT",
    ]);

    if (url.protocol === "https:" && siteHosts.has(hostname)) {
      return ["/images/", "/media/", "/wp-content/uploads/", "/api/media/file/"].some(
        (prefix) => url.pathname.startsWith(prefix)
      );
    }
    if (url.protocol === "https:" && supabaseHosts.has(hostname)) {
      return url.pathname.startsWith("/storage/v1/object/public/");
    }
    return (
      process.env.NODE_ENV !== "production" &&
      url.protocol === "http:" &&
      (hostname === "localhost" || hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

async function readResponseBodyWithLimit(
  response: Response,
  maximumBytes: number
): Promise<Buffer | undefined> {
  const reader = response.body?.getReader();
  if (!reader) return undefined;

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value?.byteLength) continue;
      totalBytes += value.byteLength;
      if (totalBytes > maximumBytes) {
        await reader.cancel("Order PDF image exceeds the size limit.");
        return undefined;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  return totalBytes > 0 ? concatenateBytes(chunks) : undefined;
}

async function loadHousePreview(rawUrl?: string): Promise<Buffer | undefined> {
  if (!rawUrl || !isAllowedOrderPdfImageUrl(rawUrl)) return undefined;

  try {
    const response = await fetch(rawUrl, {
      redirect: "error",
      signal: AbortSignal.timeout(6_000),
    });
    if (!response.ok || !isAllowedOrderPdfImageUrl(response.url)) return undefined;

    const contentType = response.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
    if (!contentType || !ALLOWED_REMOTE_IMAGE_TYPES.has(contentType)) return undefined;

    const contentLength = Number(response.headers.get("content-length") || "0");
    if (Number.isFinite(contentLength) && contentLength > MAX_REMOTE_IMAGE_BYTES) return undefined;

    const source = await readResponseBodyWithLimit(response, MAX_REMOTE_IMAGE_BYTES);
    if (!source) return undefined;

    return await sharp(source, { limitInputPixels: 20_000_000 })
      .rotate()
      .resize(1400, 488, {
        fit: "cover",
        position: "centre",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: "4:4:4" })
      .toBuffer();
  } catch {
    return undefined;
  }
}

export async function generateOrderPdf(data: OrderPdfData): Promise<Buffer> {
  validateOrderPdfData(data);
  const copy = COPY[data.locale] || COPY.fr;
  const housePreview = await loadHousePreview(data.house.imageUrl);

  return await new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      autoFirstPage: false,
      bufferPages: true,
      compress: true,
      info: {
        Title: `${copy.documentTitle} - ${data.orderRef}`,
        Author: "Ossa Bois France",
        Subject: copy.documentBadge,
        Creator: "Ossa Bois France",
        CreationDate: new Date(data.submittedAt),
      },
      margins: { top: MARGIN, bottom: 64, left: MARGIN, right: MARGIN },
      size: "A4",
    });
    const chunks: Uint8Array[] = [];
    doc.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    doc.on("end", () => {
      const output = concatenateBytes(chunks);
      if (output.byteLength >= MAX_ORDER_PDF_BYTES) {
        reject(new Error("Generated order PDF exceeds the attachment size limit."));
        return;
      }
      resolve(output);
    });
    doc.on("error", reject);

    const asset = (...segments: string[]) => path.join(process.cwd(), "public", ...segments);
    const fontRegularPath = asset("fonts", "ppneuemontreal-book.otf");
    const fontMediumPath = asset("fonts", "ppneuemontreal-medium.otf");
    const fontBoldPath = asset("fonts", "ppneuemontreal-bold.otf");
    const logoPath = asset("images", "brand", "ossa-bois-logo.png");
    const useBrandFonts = [fontRegularPath, fontMediumPath, fontBoldPath].every(fs.existsSync);
    if (useBrandFonts) {
      doc.registerFont("OssaRegular", fontRegularPath);
      doc.registerFont("OssaMedium", fontMediumPath);
      doc.registerFont("OssaBold", fontBoldPath);
    }
    const regular = useBrandFonts ? "OssaRegular" : "Helvetica";
    const medium = useBrandFonts ? "OssaMedium" : "Helvetica-Bold";
    const bold = useBrandFonts ? "OssaBold" : "Helvetica-Bold";

    const addContinuationPage = () => {
      doc.addPage();
      doc.rect(0, 0, PAGE_WIDTH, 7).fill(COLORS.olive);
      doc
        .font(bold)
        .fontSize(10)
        .fillColor(COLORS.oliveDark)
        .text("OSSA BOIS FRANCE", MARGIN, 25, { lineBreak: false });
      doc
        .font(regular)
        .fontSize(8.5)
        .fillColor(COLORS.muted)
        .text(`${copy.reference}: ${cleanText(data.orderRef)}`, PAGE_WIDTH - MARGIN - 190, 26, {
          align: "right",
          lineBreak: false,
          width: 190,
        });
      doc.y = 55;
    };

    const ensureSpace = (height: number) => {
      if (doc.y + height > CONTENT_BOTTOM) addContinuationPage();
    };

    const sectionTitle = (label: string, minimumFollowingHeight = 0) => {
      ensureSpace(27 + minimumFollowingHeight);
      const y = doc.y;
      doc.rect(MARGIN, y + 2, 4, 15).fill(COLORS.wood);
      doc.font(bold).fontSize(10.5).fillColor(COLORS.oliveDark).text(cleanText(label).toUpperCase(), MARGIN + 12, y, {
        width: CONTENT_WIDTH - 12,
      });
      doc.y = y + 27;
    };

    const measureLabelValueHeight = (
      label: string,
      value: string,
      width: number,
      valueSize = 10
    ) => {
      doc.font(medium).fontSize(7.5);
      const labelHeight = doc.heightOfString(cleanText(label).toUpperCase(), { width });
      doc.font(medium).fontSize(valueSize);
      const valueHeight = doc.heightOfString(cleanText(value) || "-", {
        lineGap: 1,
        width,
      });
      return labelHeight + 6 + valueHeight;
    };

    const labelValue = (
      label: string,
      value: string,
      x: number,
      y: number,
      width: number,
      valueSize = 10
    ) => {
      doc.font(medium).fontSize(7.5).fillColor(COLORS.muted).text(cleanText(label).toUpperCase(), x, y, {
        width,
      });
      const labelHeight = doc.heightOfString(cleanText(label).toUpperCase(), { width });
      doc.font(medium).fontSize(valueSize).fillColor(COLORS.ink).text(cleanText(value) || "-", x, y + labelHeight + 6, {
        lineGap: 1,
        width,
      });
      return measureLabelValueHeight(label, value, width, valueSize);
    };

    const measureInfoCardHeight = (rows: Array<[string, string]>, width: number) => {
      const contentWidth = width - 30;
      return (
        39 +
        rows.reduce(
          (height, [label, value]) => height + measureLabelValueHeight(label, value, contentWidth, 9.2) + 13,
          0
        ) +
        5
      );
    };

    const drawInfoCard = (
      title: string,
      rows: Array<[string, string]>,
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      doc.roundedRect(x, y, width, height, 8).fillAndStroke(COLORS.ivory, COLORS.line);
      doc.font(bold).fontSize(9.5).fillColor(COLORS.oliveDark).text(cleanText(title), x + 15, y + 14, {
        width: width - 30,
      });
      let rowY = y + 39;
      for (const [label, value] of rows) {
        rowY += labelValue(label, value, x + 15, rowY, width - 30, 9.2) + 13;
      }
    };

    const drawSurfaceCards = () => {
      ensureSpace(76);
      const gap = 8;
      const width = (CONTENT_WIDTH - gap * 3) / 4;
      const entries: Array<[string, number]> = [
        [copy.net, data.surfaces.net],
        [copy.gross, data.surfaces.gross],
        [copy.walls, data.surfaces.exteriorWalls],
        [copy.roof, data.surfaces.roof],
      ];
      const y = doc.y;
      entries.forEach(([label, value], index) => {
        const x = MARGIN + index * (width + gap);
        doc.roundedRect(x, y, width, 62, 7).fillAndStroke(COLORS.softGreen, "#DDE5D7");
        doc.font(medium).fontSize(7.2).fillColor(COLORS.muted).text(label.toUpperCase(), x + 10, y + 12, {
          align: "center",
          height: 18,
          width: width - 20,
        });
        doc.font(bold).fontSize(15).fillColor(COLORS.oliveDark).text(`${value || 0} m²`, x + 8, y + 36, {
          align: "center",
          lineBreak: false,
          width: width - 16,
        });
      });
      doc.y = y + 76;
    };

    const tableColumns = {
      component: 136,
      selection: 253,
      amount: CONTENT_WIDTH - 136 - 253,
    };

    const drawTableHeader = () => {
      const headerHeight = 32;
      const y = doc.y;
      doc.rect(MARGIN, y, CONTENT_WIDTH, headerHeight).fill(COLORS.oliveDark);
      doc.font(bold).fontSize(7.4).fillColor(COLORS.white);
      doc.text(copy.component.toUpperCase(), MARGIN + 10, y + 10, {
        width: tableColumns.component - 20,
      });
      doc.text(copy.selection.toUpperCase(), MARGIN + tableColumns.component + 10, y + 10, {
        width: tableColumns.selection - 20,
      });
      doc.text(copy.amount.toUpperCase(), MARGIN + tableColumns.component + tableColumns.selection, y + 10, {
        align: "right",
        width: tableColumns.amount - 10,
      });
      doc.y = y + headerHeight;
    };

    const drawTableRow = (
      component: string,
      selection: string,
      calculation: string,
      amount: number,
      index: number
    ) => {
      doc.font(medium).fontSize(9.2);
      const componentHeight = doc.heightOfString(cleanText(component), {
        width: tableColumns.component - 20,
      });
      const selectionHeight = doc.heightOfString(cleanText(selection), {
        width: tableColumns.selection - 20,
      });
      doc.font(regular).fontSize(7.8);
      const calculationHeight = calculation
        ? doc.heightOfString(cleanText(calculation), { width: tableColumns.selection - 20 }) + 5
        : 0;
      doc.font(bold).fontSize(9.5);
      const amountHeight = doc.heightOfString(formatMoney(amount, data.locale), {
        width: tableColumns.amount - 10,
      });
      const height = Math.max(
        42,
        componentHeight + 20,
        selectionHeight + calculationHeight + 20,
        amountHeight + 24
      );

      if (doc.y + height > CONTENT_BOTTOM) {
        addContinuationPage();
        sectionTitle(copy.configuration, 32 + height);
        drawTableHeader();
      }

      const y = doc.y;
      doc.rect(MARGIN, y, CONTENT_WIDTH, height).fill(index % 2 === 0 ? COLORS.white : COLORS.softBlue);
      doc.moveTo(MARGIN, y + height).lineTo(MARGIN + CONTENT_WIDTH, y + height).strokeColor(COLORS.line).stroke();

      doc.font(medium).fontSize(9.2).fillColor(COLORS.ink).text(cleanText(component), MARGIN + 10, y + 12, {
        width: tableColumns.component - 20,
      });
      const selectionX = MARGIN + tableColumns.component + 10;
      doc.font(medium).fontSize(9.2).fillColor(COLORS.ink).text(cleanText(selection), selectionX, y + 10, {
        width: tableColumns.selection - 20,
      });
      if (calculation) {
        const optionHeight = doc.heightOfString(cleanText(selection), {
          width: tableColumns.selection - 20,
        });
        doc.font(regular).fontSize(7.8).fillColor(COLORS.muted).text(cleanText(calculation), selectionX, y + 13 + optionHeight, {
          width: tableColumns.selection - 20,
        });
      }
      doc.font(bold).fontSize(9.5).fillColor(COLORS.ink).text(formatMoney(amount, data.locale), MARGIN + tableColumns.component + tableColumns.selection, y + 12, {
        align: "right",
        width: tableColumns.amount - 10,
      });
      doc.y = y + height;
    };

    const drawSummaryRow = (label: string, amount: number, strong = false, hint?: string) => {
      const height = strong ? 54 : 34;
      if (doc.y + height + 2 > CONTENT_BOTTOM) {
        addContinuationPage();
        sectionTitle(`${copy.configuration} (${copy.continued})`, height + 2);
      }
      const y = doc.y;
      doc.rect(MARGIN, y, CONTENT_WIDTH, height).fill(strong ? COLORS.olive : COLORS.ivory);
      doc
        .font(strong ? bold : medium)
        .fontSize(strong ? 12 : 9.5)
        .fillColor(strong ? COLORS.white : COLORS.ink)
        .text(cleanText(label), MARGIN + 12, y + (strong ? 12 : 11), {
          width: CONTENT_WIDTH - 180,
        });
      doc
        .font(bold)
        .fontSize(strong ? 16 : 10)
        .fillColor(strong ? COLORS.white : COLORS.ink)
        .text(formatMoney(amount, data.locale), PAGE_WIDTH - MARGIN - 150, y + (strong ? 10 : 11), {
          align: "right",
          width: 138,
        });
      if (hint) {
        doc.font(regular).fontSize(7.5).fillColor(strong ? "#E9EFE5" : COLORS.muted).text(cleanText(hint), MARGIN + 12, y + 34, {
          width: CONTENT_WIDTH - 24,
        });
      }
      doc.y = y + height;
    };

    const noteTextHeight = (value: string) => {
      doc.font(regular).fontSize(9);
      return doc.heightOfString(value, {
        lineGap: 2,
        width: CONTENT_WIDTH - 28,
      });
    };

    const fitTextLength = (value: string, maximumHeight: number) => {
      if (noteTextHeight(value) <= maximumHeight) return value.length;

      let low = 1;
      let high = value.length;
      let best = 1;
      while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        if (noteTextHeight(value.slice(0, middle)) <= maximumHeight) {
          best = middle;
          low = middle + 1;
        } else {
          high = middle - 1;
        }
      }

      if (best < value.length) {
        const candidate = value.slice(0, best);
        const wordBoundary = Math.max(candidate.lastIndexOf(" "), candidate.lastIndexOf("\n"));
        if (wordBoundary > Math.floor(best * 0.6)) best = wordBoundary;
      }
      return Math.max(1, best);
    };

    const drawFlowingNote = (rawNote: string) => {
      let remaining = cleanMultilineText(rawNote);
      let firstPage = true;

      while (remaining) {
        if (firstPage) {
          sectionTitle(copy.notes, 70);
        } else {
          addContinuationPage();
          sectionTitle(`${copy.notes} (${copy.continued})`, 70);
        }

        const maximumTextHeight = Math.max(24, CONTENT_BOTTOM - doc.y - 26);
        const fittedLength = fitTextLength(remaining, maximumTextHeight);
        const chunk = remaining.slice(0, fittedLength).trimEnd();
        const textHeight = noteTextHeight(chunk);
        const cardHeight = Math.max(46, textHeight + 26);
        const y = doc.y;

        doc.roundedRect(MARGIN, y, CONTENT_WIDTH, cardHeight, 7).fillAndStroke(COLORS.ivory, COLORS.line);
        doc.font(regular).fontSize(9).fillColor(COLORS.ink).text(chunk, MARGIN + 14, y + 13, {
          lineGap: 2,
          width: CONTENT_WIDTH - 28,
        });
        doc.y = y + cardHeight + 14;
        remaining = remaining.slice(fittedLength).trimStart();
        firstPage = false;
      }
    };

    addContinuationPage();
    doc.rect(0, 0, PAGE_WIDTH, 124).fill(COLORS.oliveDark);
    doc.rect(0, 120, PAGE_WIDTH, 4).fill(COLORS.wood);

    if (fs.existsSync(logoPath)) {
      doc.roundedRect(MARGIN, 23, 70, 76, 8).fill(COLORS.ivory);
      doc.image(logoPath, MARGIN + 10, 29, { fit: [50, 64], align: "center", valign: "center" });
    }
    doc.font(bold).fontSize(20).fillColor(COLORS.white).text(copy.documentTitle, 128, 28, {
      width: 420,
    });
    doc.font(medium).fontSize(8).fillColor("#E6ECE2").text(`${copy.reference}: ${cleanText(data.orderRef)}`, 128, 61, {
      width: 420,
    });
    doc.roundedRect(128, 79, 194, 22, 11).fill(COLORS.wood);
    doc.font(bold).fontSize(7).fillColor(COLORS.oliveDark).text(copy.documentBadge, 138, 86, {
      align: "center",
      lineBreak: false,
      width: 174,
    });
    doc.y = 145;

    if (housePreview) {
      const imageY = doc.y;
      doc.save();
      doc.roundedRect(MARGIN, imageY, CONTENT_WIDTH, 178, 10).clip();
      doc.image(housePreview, MARGIN, imageY, { height: 178, width: CONTENT_WIDTH });
      doc.restore();
      doc.save();
      doc.fillOpacity(0.86).roundedRect(MARGIN + 12, imageY + 145, 174, 21, 10).fill(COLORS.ink);
      doc.restore();
      doc.font(medium).fontSize(7.2).fillColor(COLORS.white).text(copy.imageDisclaimer, MARGIN + 22, imageY + 152, {
        lineBreak: false,
        width: 154,
      });
      doc.y = imageY + 194;
    }

    const cardGap = 12;
    const cardWidth = (CONTENT_WIDTH - cardGap) / 2;
    const address = `${data.delivery.streetAddress}, ${data.delivery.zipCode} ${data.delivery.city}, ${data.delivery.stateRegion}, ${data.delivery.country}`;
    const customerRows: Array<[string, string]> = [
      [copy.name, data.customer.name],
      [copy.email, data.customer.email],
      [copy.phone, data.customer.phone],
    ];
    const projectRows: Array<[string, string]> = [
      [copy.model, data.house.name],
      [copy.structure, data.house.structureSize],
      [copy.address, address],
    ];
    const cardsHeight = Math.max(
      measureInfoCardHeight(customerRows, cardWidth),
      measureInfoCardHeight(projectRows, cardWidth)
    );
    ensureSpace(cardsHeight + 16);
    const cardsY = doc.y;
    drawInfoCard(
      copy.customer,
      customerRows,
      MARGIN,
      cardsY,
      cardWidth,
      cardsHeight
    );
    drawInfoCard(
      copy.project,
      projectRows,
      MARGIN + cardWidth + cardGap,
      cardsY,
      cardWidth,
      cardsHeight
    );
    doc.y = cardsY + cardsHeight + 16;

    sectionTitle(copy.surfaces, 76);
    drawSurfaceCards();

    sectionTitle(copy.configuration, 74);
    drawTableHeader();
    let rowIndex = 0;
    drawTableRow(
      copy.baseStructure,
      `${data.house.name} (${data.house.structureSize})`,
      "",
      data.pricing.baseStructure,
      rowIndex++
    );
    for (const option of data.options) {
      drawTableRow(
        option.categoryLabel,
        option.optionLabel,
        "",
        option.totalPrice,
        rowIndex++
      );
    }
    drawTableRow(
      copy.transport,
      copy.transportDescription(data.pricing.truckCount),
      "",
      data.pricing.transport,
      rowIndex++
    );
    drawTableRow(
      copy.assembly,
      data.pricing.installationMode === "ossa" ? copy.assemblyOssa : copy.assemblyProfessional,
      "",
      data.pricing.assembly,
      rowIndex++
    );
    drawSummaryRow(copy.optionsSubtotal, data.pricing.optionsTotal);
    drawSummaryRow(copy.configurationSubtotal, data.pricing.configurationSubtotal);
    drawSummaryRow(copy.total, data.pricing.grandTotal, true, copy.exclVat);
    doc.y += 14;

    if (data.delivery.notes) {
      drawFlowingNote(data.delivery.notes);
    }

    const declarations = [
      data.agreements.text.shipping,
      data.agreements.text.terms,
      data.agreements.text.urban,
      data.agreements.text.privacy,
    ];
    doc.font(regular).fontSize(8.2);
    const declarationIntroHeight = doc.heightOfString(copy.declarationsIntro, {
      width: CONTENT_WIDTH,
    });
    doc.font(regular).fontSize(8.4);
    const firstDeclarationHeight = Math.max(
      30,
      doc.heightOfString(declarations[0], { width: CONTENT_WIDTH - 98 }) + 16
    );
    sectionTitle(copy.declarations, declarationIntroHeight + 12 + firstDeclarationHeight);
    const declarationIntroY = doc.y;
    doc.font(regular).fontSize(8.2).fillColor(COLORS.muted).text(copy.declarationsIntro, MARGIN, declarationIntroY, {
      width: CONTENT_WIDTH,
    });
    doc.y = declarationIntroY + declarationIntroHeight + 12;
    for (const declaration of declarations) {
      doc.font(regular).fontSize(8.4);
      const rowHeight = Math.max(
        30,
        doc.heightOfString(declaration, { width: CONTENT_WIDTH - 98 }) + 16
      );
      if (doc.y + rowHeight + 5 > CONTENT_BOTTOM) {
        addContinuationPage();
        sectionTitle(`${copy.declarations} (${copy.continued})`, rowHeight + 5);
      }
      const y = doc.y;
      doc.roundedRect(MARGIN, y, CONTENT_WIDTH, rowHeight, 5).fill(COLORS.softGreen);
      doc.font(bold).fontSize(7.2).fillColor(COLORS.oliveDark).text(copy.accepted, MARGIN + 10, y + 9, {
        lineBreak: false,
        width: 72,
      });
      doc.font(regular).fontSize(8.4).fillColor(COLORS.ink).text(declaration, MARGIN + 88, y + 8, {
        width: CONTENT_WIDTH - 98,
      });
      doc.y = y + rowHeight + 5;
    }
    const agreementSummary = `${copy.submitted}: ${formatDate(data.agreements.acceptedAt, data.locale)} | Version: ${cleanText(data.agreements.version)}`;
    doc.font(regular).fontSize(7.5);
    const agreementSummaryHeight = doc.heightOfString(agreementSummary, { width: CONTENT_WIDTH });
    ensureSpace(agreementSummaryHeight + 14);
    const agreementSummaryY = doc.y;
    doc.font(regular).fontSize(7.5).fillColor(COLORS.muted).text(
      agreementSummary,
      MARGIN,
      agreementSummaryY + 2,
      { width: CONTENT_WIDTH }
    );
    doc.y = agreementSummaryY + agreementSummaryHeight + 14;

    doc.font(regular).fontSize(9);
    const nextStepsHeight = Math.max(
      58,
      doc.heightOfString(copy.nextStepsText, { lineGap: 2, width: CONTENT_WIDTH - 28 }) + 26
    );
    sectionTitle(copy.nextSteps, nextStepsHeight);
    let y = doc.y;
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, nextStepsHeight, 7).fillAndStroke(COLORS.softBlue, COLORS.line);
    doc.font(regular).fontSize(9).fillColor(COLORS.ink).text(copy.nextStepsText, MARGIN + 14, y + 13, {
      lineGap: 2,
      width: CONTENT_WIDTH - 28,
    });
    doc.y = y + nextStepsHeight + 14;

    doc.font(regular).fontSize(8.2).lineGap(2);
    const disclaimerHeight = Math.max(
      60,
      doc.heightOfString(copy.disclaimer, { lineGap: 2, width: CONTENT_WIDTH - 28 }) + 26
    );
    sectionTitle(copy.disclaimerTitle, disclaimerHeight);
    y = doc.y;
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, disclaimerHeight, 7).fillAndStroke("#FFF8E8", "#E8D6A8");
    doc.font(regular).fontSize(8.2).fillColor(COLORS.ink).text(copy.disclaimer, MARGIN + 14, y + 13, {
      lineGap: 2,
      width: CONTENT_WIDTH - 28,
    });
    doc.y = y + disclaimerHeight + 12;

    const contactLine = `OSSA BOIS FRANCE | 50 rue Chanzy, 28000 Chartres | ${cleanText(data.contactEmail)} | ossaboisfrance.com`;
    doc.font(medium).fontSize(7.5);
    const contactHeight = doc.heightOfString(contactLine, { align: "center", width: CONTENT_WIDTH });
    ensureSpace(contactHeight + 16);
    y = doc.y;
    doc.font(medium).fontSize(7.5).fillColor(COLORS.muted).text(
      contactLine,
      MARGIN,
      y + 2,
      { align: "center", width: CONTENT_WIDTH }
    );

    const pages = doc.bufferedPageRange();
    for (let pageIndex = 0; pageIndex < pages.count; pageIndex += 1) {
      doc.switchToPage(pageIndex);
      // Footer text intentionally lives inside the reserved bottom margin.
      // PDFKit's text flow otherwise interprets it as overflow and silently
      // appends footer-only pages while the document is being finalized.
      const originalBottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      doc.moveTo(MARGIN, PAGE_HEIGHT - 45).lineTo(PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 45).strokeColor(COLORS.line).stroke();
      doc.font(regular).fontSize(7.5).fillColor(COLORS.muted).text(
        `Ossa Bois France | ${cleanText(data.orderRef)}`,
        MARGIN,
        PAGE_HEIGHT - 34,
        { lineBreak: false, width: 260 }
      );
      doc.text(`${copy.page} ${pageIndex + 1} / ${pages.count}`, PAGE_WIDTH - MARGIN - 120, PAGE_HEIGHT - 34, {
        align: "right",
        lineBreak: false,
        width: 120,
      });
      doc.page.margins.bottom = originalBottomMargin;
    }

    doc.end();
  });
}
