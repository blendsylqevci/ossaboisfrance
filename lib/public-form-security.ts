export const CONTACT_EMAIL_PREFILL_STORAGE_KEY =
  "ossabois:contact-email-prefill:v1";

export const PRIVACY_ACCEPTED_VALUE = "accepted";
export const PRIVACY_POLICY_VERSION = "2026-09-08";

/**
 * The JSON contact route sends a boolean while multipart forms send a string.
 * Accept only those two deliberate representations; generic truthiness would
 * incorrectly accept values such as "false".
 */
export function isPrivacyAccepted(value: unknown): boolean {
  return value === true || value === PRIVACY_ACCEPTED_VALUE;
}

export type DeclaredRequestSize =
  | { status: "missing" }
  | { status: "invalid" }
  | { status: "ok"; bytes: number }
  | { status: "too-large" };

/**
 * Fail-fast validation for a declared HTTP Content-Length. This is not a
 * streaming byte counter: a missing length must still be bounded by the
 * hosting proxy and authoritative post-parse checks.
 */
export function checkDeclaredRequestSize(
  rawContentLength: string | null,
  maxBytes: number
): DeclaredRequestSize {
  if (rawContentLength === null) return { status: "missing" };
  if (!/^\d+$/.test(rawContentLength)) return { status: "invalid" };

  const bytes = Number(rawContentLength);
  if (!Number.isSafeInteger(bytes)) return { status: "too-large" };
  if (bytes > maxBytes) return { status: "too-large" };
  return { status: "ok", bytes };
}

/** PDF files must begin with the canonical `%PDF-` header. */
export function hasPdfSignature(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}
