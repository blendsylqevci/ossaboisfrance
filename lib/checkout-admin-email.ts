import { isIP } from "node:net";

const unavailable = "Non disponible";
const html = (value: unknown): string => String(value ?? "").replace(/[&<>"']/g, char =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

export type OrderRequestContext = {
  ip: string;
  location: string;
  device: string;
  browser: string;
  os: string;
};

/** Operational metadata only: no GPS, raw UA, cookies, fingerprint or external lookup. */
export function getOrderRequestContext(
  headers: Headers,
  onVercel = process.env.VERCEL === "1",
): OrderRequestContext {
  const read = (name: string) => {
    const raw = (headers.get(name) || "").slice(0, 300);
    try { return decodeURIComponent(raw).replace(/[\u0000-\u001f\u007f]/g, "").trim(); }
    catch { return ""; }
  };
  const rawIp = onVercel
    ? (headers.get("x-real-ip") || headers.get("x-vercel-forwarded-for") || "").trim()
    : "";
  const ip = isIP(rawIp) ? rawIp : unavailable;
  const country = onVercel ? read("x-vercel-ip-country") : "";
  const validCountry = /^[A-Z]{2}$/.test(country) ? country : "";
  const location = onVercel
    ? [read("x-vercel-ip-city"), read("x-vercel-ip-country-region"), validCountry].filter(Boolean).join(" · ")
    : "";
  const ua = (headers.get("user-agent") || "").slice(0, 1024);
  const bot = /bot|crawler|spider|headless/i.test(ua);
  const device = bot ? "Automatisation possible"
    : /iPad|Tablet|Kindle|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) ? "Tablette"
    : /iPhone|iPod|Android.*Mobile|Windows Phone|Mobile/i.test(ua) || headers.get("sec-ch-ua-mobile") === "?1" ? "Téléphone"
    : /Windows NT|Macintosh|X11|CrOS/i.test(ua) ? "Ordinateur"
    : unavailable;
  const browser = /Edg(?:e|A|iOS)?\//i.test(ua) ? "Microsoft Edge"
    : /OPR\/|Opera/i.test(ua) ? "Opera"
    : /SamsungBrowser/i.test(ua) ? "Samsung Internet"
    : /Firefox|FxiOS/i.test(ua) ? "Firefox"
    : /Chrome|CriOS/i.test(ua) ? "Chrome"
    : /Safari/i.test(ua) ? "Safari" : unavailable;
  const os = /iPhone|iPad|iPod/i.test(ua) ? "iOS / iPadOS"
    : /Android/i.test(ua) ? "Android"
    : /Windows/i.test(ua) ? "Windows"
    : /CrOS/i.test(ua) ? "ChromeOS"
    : /Macintosh|Mac OS/i.test(ua) ? "macOS"
    : /Linux/i.test(ua) ? "Linux" : unavailable;
  return { ip, location: location || unavailable, device, browser, os };
}

export type AdminOrderEmailData = {
  reference: string;
  submittedAt: string;
  locale: string;
  customer: { name: string; email: string; phone: string };
  delivery: { streetAddress: string; zipCode: string; city: string; stateRegion: string; country: string; notes?: string };
  house: { name: string; structure: string };
  surfaces: { net: number; gross: number; walls: number; roof: number };
  options: Array<{ categoryLabel: string; optionLabel: string; formattedCalculation: string; totalPrice: number }>;
  pricing: { base: number; options: number; subtotal: number; trucks: number; transport: number; assembly: number; total: number };
  assemblyDescription: string;
  agreementVersion: string;
  request: OrderRequestContext;
  pdfAttached: boolean;
};

export function buildCheckoutAdminEmail(data: AdminOrderEmailData): string {
  const money = (amount: number) => html(new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount));
  const date = new Date(data.submittedAt);
  const submitted = Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Paris" }).format(date) + " (Paris)"
    : unavailable;
  const field = (label: string, value: unknown) => `<tr><th align="left" style="width:38%;padding:11px 12px;border-bottom:1px solid #E9E8E0;font-size:12px;color:#65705F;font-weight:400;vertical-align:top;">${html(label)}</th><td style="padding:11px 12px;border-bottom:1px solid #E9E8E0;font-size:13px;color:#283729;word-break:break-word;">${html(value || "Non communiqué")}</td></tr>`;
  const section = (title: string, content: string) => `<tr><td class="pad" style="padding:12px 32px 20px;"><h2 style="font-family:Georgia,serif;font-size:23px;font-weight:400;color:#304131;margin:0 0 16px;">${html(title)}</h2>${content}</td></tr>`;
  const fields = (rows: string) => `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #E3E2D8;table-layout:fixed;">${rows}</table>`;
  const item = (category: string, choice: string, calculation: string, total: number) => `<tr><td style="padding:13px 10px;border-bottom:1px solid #E9E8E0;vertical-align:top;"><strong style="font-size:13px;">${html(category)}</strong><div style="font-size:13px;color:#52604D;margin-top:5px;">${html(choice)}</div>${calculation ? `<div style="font-size:11px;color:#74806E;margin-top:5px;">${html(calculation)}</div>` : ""}</td><td align="right" style="padding:13px 10px;border-bottom:1px solid #E9E8E0;width:105px;vertical-align:top;font-size:13px;font-weight:700;">${money(total)}</td></tr>`;
  const address = [data.delivery.streetAddress, [data.delivery.zipCode, data.delivery.city].filter(Boolean).join(" "), data.delivery.stateRegion, data.delivery.country].filter(Boolean).join(" · ");
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nouveau projet — ${html(data.reference)}</title>
<style>table{border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0}td,th{overflow-wrap:anywhere}a{color:#43573C}@media(max-width:620px){.pad{padding-left:18px!important;padding-right:18px!important}.total{font-size:30px!important}}</style></head>
<body style="margin:0;padding:24px 10px;background:#F0EEE8;font-family:Arial,Helvetica,sans-serif;color:#283729;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Nouveau projet de ${html(data.customer.name)} · ${html(data.house.name)} · ${money(data.pricing.total)} HT</div>
<table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:white;border:1px solid #DDDCCF;">
<tr><td class="pad" style="padding:30px 32px;background:#303F32;border-top:4px solid #BAA47C;color:white;">
<div style="font-family:Georgia,serif;font-size:28px;letter-spacing:3px;">OSSA BOIS</div><div style="font-size:9px;letter-spacing:2px;color:#D7C6A7;margin-top:8px;">FRANCE · DOSSIER COMMERCIAL INTERNE</div>
<div style="border-top:1px solid #68735D;margin-top:22px;padding-top:16px;font-size:11px;letter-spacing:1px;">${html(data.reference)}</div></td></tr>
<tr><td class="pad" style="padding:28px 32px 22px;">
<div style="font-size:10px;color:#7D6B48;letter-spacing:2px;font-weight:700;">NOUVELLE DEMANDE · À EXAMINER</div>
<h1 style="font-family:Georgia,serif;font-size:32px;font-weight:400;margin:12px 0;color:#303F32;">Un nouveau projet vous attend.</h1>
<p style="font-size:14px;line-height:1.7;margin:0;color:#606C59;">${html(data.customer.name)} a transmis sa configuration <strong>${html(data.house.name)}</strong>. Vérifiez les choix et les conditions du chantier avant de préparer le devis définitif.</p>
<p style="font-size:11px;color:#7B8575;margin:14px 0 0;">Enregistré le ${html(submitted)} · Langue : ${html(data.locale.toUpperCase())}</p></td></tr>
<tr><td class="pad" style="padding:0 32px 24px;"><table role="presentation" width="100%"><tr><td style="padding:24px;background:#F4F3EC;border-left:3px solid #BAA47C;">
<div style="font-size:10px;letter-spacing:1px;color:#68765C;">ESTIMATION DU PROJET HORS TAXES</div><div class="total" style="font-family:Georgia,serif;font-size:38px;color:#303F32;margin:8px 0;">${money(data.pricing.total)}</div>
<div style="font-size:11px;line-height:1.6;color:#6B7464;">Montant calculé côté serveur · TVA non incluse<br>Demande de devis, sans confirmation de paiement ni acceptation contractuelle.</div></td></tr></table></td></tr>
${section("01 — Client & chantier", fields(
  field("Client", data.customer.name) + field("E-mail", data.customer.email) + field("Téléphone", data.customer.phone) +
  field("Adresse du chantier", address) + field("Notes du client", data.delivery.notes || "Aucune note") +
  field("Modèle / structure", data.house.name + " · " + data.house.structure)))}
${section("02 — Surfaces du projet", fields(
  field("Surface habitable", data.surfaces.net + " m²") + field("Surface brute", data.surfaces.gross + " m²") +
  field("Murs extérieurs", data.surfaces.walls + " m²") + field("Toiture", data.surfaces.roof + " m²")))}
${section("03 — Configuration & budget", `<table width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #E3E2D8;table-layout:fixed;"><tr style="background:#F4F3EC;"><th align="left" style="padding:12px 10px;font-size:10px;letter-spacing:1px;">CHOIX TECHNIQUES</th><th align="right" style="width:105px;padding:12px 10px;font-size:10px;">MONTANT HT</th></tr>
${item("Structure bois", data.house.structure, data.house.name, data.pricing.base)}
${data.options.map(option => item(option.categoryLabel, option.optionLabel, option.formattedCalculation, option.totalPrice)).join("")}
${item("Sous-total maison configurée", "Structure + options", "", data.pricing.subtotal)}
${item("Transport", data.pricing.trucks + " camion(s) × 3 500 € HT", "Prestation supplémentaire", data.pricing.transport)}
${item("Montage", data.assemblyDescription, "Prestation supplémentaire si retenue", data.pricing.assembly)}
<tr style="background:#303F32;color:white;"><td style="padding:16px 10px;font-weight:700;font-size:13px;">TOTAL ESTIMATIF HT</td><td align="right" style="padding:16px 10px;font-weight:700;font-size:14px;">${money(data.pricing.total)}</td></tr></table>`)}
${section("04 — Informations techniques de la demande", fields(
  field("Adresse IP", data.request.ip) + field("Localisation IP approximative", data.request.location) +
  field("Type de terminal estimé", data.request.device) + field("Navigateur estimé", data.request.browser) + field("Système estimé", data.request.os)) +
  '<p style="font-size:11px;line-height:1.7;color:#75806F;">Métadonnées de la requête ayant déclenché cet e-mail. La localisation IP peut correspondre à un VPN ou à un opérateur et ne constitue pas l’adresse du chantier. Le terminal est déduit des informations du navigateur et peut être inexact. Aucune géolocalisation GPS.</p>')}
${section("05 — Déclarations & documents", fields(
  field("Déclarations", "Livraison, conditions de vente, urbanisme et traitement des données : acceptés lors de la soumission") +
  field("Version des déclarations", data.agreementVersion) + field("Date d’acceptation", submitted) +
  field("PDF récapitulatif", data.pdfAttached ? "Joint à cet e-mail" : "Non disponible — vérifier le dossier dans l’administration"))) }
<tr><td class="pad" style="padding:4px 32px 28px;"><a href="mailto:${html(encodeURIComponent(data.customer.email))}" style="display:inline-block;background:#43573C;color:white;padding:14px 20px;text-decoration:none;font-size:13px;font-weight:700;">Contacter le client</a>
<p style="font-size:12px;line-height:1.7;color:#65705E;">À vérifier : accès des camions, faisabilité technique, choix de montage et conditions du devis. Le bouton « Répondre » de votre messagerie répond directement au client.</p></td></tr>
<tr><td class="pad" style="padding:20px 32px;background:#F7F6F1;border-top:1px solid #E3E2D8;font-size:10px;line-height:1.7;color:#7A8474;">CONFIDENTIEL · Réservé aux personnes autorisées d’Ossa Bois France. Les coordonnées et métadonnées techniques servent au suivi de cette demande et à la prévention des abus. Ne pas diffuser ce message en dehors de l’équipe concernée.</td></tr>
</table></body></html>`;
}

