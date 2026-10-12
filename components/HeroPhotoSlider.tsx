"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import styles from "./HeroPhotoSlider.module.css";

const photos = [
  { src: "/images/hero/house-garden-default.png", position: "38% center" },
  { src: "/images/hero/house-pool-preview.jpg", position: "center" },
];

export function HeroPhotoSlider({ label }: { label: string }) {
  const [active, setActive] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const move = (direction: number) =>
    setActive((current) => (current + direction + photos.length) % photos.length);

  return (
    <section
      className={styles.slider}
      aria-label={label}
      aria-roledescription="carousel"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
      onTouchStart={(event) => {
        const first = event.touches[0];
        touch.current = { x: first.clientX, y: first.clientY };
      }}
      onTouchCancel={() => { touch.current = null; }}
      onTouchEnd={(event) => {
        if (!touch.current) return;
        const end = event.changedTouches[0];
        const dx = end.clientX - touch.current.x;
        const dy = end.clientY - touch.current.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      {photos.map((photo, index) => (
        <div key={photo.src} className={styles.slide} hidden={index !== active}>
          <Image
            src={photo.src}
            alt={`${label} — ${index + 1}`}
            fill
            sizes="100vw"
            quality={90}
            preload={index === 0}
            style={{ objectFit: "cover", objectPosition: photo.position }}
            draggable={false}
          />
        </div>
      ))}
      <button type="button" className={`${styles.arrow} ${styles.previous}`} aria-label="Previous photo" onClick={() => move(-1)}>‹</button>
      <button type="button" className={`${styles.arrow} ${styles.next}`} aria-label="Next photo" onClick={() => move(1)}>›</button>
      <div className={styles.dots}>
        {photos.map((photo, index) => (
          <button key={photo.src} type="button" className={styles.dot} aria-label={`Photo ${index + 1}`} aria-pressed={active === index} onClick={() => setActive(index)} />
        ))}
      </div>
      <span className={styles.status} aria-live="polite" aria-atomic="true">{active + 1} / {photos.length}</span>
    </section>
  );
}
