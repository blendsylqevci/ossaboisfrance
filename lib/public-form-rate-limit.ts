import { createHmac } from "node:crypto";

type PublicFormScope = "contact" | "b2b";

/**
 * Produce a stable Redis-safe recipient bucket without placing an email address
 * (PII) in cache keys or logs. Production already requires PAYLOAD_SECRET.
 */
export function createRecipientRateLimitKey(
  scope: PublicFormScope,
  email: string
): string {
  const secret =
    process.env.PAYLOAD_SECRET?.trim() ||
    process.env.RESEND_API_KEY?.trim() ||
    "ossabois-public-form-rate-limit-development";
  const normalizedEmail = email.trim().toLowerCase();
  const digest = createHmac("sha256", secret)
    .update(`recipient-v1\0${normalizedEmail}`)
    .digest("hex");

  return `${scope}:recipient:${digest}`;
}
