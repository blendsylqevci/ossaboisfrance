"use client";

import type { Locale } from "@/lib/i18n";

export type PlanimetryModalProps = {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  title: string;
  imageSrc: string;
  imageAlt: string;
};

export function PlanimetryModal({
  open,
  onClose,
  title,
  imageSrc,
  imageAlt,
}: PlanimetryModalProps) {
  if (!open || !imageSrc) return null;

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
          {/* Native img: full CDN PNG, modal height follows image aspect ratio */}
          <img
            src={imageSrc}
            alt={imageAlt}
            className="planimetry-modal-image modal-image-el"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}
