const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim()) && email.length <= 254;
}

// C0/C1 control characters (keeping \t \x09 and \n \x0A, which are legitimate in
// message bodies; \r \x0D is handled separately below) plus Unicode bidi
// overrides and zero-width characters commonly used to spoof how text renders
// in an email client.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;
const SPOOF_CHARS = /[\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF]/g;

/**
 * Trim, strip dangerous control/bidi characters, and clamp to maxLen.
 * Pass `{ singleLine: true }` for fields that must never contain line breaks
 * (names, subjects) so they cannot inject misleading multi-line content into
 * notification emails.
 */
export function sanitizeText(
  value: unknown,
  maxLen: number,
  opts?: { singleLine?: boolean }
): string {
  if (typeof value !== "string") return "";
  let out = value.replace(CONTROL_CHARS, "").replace(SPOOF_CHARS, "");
  if (opts?.singleLine) {
    out = out.replace(/[\r\n\t]+/g, " ");
  } else {
    out = out.replace(/\r/g, "");
  }
  return out.trim().slice(0, maxLen);
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
