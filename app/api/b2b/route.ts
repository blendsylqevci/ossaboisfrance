import { createHash, createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { buildLeadAcknowledgementEmail } from "@/lib/email-templates";
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
import { isLocale, type Locale } from "@/lib/i18n";
import { createRecipientRateLimitKey } from "@/lib/public-form-rate-limit";
import {
  PRIVACY_POLICY_VERSION,
  checkDeclaredRequestSize,
  hasPdfSignature,
  isPrivacyAccepted,
} from "@/lib/public-form-security";
import {
  escapeHtml,
  getResendAdminEmail,
  getResendB2BFromEmail,
  getResendReplyToEmail,
  sendResendMail,
  type ResendAttachment,
} from "@/lib/resend-mail";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_FILE_BYTES + 512 * 1024;
const ALLOWED_EXTENSIONS = new Set([".pdf"]);
const ALLOWED_PDF_MIME_TYPES = new Set([
  "",
  "application/octet-stream",
  "application/pdf",
]);
const MAX_RECIPIENT_ACKNOWLEDGEMENTS = 4;
const RECIPIENT_ACKNOWLEDGEMENT_WINDOW_MS = 60 * 60 * 1000;

const INQUIRY_LABELS: Record<string, string> = {
  cnc: "Découpe CNC & Charpente",
  architecture: "Bureau d'études & Architecture",
  kit: "Fabrication de Kit",
  montage: "Construction & Montage complet",
  autre: "Autre type de projet",
};

function normalizeLocale(value: string): Locale {
  return isLocale(value) ? value : "fr";
}

function createRequestReference(values: string[]): string {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const secret =
    process.env.PAYLOAD_SECRET ||
    process.env.RESEND_API_KEY ||
    "ossabois-b2b-reference-development";
  const digest = createHmac("sha256", secret)
    .update(JSON.stringify(["b2b-v1", day, ...values]))
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();

  return `B2B-${day}-${digest}`;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = await checkRateLimitAsync(`b2b:${ip}`, 5, 15 * 60 * 1000);
  if (!limited.allowed) {
    return rateLimitResponse(limited.retryAfterSec);
  }

  const contentType = req.headers.get("content-type")?.toLowerCase() || "";
  if (!contentType.startsWith("multipart/form-data")) {
    return NextResponse.json(
      { success: false, error: "Invalid multipart request." },
      { status: 400 }
    );
  }

  // Fail fast when the browser/proxy declares the size. Missing/chunked
  // Content-Length still relies on the hosting proxy during parsing, so the
  // authoritative parsed-size check below remains required.
  const declaredSize = checkDeclaredRequestSize(
    req.headers.get("content-length"),
    MAX_REQUEST_BYTES
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
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid multipart body." },
        { status: 400 }
      );
    }

    let parsedBytes = 0;
    let uploadedFileCount = 0;
    let entryCount = 0;
    const entries = formData.entries();
    for (let entry = entries.next(); !entry.done; entry = entries.next()) {
      const [fieldName, value] = entry.value;
      entryCount += 1;
      if (entryCount > 16) {
        return NextResponse.json(
          { success: false, error: "Too many form fields." },
          { status: 400 }
        );
      }
      if (typeof value === "string") {
        parsedBytes += Buffer.byteLength(value, "utf8");
      } else {
        parsedBytes += value.size;
        if (value.size > 0) {
          uploadedFileCount += 1;
          if (fieldName !== "file" || uploadedFileCount > 1) {
            return NextResponse.json(
              { success: false, error: "Only one PDF file is allowed." },
              { status: 400 }
            );
          }
        }
      }
      if (parsedBytes > MAX_REQUEST_BYTES) {
        return NextResponse.json(
          { success: false, error: "Request body too large." },
          { status: 413 }
        );
      }
    }

    if (isHoneypotTriggered(formData.get("website"))) {
      return NextResponse.json({ success: true });
    }

    const inquiryType = sanitizeText(formData.get("inquiryType"), 32, { singleLine: true });
    const firstname = sanitizeText(formData.get("firstname"), 80, { singleLine: true });
    const lastname = sanitizeText(formData.get("lastname"), 80, { singleLine: true });
    const email = sanitizeText(formData.get("email"), 254, { singleLine: true });
    const phone = sanitizeText(formData.get("phone"), 40, { singleLine: true });
    const message = sanitizeText(formData.get("message"), 8000);
    const locale = normalizeLocale(
      sanitizeText(formData.get("locale"), 8, { singleLine: true }) || "fr"
    );

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

    if (!isPrivacyAccepted(formData.get("privacyAccepted"))) {
      return NextResponse.json(
        { success: false, error: "Privacy acceptance is required." },
        { status: 400 }
      );
    }

    const attachments: ResendAttachment[] = [];
    let attachmentFingerprint = "none";
    const file = formData.get("file");
    if (file && file instanceof File && file.size > 0) {
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { success: false, error: "File too large (max 10 MB)." },
          { status: 413 }
        );
      }

      const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
      if (
        !ALLOWED_EXTENSIONS.has(ext) ||
        !ALLOWED_PDF_MIME_TYPES.has(file.type.toLowerCase())
      ) {
        return NextResponse.json(
          { success: false, error: "Only PDF files are allowed." },
          { status: 400 }
        );
      }

      const headerBytes = new Uint8Array(
        await file.slice(0, 5).arrayBuffer()
      );
      if (!hasPdfSignature(headerBytes)) {
        return NextResponse.json(
          { success: false, error: "Invalid PDF file." },
          { status: 400 }
        );
      }

      const fileBytes = new Uint8Array(await file.arrayBuffer());
      const buffer = Buffer.from(fileBytes);
      attachmentFingerprint = createHash("sha256")
        .update(fileBytes)
        .digest("hex");
      attachments.push({
        filename: file.name.replace(/[^\w.\- ]/g, "_").slice(0, 120),
        content: buffer.toString("base64"),
      });
    }

    const fullName = `${firstname} ${lastname}`;
    const inquiryLabel = INQUIRY_LABELS[inquiryType] || inquiryType;
    const reference = createRequestReference([
      inquiryType,
      firstname,
      lastname,
      email.toLowerCase(),
      phone,
      message,
      locale,
      attachments[0]?.filename || "",
      attachmentFingerprint,
      PRIVACY_POLICY_VERSION,
    ]);
    const adminEmail = getResendAdminEmail();
    const replyToEmail =
      getResendReplyToEmail() || "info@ossaboisfrance.com";
    if (!adminEmail) {
      if (process.env.NODE_ENV === "production") {
        console.error("[B2B] RESEND_ADMIN_EMAIL is required in production.");
        return NextResponse.json(
          { success: false, error: "Email service unavailable." },
          { status: 503 }
        );
      }
      console.warn("[B2B] Email service unavailable in development.", {
        reference,
      });
      return NextResponse.json({
        success: true,
        confirmationSent: false,
        reference,
      });
    }

    const html = `
      <h2>Nouvelle demande B2B — Travailler avec nous</h2>
      <p><strong>Référence:</strong> ${escapeHtml(reference)}</p>
      <p><strong>Type:</strong> ${escapeHtml(inquiryLabel)}</p>
      <p><strong>Nom:</strong> ${escapeHtml(fullName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Téléphone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Langue:</strong> ${escapeHtml(locale)}</p>
      <p><strong>Confidentialité:</strong> acceptée — version ${escapeHtml(PRIVACY_POLICY_VERSION)}</p>
      <hr />
      <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      ${attachments.length ? `<p><strong>Pièce jointe externe non vérifiée:</strong> ${escapeHtml(attachments[0].filename)} — analysez-la avant ouverture.</p>` : ""}
    `;

    const sent = await sendResendMail({
      to: adminEmail,
      subject: `[B2B] ${inquiryLabel} — ${reference}`,
      html,
      attachments: attachments.length ? attachments : undefined,
      from: getResendB2BFromEmail(),
      replyTo: email,
      idempotencyKey: `b2b-admin/${reference}`,
      event: "b2b-admin",
    });

    if (!sent.ok) {
      if (
        !process.env.RESEND_API_KEY &&
        process.env.NODE_ENV !== "production"
      ) {
        console.warn("[B2B] Email not sent in development.", {
          reference,
        });
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
      kind: "b2b",
      locale,
      name: firstname,
      reference,
    });
    const recipientLimit = await checkRateLimitAsync(
      createRecipientRateLimitKey("b2b", email),
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
      from: getResendB2BFromEmail(),
      replyTo: replyToEmail,
      idempotencyKey: `b2b-client/${reference}`,
      event: "b2b-client",
    });

    return NextResponse.json({
      success: true,
      confirmationSent: confirmation.ok,
      reference,
    });
  } catch (err) {
    console.error("[B2B API] Failed to process request.");
    void err;
    return NextResponse.json(
      { success: false, error: "Failed to process request." },
      { status: 500 }
    );
  }
}
