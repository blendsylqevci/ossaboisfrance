export const CHECKOUT_PDF_CALLOUT_MARKER = "<!--PDF_ATTACHMENT_CALLOUT-->";

function escapeEmailText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function decodeNumericEntity(match: string, value: string, radix: 10 | 16): string {
  const codePoint = Number.parseInt(value, radix);

  // String.fromCodePoint throws for values outside Unicode's scalar range.
  // Preserve malformed entities as text instead of failing the checkout after
  // the order has already been saved.
  if (
    !Number.isInteger(codePoint) ||
    codePoint < 0 ||
    codePoint > 0x10ffff ||
    (codePoint >= 0xd800 && codePoint <= 0xdfff)
  ) {
    return match;
  }

  return String.fromCodePoint(codePoint);
}

/**
 * Finalizes the client template only after PDF generation has completed. The
 * callout is therefore never shown in the valid fallback where confirmation
 * email delivery succeeds without an attachment.
 */
export function finalizeCheckoutClientEmailHtml(
  template: string,
  options: { pdfAttached: boolean; attachmentCopy: string }
): string {
  if (!template.includes(CHECKOUT_PDF_CALLOUT_MARKER)) {
    throw new TypeError("Checkout client email is missing its PDF callout marker.");
  }

  const callout = options.pdfAttached
    ? `<tr><td class="email-pad" style="padding:0 24px 16px 24px;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#435139;border-radius:8px;"><tr><td width="46" align="center" style="padding:14px 0 14px 14px;font-size:16px;font-weight:800;line-height:1;color:#FFFFFF;">PDF</td><td style="padding:14px 16px;font-size:12.5px;line-height:1.55;color:#FFFFFF;">${escapeEmailText(options.attachmentCopy)}</td></tr></table></td></tr>`
    : "";

  return template.replace(CHECKOUT_PDF_CALLOUT_MARKER, callout);
}

/**
 * Produces a readable fallback for clients that block HTML email. Checkout
 * content is already escaped before it reaches this helper; entity decoding
 * here is limited to the standard entities emitted by our templates.
 */
export function checkoutEmailHtmlToText(html: string): string {
  return html
    .replace(/<head\b[\s\S]*?<\/head>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "- ")
    .replace(/<\/(?:p|div|tr|h[1-6]|li)>/gi, "\n")
    .replace(/<\/t[dh]>/gi, "\t")
    .replace(/<[^>]+>/g, "")
    // Decode once only. Numeric and named entities must be handled before
    // &amp; so escaped customer input such as &amp;#9999999999; remains literal.
    .replace(/&#(\d+);/g, (match, decimal: string) =>
      decodeNumericEntity(match, decimal, 10)
    )
    .replace(/&#x([0-9a-f]+);/gi, (match, hexadecimal: string) =>
      decodeNumericEntity(match, hexadecimal, 16)
    )
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.replace(/[\t ]+/g, " ").trim())
    .filter((line, index, lines) => line || (index > 0 && lines[index - 1]))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
