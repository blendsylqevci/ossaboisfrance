export const CHECKOUT_SELECTION_KEY = "house_selections";

/** Preview JPEG for sessionStorage — full 4K base64 exceeds the ~5MB quota. */
const SCREENSHOT_MAX_WIDTH = 1280;
const SCREENSHOT_JPEG_QUALITY = 0.72;

export function isStorageQuotaError(err: unknown): boolean {
  if (!(err instanceof DOMException)) return false;
  return err.name === "QuotaExceededError" || err.code === 22;
}

/**
 * Composites visible configurator layers into a capped JPEG data URL.
 * Falls back to `fallbackImageUrl` when capture fails.
 */
export function captureConfiguratorScreenshot(
  containerId: string,
  fallbackImageUrl: string
): string {
  if (typeof document === "undefined") return fallbackImageUrl;

  try {
    const container = document.getElementById(containerId);
    if (!container) return fallbackImageUrl;

    const imgElements = Array.from(container.getElementsByTagName("img"));
    const visibleImgs = imgElements.filter(
      (img) =>
        img.classList.contains("is-on") ||
        window.getComputedStyle(img).opacity !== "0"
    );

    if (visibleImgs.length === 0) return fallbackImageUrl;

    const bgImg =
      visibleImgs.find((img) => img.getAttribute("data-layer") === "bg") ||
      visibleImgs[0];

    const srcW = bgImg.naturalWidth || 1920;
    const srcH = bgImg.naturalHeight || 1080;
    const scale = Math.min(1, SCREENSHOT_MAX_WIDTH / srcW);
    const outW = Math.max(1, Math.round(srcW * scale));
    const outH = Math.max(1, Math.round(srcH * scale));

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return fallbackImageUrl;

    for (const img of visibleImgs) {
      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, outW, outH);
      }
    }

    return canvas.toDataURL("image/jpeg", SCREENSHOT_JPEG_QUALITY);
  } catch {
    return fallbackImageUrl;
  }
}

function checkoutPayloadWithImageFallback(
  payload: Record<string, unknown>,
  imageUrl: string
): Record<string, unknown> {
  return { ...payload, currentImage: imageUrl };
}

/**
 * Persists checkout selection in sessionStorage. Retries with a CDN URL instead
 * of base64 when the browser quota is exceeded (fixes QuotaExceededError).
 */
export function saveCheckoutSelection(payload: Record<string, unknown>): boolean {
  if (typeof sessionStorage === "undefined") return false;

  const house = payload.house as { image?: string } | undefined;
  const fallbackImage = house?.image ?? "";

  const attempts: Record<string, unknown>[] = [
    payload,
    checkoutPayloadWithImageFallback(payload, fallbackImage),
  ];

  for (const attempt of attempts) {
    try {
      sessionStorage.setItem(CHECKOUT_SELECTION_KEY, JSON.stringify(attempt));
      return true;
    } catch (err) {
      if (!isStorageQuotaError(err)) throw err;
      try {
        sessionStorage.removeItem(CHECKOUT_SELECTION_KEY);
      } catch {
        // ignore
      }
    }
  }

  return false;
}

/** Best-effort localStorage write — never throws on quota errors. */
export function safeLocalStorageSet(key: string, value: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    if (isStorageQuotaError(err)) {
      console.warn(`localStorage quota exceeded; skipped write for ${key}`);
      return;
    }
    throw err;
  }
}
