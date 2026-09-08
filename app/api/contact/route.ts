import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { buildLeadAcknowledgementEmail } from "@/lib/email-templates";
import {
  CONTACT_SUBJECTS,
  isHoneypotTriggered,
  isValidEmail,
  sanitizeText,
} from "@/lib/form-utils";
import {
  checkRateLimitAsync,
  getClientIp,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { isLocale, type Locale } from "@/lib/i18n";
import { createRecipientRateLimitKey } from "@/lib/public-form-rate-limit";
import {
  PRIVACY_POLICY_VERSION,
  checkDeclaredRequestSize,
  isPrivacyAccepted,
} from "@/lib/public-form-security";
import {
  escapeHtml,
  getResendAdminEmail,
  getResendReplyToEmail,
  sendResendMail,
} from "@/lib/resend-mail";

const SUBJECT_LABELS: Record<string, string> = {
  devis: "Demande d'étude & devis de maison",
  info: "Demande d'informations techniques",
  visite: "Visite de l'usine de préfabrication",
  b2b: "Partenariat B2B",
  autre: "Autre demande",
};

const MAX_CONTACT_REQUEST_BYTES = 32 * 1024;
const MAX_RECIPIENT_ACKNOWLEDGEMENTS = 4;
const RECIPIENT_ACKNOWLEDGEMENT_WINDOW_MS = 60 * 60 * 1000;

function normalizeLocale(value: string): Locale {
  return isLocale(value) ? value : "fr";
}

function createRequestReference(values: string[]): string {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const secret =
    process.env.PAYLOAD_SECRET ||
    process.env.RESEND_API_KEY ||
    "ossabois-contact-reference-development";
  const digest = createHmac("sha256", secret)
    .update(JSON.stringify(["contact-v1", day, ...values]))
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();

  return `CNT-${day}-${digest}`;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = await checkRateLimitAsync(`contact:${ip}`, 8, 15 * 60 * 1000);
  if (!limited.allowed) {
    return rateLimitResponse(limited.retryAfterSec);
  }

  // This rejects a declared oversized body before parsing. A missing/chunked
  // length still depends on the hosting proxy; the strict field limits below
  // bound what the application retains after JSON parsing.
  const declaredSize = checkDeclaredRequestSize(
    req.headers.get("content-length"),
    MAX_CONTACT_REQUEST_BYTES
  );
  if (declaredSize.status === "invalid") {
    return NextResponse.json(
      { success: false, error: "Invalid Content-Length." },
      { status: 400 }
    );
  }
  if (declaredSize.status === "too-large") {
    return NextResponse.json(
      { success: false, error: "Request body too large." },
      { status: 413 }
    );
  }

  try {
    let body: Record<string, unknown>;
    try {
      const parsed: unknown = await req.json();
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return NextResponse.json(
          { success: false, error: "Invalid JSON body." },
          { status: 400 }
        );
      }
      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    if (isHoneypotTriggered(body.website)) {
      return NextResponse.json({ success: true });
    }

    const firstname = sanitizeText(body.firstname, 80, { singleLine: true });
    const lastname = sanitizeText(body.lastname, 80, { singleLine: true });
    const email = sanitizeText(body.email, 254, { singleLine: true });
    const phone = sanitizeText(body.phone, 40, { singleLine: true });
    const subject = sanitizeText(body.subject, 32, { singleLine: true });
    const message = sanitizeText(body.message, 8000);
    const locale = normalizeLocale(
      sanitizeText(body.locale, 8, { singleLine: true }) || "fr"
    );

    if (!firstname || !lastname || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address." },
        { status: 400 }
      );
    }

    if (!CONTACT_SUBJECTS.has(subject)) {
      return NextResponse.json(
        { success: false, error: "Invalid subject." },
        { status: 400 }
      );
    }

    if (!isPrivacyAccepted(body.privacyAccepted)) {
      return NextResponse.json(
        { success: false, error: "Privacy acceptance is required." },
        { status: 400 }
      );
    }

    const subjectLabel = SUBJECT_LABELS[subject] || subject;
    const fullName = `${firstname} ${lastname}`;
    const reference = createRequestReference([
      firstname,
      lastname,
      email.toLowerCase(),
      phone,
      subject,
      message,
      locale,
      PRIVACY_POLICY_VERSION,
    ]);
    const adminEmail = getResendAdminEmail();
    const replyToEmail =
      getResendReplyToEmail() || "info@ossaboisfrance.com";
    if (!adminEmail) {
      if (process.env.NODE_ENV === "production") {
        console.error("[Contact] RESEND_ADMIN_EMAIL is required in production.");
        return NextResponse.json(
          { success: false, error: "Email service unavailable." },
          { status: 503 }
        );
      }
      console.warn("[Contact] Email service unavailable in development.", {
        reference,
      });
      return NextResponse.json({
        success: true,
        confirmationSent: false,
        reference,
      });
    }

    const html = `
      <h2>Nouveau message — Formulaire contact</h2>
      <p><strong>Référence:</strong> ${escapeHtml(reference)}</p>
      <p><strong>Nom:</strong> ${escapeHtml(fullName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Téléphone:</strong> ${escapeHtml(phone || "—")}</p>
      <p><strong>Sujet:</strong> ${escapeHtml(subjectLabel)}</p>
      <p><strong>Langue:</strong> ${escapeHtml(locale)}</p>
      <p><strong>Confidentialité:</strong> acceptée — version ${escapeHtml(PRIVACY_POLICY_VERSION)}</p>
      <hr />
      <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
    `;

    const sent = await sendResendMail({
      to: adminEmail,
      subject: `[Contact] ${subjectLabel} — ${reference}`,
      html,
      replyTo: email,
      idempotencyKey: `contact-admin/${reference}`,
      event: "contact-admin",
    });

    if (!sent.ok) {
      if (
        !process.env.RESEND_API_KEY &&
        process.env.NODE_ENV !== "production"
      ) {
        console.warn("[Contact] Email not sent in development.", { reference });
        return NextResponse.json({
          success: true,
          confirmationSent: false,
          reference,
        });
      }
      return NextResponse.json(
        { success: false, error: sent.error },
        { status: 502 }
      );
    }

    const acknowledgement = buildLeadAcknowledgementEmail({
      kind: "contact",
      locale,
      name: firstname,
      reference,
    });
    const recipientLimit = await checkRateLimitAsync(
      createRecipientRateLimitKey("contact", email),
      MAX_RECIPIENT_ACKNOWLEDGEMENTS,
      RECIPIENT_ACKNOWLEDGEMENT_WINDOW_MS
    );
    if (!recipientLimit.allowed) {
      return NextResponse.json({
        success: true,
        confirmationSent: false,
        reference,
      });
    }

    const confirmation = await sendResendMail({
      to: email,
      subject: acknowledgement.subject,
      html: acknowledgement.html,
      replyTo: replyToEmail,
      idempotencyKey: `contact-client/${reference}`,
      event: "contact-client",
    });

    return NextResponse.json({
      success: true,
      confirmationSent: confirmation.ok,
      reference,
    });
  } catch (err) {
    console.error("[Contact API] Failed to process request.");
    void err;
    return NextResponse.json(
      { success: false, error: "Failed to process request." },
      { status: 500 }
    );
  }
}
