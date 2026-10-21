"use client";

import type { Locale } from "@/lib/i18n";
import { getHousePlanimetryImage } from "@/lib/house-planimetry-image";

export type PlanimetryModalProps = {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  title: string;
  houseSlug: string;
  imageSrc: string;
  imageAlt: string;
};

export function PlanimetryModal({
  open,
  onClose,
  title,
  houseSlug,
  imageSrc,
  imageAlt,
}: PlanimetryModalProps) {
  const displayImageSrc = getHousePlanimetryImage(houseSlug, imageSrc);
  if (!open || !displayImageSrc) return null;

  return (
    <div
      className="material-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="material-modal planimetry-modal planimetry-modal--image-only"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button type="button" className="material-modal-close" onClick={onClose}>
          ×
        </button>

        <div className="planimetry-modal-media material-modal-media">
          {/* Full-resolution plan; modal height follows the image aspect ratio. */}
          <img
            src={displayImageSrc}
            alt={imageAlt}
            className="planimetry-modal-image modal-image-el"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}
