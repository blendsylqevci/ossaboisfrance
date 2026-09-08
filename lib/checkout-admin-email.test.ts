import assert from "node:assert/strict";
import test from "node:test";
import { buildCheckoutAdminEmail, getOrderRequestContext, type AdminOrderEmailData } from "./checkout-admin-email.ts";

test("order metadata uses platform headers only and validates IP addresses", () => {
  const headers = new Headers({ "x-real-ip": "203.0.113.7", "x-forwarded-for": "6.6.6.6", "x-vercel-ip-city": "Saint-%C3%89tienne", "x-vercel-ip-country-region": "ARA", "x-vercel-ip-country": "FR" });
  assert.equal(getOrderRequestContext(headers, true).ip, "203.0.113.7");
  assert.equal(getOrderRequestContext(headers, true).location, "Saint-Étienne · ARA · FR");
  assert.equal(getOrderRequestContext(headers, false).ip, "Non disponible");
  assert.equal(getOrderRequestContext(headers, false).location, "Non disponible");
  headers.set("x-real-ip", "invalid");
  assert.equal(getOrderRequestContext(headers, true).ip, "Non disponible");
  headers.set("x-real-ip", "2001:db8::1");
  assert.equal(getOrderRequestContext(headers, true).ip, "2001:db8::1");
});
test("missing and malformed metadata are handled without guessing", () => {
  const empty = getOrderRequestContext(new Headers(), true);
  assert.equal(empty.device, "Non disponible");
  assert.equal(empty.location, "Non disponible");
  assert.equal(empty.browser, "Non disponible");
  const malformed = getOrderRequestContext(new Headers({ "x-vercel-ip-city": "%ZZ", "x-vercel-ip-country": "not-country" }), true);
  assert.equal(malformed.location, "Non disponible");
  assert.equal(getOrderRequestContext(new Headers({ "x-forwarded-for": "1.2.3.4" }), true).ip, "Non disponible");
});
test("device and browser inference handles phones, tablets, desktop and automation", () => {
  const cases = [
    ["Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Mobile/15 Safari/604.1", "Téléphone", "Safari", "iOS / iPadOS"],
    ["Mozilla/5.0 (Linux; Android 14) Chrome/120.0 Mobile Safari/537.36", "Téléphone", "Chrome", "Android"],
    ["Mozilla/5.0 (Linux; Android 14) Chrome/120.0 Safari/537.36", "Tablette", "Chrome", "Android"],
    ["Mozilla/5.0 (iPad; CPU OS 17_0) Version/17.0 Mobile Safari/604.1", "Tablette", "Safari", "iOS / iPadOS"],
    ["Mozilla/5.0 (Windows NT 10.0) Chrome/120.0 Safari/537.36 Edg/120.0", "Ordinateur", "Microsoft Edge", "Windows"],
    ["Mozilla/5.0 (Macintosh; Intel Mac OS X) Firefox/120.0", "Ordinateur", "Firefox", "macOS"],
    ["HeadlessChrome/120 bot", "Automatisation possible", "Chrome", "Non disponible"],
  ];
  for (const [ua, device, browser, os] of cases) {
    const result = getOrderRequestContext(new Headers({ "user-agent": ua }), false);
    assert.deepEqual([result.device, result.browser, result.os], [device, browser, os]);
  }
});
export const exampleOrder: AdminOrderEmailData = {
  reference: "OB-DEMO-ADMIN",
  submittedAt: "2026-09-08T12:00:00Z",
  locale: "fr",
  customer: { name: "Alex Martin", email: "client@example.com", phone: "+33600000000" },
  delivery: { streetAddress: "12 rue des Jardins", zipCode: "28000", city: "Chartres", stateRegion: "Centre-Val de Loire", country: "France", notes: "Accès par le portail principal." },
  house: { name: "Maison Horizon", structure: "60 × 200 mm" },
  surfaces: { net: 95, gross: 110, walls: 175, roof: 128 },
  options: [{ categoryLabel: "Isolation", optionLabel: "Fibre de bois", formattedCalculation: "175 m² × 28,23 € HT/m²", totalPrice: 4940.25 }],
  pricing: { base: 18700, options: 4940.25, subtotal: 23640.25, trucks: 2, transport: 7000, assembly: 6500, total: 37140.25 },
  assemblyDescription: "Montage réalisé par Ossa Bois",
  agreementVersion: "2026-09-08",
  request: { ip: "203.0.113.7", location: "Paris · IDF · FR", device: "Téléphone", browser: "Safari", os: "iOS / iPadOS" },
  pdfAttached: true,
};
test("admin email renders detailed budget, internal context and attachment truthfully", () => {
  const result = buildCheckoutAdminEmail(exampleOrder);
  for (const text of ["Fibre de bois", "28,23", "203.0.113.7", "Paris · IDF · FR", "Téléphone", "Safari", "Joint à cet e-mail", "GPS", "CONFIDENTIEL", "2026-09-08"]) assert.ok(result.includes(text), text);
  assert.ok(result.includes("37&#") || result.includes("37 140,25"));
  assert.ok(buildCheckoutAdminEmail({ ...exampleOrder, pdfAttached: false }).includes("Non disponible — vérifier"));
});
test("admin template escapes user content and never renders a raw user agent", () => {
  const result = buildCheckoutAdminEmail({ ...exampleOrder, customer: { ...exampleOrder.customer, name: '<img src=x onerror="bad">' }, request: { ...exampleOrder.request, location: "<script>bad</script>" } });
  assert.ok(!result.includes("<script>"));
  assert.ok(!result.includes("<img src=x"));
  assert.ok(result.includes("&lt;script&gt;"));
  assert.ok(result.includes("&lt;img"));
});

