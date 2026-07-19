export type ResendAttachment = {
  filename: string;
  content: string;
};

export type ResendMailParams = {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: ResendAttachment[];
  idempotencyKey?: string;
  from?: string;
  replyTo?: string | string[];
};

export function getResendFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || "Ossa Bois <info@ossaboisfrance.com>";
}

/** Sender used specifically for order/checkout emails. */
export function getResendOrderFromEmail(): string {
  return process.env.RESEND_ORDER_FROM_EMAIL || "Ossa Bois <order@ossaboisfrance.com>";
}

/** Admin inbox for inbound leads. Required in production. */
export function getResendAdminEmail(): string | undefined {
  return process.env.RESEND_ADMIN_EMAIL?.trim() || undefined;
}

export async function sendResendMail(
  params: ResendMailParams
): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Resend] RESEND_API_KEY missing — email not sent:", params.subject);
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
      body: JSON.stringify({
        from: params.from || getResendFromEmail(),
        to: params.to,
        reply_to: params.replyTo,
        subject: params.subject,
        html: params.html,
        attachments: params.attachments,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[Resend] send failed:", errorText);
      return { ok: false, error: "Failed to send email." };
    }

    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id };
  } catch (error) {
    // Checkout orders may already be persisted when delivery is attempted.
    // Convert DNS/timeout/response parsing failures into a result so callers can
    // report a notification warning without returning 500 and inviting a
    // duplicate order retry.
    console.error("[Resend] transport failure:", error);
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
