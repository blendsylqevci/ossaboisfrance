"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { getHousePlanimetryImage } from "@/lib/house-planimetry-image";
import styles from "./HouseMarketingPhoto.module.css";

const labels: Record<string, { open: string; close: string; previous: string; next: string; plan: string }> = {
  fr: { open: "Agrandir la photo", close: "Fermer", previous: "Photo précédente", next: "Photo suivante", plan: "Planimétrie" },
  en: { open: "Enlarge photo", close: "Close", previous: "Previous photo", next: "Next photo", plan: "Floor plan" },
  de: { open: "Foto vergrößern", close: "Schließen", previous: "Vorheriges Foto", next: "Nächstes Foto", plan: "Grundriss" },
  nl: { open: "Foto vergroten", close: "Sluiten", previous: "Vorige foto", next: "Volgende foto", plan: "Plattegrond" },
};

export function HouseMarketingPhoto({ src, title, locale, label, className, house }: {
  src: string;
  title: string;
  locale: string;
  label?: string;
  className?: string;
  house?: { slug: string; title: string; planimetry?: string | null };
}) {
  const [open, setOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<number | null>(null);
  const text = labels[locale] || labels.fr;
  const planSrc = house ? getHousePlanimetryImage(house.slug, house.planimetry || "") : "";
  const photos = [
    { src, title },
    ...(house && planSrc && planSrc !== src ? [{ src: planSrc, title: `${text.plan} — ${house.title}` }] : []),
  ];
  const photo = photos[photoIndex] || photos[0];
  const multiple = photos.length > 1;

  function move(direction: number) {
    setPhotoIndex((current) => (current + direction + photos.length) % photos.length);
  }

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const trigger = triggerRef.current;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      trigger?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <>
      <button ref={triggerRef} type="button" className={className || styles.trigger}
        aria-label={`${text.open} — ${title}`} aria-haspopup="dialog"
        title={label ? text.open : undefined}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => { event.stopPropagation(); setPhotoIndex(0); setOpen(true); }}>
        {label ? <>
          <span>{label}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true" focusable="false">
            <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />
          </svg>
        </> : <Image src={src} alt={title} fill
          sizes="(max-width: 760px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={90} style={{ objectFit: "cover" }} />}
      </button>
      {open && createPortal(
        <dialog ref={dialogRef} className={`${styles.dialog}${multiple ? ` ${styles.gallery}` : ""}`} aria-label={title}
          onCancel={() => setOpen(false)} onClose={() => setOpen(false)}
          onKeyDown={(event) => {
            if (!multiple || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
            event.preventDefault();
            event.stopPropagation();
            move(event.key === "ArrowRight" ? 1 : -1);
          }}
          onTouchStart={(event) => {
            event.stopPropagation();
            touchStart.current = event.touches.length === 1 ? event.touches[0].clientX : null;
          }}
          onTouchMove={(event) => {
            event.stopPropagation();
            if (event.touches.length !== 1) touchStart.current = null;
          }}
          onTouchCancel={() => { touchStart.current = null; }}
          onTouchEnd={(event) => {
            event.stopPropagation();
            const end = event.changedTouches[0]?.clientX;
            if (multiple && touchStart.current !== null && end !== undefined && Math.abs(end - touchStart.current) > 60) {
              move(end < touchStart.current ? 1 : -1);
            }
            touchStart.current = null;
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}>
          <div className={styles.caption} aria-live="polite">{photo.title}</div>
          <button type="button" className={styles.close} aria-label={text.close}
            onClick={() => setOpen(false)} autoFocus>×</button>
          {/* Load the full image only when the visitor opens it. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={photo.src} className={styles.photo} src={photo.src} alt={photo.title} />
          {multiple ? <div className={styles.controls}>
            <button type="button" className={styles.navigation} aria-label={text.previous} onClick={() => move(-1)}>
              <span aria-hidden="true">‹</span><span className={styles.navigationText}>{text.previous}</span>
            </button>
            <span className={styles.counter}>{photoIndex + 1} / {photos.length}</span>
            <button type="button" className={styles.navigation} aria-label={text.next} onClick={() => move(1)}>
              <span className={styles.navigationText}>{text.next}</span><span aria-hidden="true">›</span>
            </button>
          </div> : null}
        </dialog>, document.body
      )}
    </>
  );
}
