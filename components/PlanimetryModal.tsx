"use client";

import type { Locale } from "@/lib/i18n";
import { useState } from "react";
import { getHousePlanimetryPages, getHousePlanimetryLevelLabel } from "@/lib/house-planimetry-image";
import styles from "./PlanimetryModal.module.css";

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
  locale,
  title,
  houseSlug,
  imageSrc,
  imageAlt,
}: PlanimetryModalProps) {
  const [selection, setSelection] = useState({ slug: houseSlug, index: 0 });
  const pages = getHousePlanimetryPages(houseSlug, imageSrc);
  const pageIndex = selection.slug === houseSlug && selection.index < pages.length ? selection.index : 0;
  const page = pages[pageIndex];
  const levelLabel = page ? getHousePlanimetryLevelLabel(page.level, locale) : "";
  function close() {
    setSelection({ slug: houseSlug, index: 0 });
    onClose();
  }
  if (!open || !page) return null;

  return (
    <div
      className="material-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        className={`material-modal planimetry-modal planimetry-modal--image-only${pages.length > 1 ? ` ${styles.multiple}` : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onKeyDown={(event) => {
          if (event.key === "Escape") close();
          if (pages.length < 2 || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
          event.preventDefault();
          setSelection({ slug: houseSlug, index: (pageIndex + (event.key === "ArrowRight" ? 1 : -1) + pages.length) % pages.length });
        }}
      >
        <button type="button" className="material-modal-close" onClick={close}>
          ×
        </button>

        <div className={`planimetry-modal-media material-modal-media ${styles.media}`}>
          {/* Full-resolution plan; modal height follows the image aspect ratio. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={page.src}
            src={page.src}
            alt={`${imageAlt}${levelLabel ? ` — ${levelLabel}` : ""}`}
            className="planimetry-modal-image modal-image-el"
            decoding="async"
          />
        </div>
        {pages.length > 1 ? <div className={styles.levels} aria-label={title}>
          {pages.map((floor, index) => <button key={floor.src} type="button"
            aria-pressed={pageIndex === index}
            onClick={() => setSelection({ slug: houseSlug, index })}>
            {getHousePlanimetryLevelLabel(floor.level, locale)}
          </button>)}
        </div> : null}
      </div>
    </div>
  );
}
