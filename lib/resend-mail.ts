export type ResendAttachment = {
  filename: string;
  content: string;
};

export type ResendMailParams = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: ResendAttachment[];
  idempotencyKey?: string;
  from?: string;
  replyTo?: string | string[];
  event?: ResendMailEvent;
};

export type ResendMailEvent =
  | "checkout-admin"
  | "checkout-client"
  | "contact-admin"
  | "contact-client"
  | "b2b-admin"
  | "b2b-client"
  | "password-reset"
  | "password-changed"
  | "transactional";

export function getResendFromName(): string {
  return process.env.RESEND_FROM_NAME?.trim() || "Ossa Bois France";
}

export function getResendFromAddress(): string {
  return process.env.RESEND_FROM_ADDRESS?.trim() || "info@ossaboisfrance.com";
}

export function getResendFromEmail(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    `${getResendFromName()} <${getResendFromAddress()}>`
  );
}

/** Sender used specifically for order/checkout emails. */
export function getResendOrderFromEmail(): string {
  const address =
    process.env.RESEND_ORDER_FROM_ADDRESS?.trim() || "order@ossaboisfrance.com";
  return (
    process.env.RESEND_ORDER_FROM_EMAIL?.trim() ||
    `${getResendFromName()} <${address}>`
  );
}

/** Sender used for professional/B2B enquiries. */
export function getResendB2BFromEmail(): string {
  return (
    process.env.RESEND_B2B_FROM_EMAIL?.trim() ||
    `${getResendFromName()} <b2b@ossaboisfrance.com>`
  );
}

/** Address-only sender required by Payload's Resend adapter. */
export function getResendAuthFromAddress(): string {
  return (
    process.env.RESEND_AUTH_FROM_ADDRESS?.trim() ||
    "security@ossaboisfrance.com"
  );
}

/** Branded sender used by account security notifications. */
export function getResendAuthFromEmail(): string {
  return `${getResendFromName()} <${getResendAuthFromAddress()}>`;
}

/** Admin inbox for inbound leads. Required in production. */
export function getResendAdminEmail(): string | undefined {
  return process.env.RESEND_ADMIN_EMAIL?.trim() || undefined;
}

/**
 * Monitored mailbox that receives direct replies. Sender aliases do not need a
 * mailbox, but Reply-To must point to one that the team can actually access.
 */
export function getResendReplyToEmail(): string | undefined {
  return process.env.RESEND_REPLY_TO_EMAIL?.trim() || getResendAdminEmail();
}

export async function sendResendMail(
  params: ResendMailParams
): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  const event = params.event || "transactional";
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn(`[Resend] ${event}: API key missing; message not sent.`);
    return { ok: false, error: "Email service not configured." };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (params.idempotencyKey) {
    headers["Idempotency-Key"] = params.idempotencyKey.slice(0, 256);
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        from: params.from || getResendFromEmail(),
        to: params.to,
        reply_to: params.replyTo,
        subject: params.subject,
        html: params.html,
        text: params.text,
        attachments: params.attachments,
      }),
    });

    if (!res.ok) {
      // Do not log Resend's response body: it can echo message metadata or
      // recipient details. A stable event name and status are sufficient for
      // diagnosis without leaking PII.
      console.error(
        `[Resend] ${event}: provider request failed (HTTP ${res.status}).`
      );
      return { ok: false, error: "Failed to send email." };
    }

    let data: { id?: string } = {};
    try {
      data = (await res.json()) as { id?: string };
    } catch {
      // The provider accepted the message; the optional receipt ID is not
      // required for the delivery attempt to be considered successful.
    }
    return { ok: true, id: data.id };
  } catch (error: unknown) {
    // Checkout orders may already be persisted when delivery is attempted.
    // Convert DNS/timeout/response parsing failures into a result so callers can
    // report a notification warning without returning 500 and inviting a
    // duplicate order retry.
    const isTimeout =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");
    console.error(
      `[Resend] ${event}: ${isTimeout ? "request timed out" : "transport failure"}.`
    );
    return { ok: false, error: "Email service is temporarily unavailable." };
  }
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
