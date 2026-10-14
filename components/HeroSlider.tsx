"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFavorites } from "@/lib/favorites";
import type { Locale } from "@/lib/i18n";
import styles from "./HeroSlider.module.css";

type SliderHouse = {
  slug: string;
  title: string;
  image: string;
};

const labels = {
  fr: { carousel: "Modèles de maisons", previous: "Modèle précédent", next: "Modèle suivant", show: "Afficher", save: "Enregistrer", pause: "Mettre en pause", play: "Reprendre le défilement" },
  en: { carousel: "House models", previous: "Previous model", next: "Next model", show: "Show", save: "Save", pause: "Pause slideshow", play: "Resume slideshow" },
  de: { carousel: "Hausmodelle", previous: "Vorheriges Modell", next: "Nächstes Modell", show: "Anzeigen", save: "Speichern", pause: "Diashow pausieren", play: "Diashow fortsetzen" },
  nl: { carousel: "Woningmodellen", previous: "Vorig model", next: "Volgend model", show: "Toon", save: "Bewaren", pause: "Diavoorstelling pauzeren", play: "Diavoorstelling hervatten" },
};

export function HeroSlider({ houses, locale }: { houses: SliderHouse[]; locale: Locale }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const touchStart = useRef<number | null>(null);
  const { isFavorite, handleToggle } = useFavorites();
  const text = labels[locale];
  const house = houses[index] ?? houses[0];
  const multiple = houses.length > 1;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!multiple || paused || interacting || reducedMotion) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % houses.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [houses.length, multiple, paused, interacting, reducedMotion]);

  function move(direction: number) {
    if (!multiple) return;
    setPaused(true);
    setIndex((current) => (current + direction + houses.length) % houses.length);
  }

  if (!house) return null;

  return (
    <div className={styles.carousel} role="region" aria-roledescription="carousel"
      aria-label={text.carousel} data-house-slug={house.slug} data-multiple={multiple}
      onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
      }}
      onKeyDown={(event) => {
        if (multiple && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
          event.preventDefault();
          move(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
      onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
      onTouchCancel={() => { touchStart.current = null; }}
      onTouchEnd={(event) => {
        const end = event.changedTouches[0]?.clientX;
        if (touchStart.current !== null && end !== undefined && Math.abs(end - touchStart.current) > 60) {
          move(end < touchStart.current ? 1 : -1);
        }
        touchStart.current = null;
      }}>
      <div className={styles.slide} role="group" aria-roledescription="slide"
        aria-label={`${index + 1} / ${houses.length} — ${house.title}`}>
        <Image key={house.image} src={house.image} alt={house.title} fill sizes="100vw"
          quality={90} preload={index === 0} loading={index === 0 ? undefined : "eager"}
          className={styles.photo} draggable={false} />
      </div>
      <div className={styles.shade} />
      <div className={styles.caption} aria-live={paused || reducedMotion ? "polite" : "off"}>
        <Link href={`/${locale}/maisons/${house.slug}`} className={styles.model}>{house.title}</Link>
        <button type="button" className={styles.favorite} onClick={() => handleToggle(house.slug)}
          aria-label={`${text.save} — ${house.title}`} aria-pressed={isFavorite(house.slug)}>
          <svg viewBox="0 0 24 24" fill={isFavorite(house.slug) ? "currentColor" : "none"}
            stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      {multiple && <>
        <button type="button" className={`${styles.arrow} ${styles.previous}`} aria-label={text.previous} onClick={() => move(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>
        </button>
        <button type="button" className={`${styles.arrow} ${styles.next}`} aria-label={text.next} onClick={() => move(1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m10 6 6 6-6 6" /></svg>
        </button>
        <div className={styles.controls}>
          {houses.map((item, slideIndex) => <button key={item.slug} type="button"
            className={`${styles.dot} ${slideIndex === index ? styles.active : ""}`}
            aria-label={`${text.show} — ${item.title}`} aria-current={slideIndex === index ? "true" : undefined}
            onClick={() => { setPaused(true); setIndex(slideIndex); }} />)}
          {!reducedMotion && <button type="button" className={styles.play} aria-label={paused ? text.play : text.pause}
            onClick={() => setPaused((value) => !value)}>{paused ? "▶" : "Ⅱ"}</button>}
        </div>
      </>}
    </div>
  );
}
