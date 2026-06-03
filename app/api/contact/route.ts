import { NextRequest, NextResponse } from "next/server";
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
import {
  escapeHtml,
  getResendAdminEmail,
  sendResendMail,
} from "@/lib/resend-mail";

const SUBJECT_LABELS: Record<string, string> = {
  devis: "Demande d'étude & devis de maison",
  info: "Demande d'informations techniques",
  visite: "Visite de l'usine de préfabrication",
  b2b: "Partenariat B2B",
  autre: "Autre demande",
};

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = await checkRateLimitAsync(`contact:${ip}`, 8, 15 * 60 * 1000);
  if (!limited.allowed) {
    return rateLimitResponse(limited.retryAfterSec);
  }

  try {
    const body = await req.json();
    if (isHoneypotTriggered(body.website)) {
      return NextResponse.json({ success: true });
    }

    const firstname = sanitizeText(body.firstname, 80);
    const lastname = sanitizeText(body.lastname, 80);
    const email = sanitizeText(body.email, 254);
    const phone = sanitizeText(body.phone, 40);
    const subject = sanitizeText(body.subject, 32);
    const message = sanitizeText(body.message, 8000);
    const locale = sanitizeText(body.locale, 8) || "fr";

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

    const adminEmail = getResendAdminEmail();
    if (!adminEmail) {
      if (process.env.NODE_ENV === "production") {
        console.error("[Contact] RESEND_ADMIN_EMAIL is required in production.");
        return NextResponse.json(
          { success: false, error: "Email service unavailable." },
          { status: 503 }
        );
      }
      console.log("[Contact] Dev — no RESEND_ADMIN_EMAIL:", {
        fullName: `${firstname} ${lastname}`,
        email,
        subject,
        message,
      });
      return NextResponse.json({ success: true });
    }

    const subjectLabel = SUBJECT_LABELS[subject] || subject;
    const fullName = `${firstname} ${lastname}`;

    const html = `
      <h2>Nouveau message — Formulaire contact</h2>
      <p><strong>Nom:</strong> ${escapeHtml(fullName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Téléphone:</strong> ${escapeHtml(phone || "—")}</p>
      <p><strong>Sujet:</strong> ${escapeHtml(subjectLabel)}</p>
      <p><strong>Langue:</strong> ${escapeHtml(locale)}</p>
      <hr />
      <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
    `;

    const sent = await sendResendMail({
      to: adminEmail,
      subject: `[Contact] ${subjectLabel} — ${fullName}`,
      html,
      idempotencyKey: `contact/${email}/${Date.now().toString(36)}`,
    });

    if (!sent.ok) {
      if (!process.env.RESEND_API_KEY) {
        console.log("[Contact] Dev mode — message logged:", { fullName, email, subjectLabel, message });
        return NextResponse.json({ success: true });
      }
      return NextResponse.json(
        { success: false, error: sent.error },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Contact API]", err);
    return NextResponse.json(
      { success: false, error: "Failed to process request." },
      { status: 500 }
    );
  }
}
