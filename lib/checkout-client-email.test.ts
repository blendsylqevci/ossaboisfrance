import assert from "node:assert/strict";
import test from "node:test";
import {
  CHECKOUT_PDF_CALLOUT_MARKER,
  checkoutEmailHtmlToText,
  finalizeCheckoutClientEmailHtml,
} from "./checkout-client-email.ts";

const template = `<html><body><table>${CHECKOUT_PDF_CALLOUT_MARKER}</table></body></html>`;

test("adds an accessible table-based PDF callout only when an attachment exists", () => {
  const html = finalizeCheckoutClientEmailHtml(template, {
    pdfAttached: true,
    attachmentCopy: "Your detailed PDF is attached.",
  });

  assert.match(html, /role="presentation"/);
  assert.match(html, />PDF</);
  assert.match(html, /Your detailed PDF is attached\./);
  assert.doesNotMatch(html, /PDF_ATTACHMENT_CALLOUT/);
});

test("keeps the client confirmation email valid when PDF generation fails", () => {
  const html = finalizeCheckoutClientEmailHtml(template, {
    pdfAttached: false,
    attachmentCopy: "A PDF is attached.",
  });

  assert.equal(html, "<html><body><table></table></body></html>");
  assert.doesNotMatch(html, /A PDF is attached/);
});

test("escapes attachment copy and rejects templates without the marker", () => {
  const html = finalizeCheckoutClientEmailHtml(template, {
    pdfAttached: true,
    attachmentCopy: "PDF <script>alert(1)</script>",
  });
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.throws(
    () => finalizeCheckoutClientEmailHtml("<html></html>", {
      pdfAttached: false,
      attachmentCopy: "",
    }),
    /missing its PDF callout marker/
  );
});

test("creates a readable plain-text fallback from the finalized HTML", () => {
  const html = `<!doctype html><html><head><style>.hidden{display:none}</style></head><body>
    <h1>Ossa Bois &amp; France</h1>
    <p>Reference&nbsp;OBF-123</p>
    <table><tr><td>Total HT</td><td>23&nbsp;926,50&nbsp;€</td></tr></table>
    <p>Reply &lt;directly&gt; to this email.</p>
  </body></html>`;

  const text = checkoutEmailHtmlToText(html);

  assert.match(text, /Ossa Bois & France/);
  assert.match(text, /Reference OBF-123/);
  assert.match(text, /Total HT 23 926,50 €/);
  assert.match(text, /Reply <directly> to this email\./);
  assert.doesNotMatch(text, /<style>|<h1>|<td>/);
});

test("does not crash or double-decode malformed numeric entities", () => {
  const html = `<p>Valid: &#8364;</p>
    <p>Customer literals: &amp;#9999999999; &amp;#x110000; &amp;#39;</p>
    <p>Malformed template entity: &#9999999999;</p>`;

  assert.doesNotThrow(() => checkoutEmailHtmlToText(html));

  const text = checkoutEmailHtmlToText(html);
  assert.match(text, /Valid: €/);
  assert.match(text, /Customer literals: &#9999999999; &#x110000; &#39;/);
  assert.match(text, /Malformed template entity: &#9999999999;/);
});
