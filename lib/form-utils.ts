const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim()) && email.length <= 254;
}

export function sanitizeText(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

/** Hidden honeypot field — bots often fill this. */
export function isHoneypotTriggered(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export const CONTACT_SUBJECTS = new Set([
  "devis",
  "info",
  "visite",
  "b2b",
  "autre",
]);

export const B2B_INQUIRY_TYPES = new Set([
  "cnc",
  "architecture",
  "kit",
  "montage",
  "autre",
]);
