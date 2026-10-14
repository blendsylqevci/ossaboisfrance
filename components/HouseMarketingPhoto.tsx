"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import styles from "./HouseMarketingPhoto.module.css";

const labels: Record<string, { open: string; close: string }> = {
  fr: { open: "Agrandir la photo", close: "Fermer" },
  en: { open: "Enlarge photo", close: "Close" },
  de: { open: "Foto vergrößern", close: "Schließen" },
  nl: { open: "Foto vergroten", close: "Sluiten" },
};

export function HouseMarketingPhoto({ src, title, locale, label, className }: {
  src: string;
  title: string;
  locale: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const text = labels[locale] || labels.fr;

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
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => { event.stopPropagation(); setOpen(true); }}>
        {label || <Image src={src} alt={title} fill
          sizes="(max-width: 760px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={90} style={{ objectFit: "cover" }} />}
      </button>
      {open && createPortal(
        <dialog ref={dialogRef} className={styles.dialog} aria-label={title}
          onCancel={() => setOpen(false)} onClose={() => setOpen(false)}
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}>
          <button type="button" className={styles.close} aria-label={text.close}
            onClick={() => setOpen(false)} autoFocus>×</button>
          {/* Load the full image only when the visitor opens it. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.photo} src={src} alt={title} />
        </dialog>, document.body
      )}
    </>
  );
}
