import { NextRequest, NextResponse } from "next/server";
import {
  B2B_INQUIRY_TYPES,
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
  type ResendAttachment,
} from "@/lib/resend-mail";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".zip",
  ".rar",
  ".dwg",
  ".dxf",
]);

const INQUIRY_LABELS: Record<string, string> = {
  cnc: "Découpe CNC & Charpente",
  architecture: "Bureau d'études & Architecture",
  kit: "Fabrication de Kit",
  montage: "Construction & Montage complet",
  autre: "Autre type de projet",
};

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = await checkRateLimitAsync(`b2b:${ip}`, 5, 15 * 60 * 1000);
  if (!limited.allowed) {
    return rateLimitResponse(limited.retryAfterSec);
  }

  try {
    const formData = await req.formData();

    if (isHoneypotTriggered(formData.get("website"))) {
      return NextResponse.json({ success: true });
    }

    const inquiryType = sanitizeText(formData.get("inquiryType"), 32, { singleLine: true });
    const firstname = sanitizeText(formData.get("firstname"), 80, { singleLine: true });
    const lastname = sanitizeText(formData.get("lastname"), 80, { singleLine: true });
    const email = sanitizeText(formData.get("email"), 254, { singleLine: true });
    const phone = sanitizeText(formData.get("phone"), 40, { singleLine: true });
    const message = sanitizeText(formData.get("message"), 8000);
    const locale = sanitizeText(formData.get("locale"), 8, { singleLine: true }) || "fr";

    if (!inquiryType || !firstname || !lastname || !email || !phone || !message) {
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

    if (!B2B_INQUIRY_TYPES.has(inquiryType)) {
      return NextResponse.json(
        { success: false, error: "Invalid inquiry type." },
        { status: 400 }
      );
    }

    const adminEmail = getResendAdminEmail();
    if (!adminEmail) {
      if (process.env.NODE_ENV === "production") {
        console.error("[B2B] RESEND_ADMIN_EMAIL is required in production.");
        return NextResponse.json(
          { success: false, error: "Email service unavailable." },
          { status: 503 }
        );
      }
      console.log("[B2B] Dev — no RESEND_ADMIN_EMAIL:", {
        fullName: `${firstname} ${lastname}`,
        email,
        inquiryType,
        message,
      });
      return NextResponse.json({ success: true });
    }

    const attachments: ResendAttachment[] = [];
    const file = formData.get("file");
    if (file && file instanceof File && file.size > 0) {
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { success: false, error: "File too large (max 10 MB)." },
          { status: 400 }
        );
      }

      const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return NextResponse.json(
          { success: false, error: "File type not allowed." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({
        filename: file.name.replace(/[^\w.\- ]/g, "_").slice(0, 120),
        content: buffer.toString("base64"),
      });
    }

    const fullName = `${firstname} ${lastname}`;
    const inquiryLabel = INQUIRY_LABELS[inquiryType] || inquiryType;

    const html = `
      <h2>Nouvelle demande B2B — Travailler avec nous</h2>
      <p><strong>Type:</strong> ${escapeHtml(inquiryLabel)}</p>
      <p><strong>Nom:</strong> ${escapeHtml(fullName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Téléphone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Langue:</strong> ${escapeHtml(locale)}</p>
      <hr />
      <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      ${attachments.length ? `<p><em>Pièce jointe: ${escapeHtml(attachments[0].filename)}</em></p>` : ""}
    `;

    const sent = await sendResendMail({
      to: adminEmail,
      subject: `[B2B] ${inquiryLabel} — ${fullName}`,
      html,
      attachments: attachments.length ? attachments : undefined,
      idempotencyKey: `b2b/${email}/${Date.now().toString(36)}`,
    });

    if (!sent.ok) {
      if (!process.env.RESEND_API_KEY) {
        console.log("[B2B] Dev mode — request logged:", {
          fullName,
          email,
          inquiryLabel,
          message,
          attachment: attachments[0]?.filename,
        });
        return NextResponse.json({ success: true });
      }
      return NextResponse.json(
        { success: false, error: sent.error },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[B2B API]", err);
    return NextResponse.json(
      { success: false, error: "Failed to process request." },
      { status: 500 }
    );
  }
}
