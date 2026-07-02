/**
 * Serialize a value for embedding inside an inline
 * `<script type="application/ld+json">` tag.
 *
 * `JSON.stringify` does NOT escape `<`, `>`, or `&`, so a value containing
 * `</script>` (e.g. an admin-authored house title/description) would break out
 * of the script element and inject executable markup. Escaping these sequences
 * as unicode keeps the JSON valid while making `</script>` breakout impossible.
 * U+2028/U+2029 are also escaped so the output is a valid JS string literal.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
