"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useFavorites } from "@/lib/favorites";

type SliderHouse = {
  slug: string;
  title: string;
  image: string;
  imageBardage: string;
};

type HeroSliderProps = {
  house: SliderHouse | null;
};

export function HeroSlider({ house }: HeroSliderProps) {
  const [pos, setPos] = useState(50);
  const [secondaryRequested, setSecondaryRequested] = useState(false);
  const [secondaryReady, setSecondaryReady] = useState(false);
  const [secondaryFailed, setSecondaryFailed] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const { isFavorite, handleToggle } = useFavorites();

  // 3. Slider Interaction Handlers
  const updatePos = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPos(pct);
  }, []);

  const requestSecondary = useCallback(() => {
    if (!secondaryFailed) setSecondaryRequested(true);
  }, [secondaryFailed]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    requestSecondary();
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updatePos(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    updatePos(e.clientX);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    requestSecondary();
    setPos((current) =>
      Math.max(0, Math.min(100, current + (e.key === "ArrowRight" ? 5 : -5)))
    );
  };

  if (!house) return null;

  return (
    <div
      ref={containerRef}
      className="hero-compare-slider"
      role="slider"
      tabIndex={0}
      aria-label={`${house.title} image comparison`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      aria-busy={secondaryRequested && !secondaryReady && !secondaryFailed}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      {/* Bottom Image — Bardage */}
      <div className="hero-slider-img-wrapper">
        <Image
          className="hero-slider-img"
          src={house.imageBardage}
          alt={`${house.title} — Bardage`}
          fill
          sizes="100vw"
          quality={90}
          preload
          style={{ objectFit: "cover" }}
          draggable={false}
        />
      </div>

      {/* Top Image — Enduit (Clipped) */}
      {secondaryRequested ? (
        <div
          className="hero-slider-clip"
          style={{
            clipPath: `inset(0 ${100 - pos}% 0 0)`,
            opacity: secondaryReady ? 1 : 0,
          }}
        >
          <div className="hero-slider-img-wrapper">
            <Image
              className="hero-slider-img"
              src={house.image}
              alt={`${house.title} — Enduit`}
              fill
              sizes="100vw"
              quality={90}
              onLoad={() => setSecondaryReady(true)}
              onError={() => setSecondaryFailed(true)}
              style={{ objectFit: "cover" }}
              draggable={false}
            />
          </div>
        </div>
      ) : null}

      {/* Divider Bar */}
      {secondaryReady ? (
        <div className="hero-slider-divider" style={{ left: `${pos}%` }}>
          <div className="hero-slider-divider-line" />
          <div className="hero-slider-handle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      ) : null}

      {/* Labels */}
      {secondaryReady ? (
        <>
          <span className="hero-slider-label hero-slider-label-left" style={{ opacity: pos > 15 ? 1 : 0 }}>Enduit</span>
          <span className="hero-slider-label hero-slider-label-right" style={{ opacity: pos < 85 ? 1 : 0 }}>Bardage</span>
        </>
      ) : null}
      
      {/* Badge indicating active house name (hidden on desktop via CSS, shown on mobile) */}
      <div className="hero-slider-badge">
        <span>{house.title}</span>
        <button 
          className="hero-slider-favorite-btn"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            handleToggle(house.slug);
          }}
          aria-label="Save House"
        >
          <svg 
            className={`heart-icon ${isFavorite(house.slug) ? "is-fav" : ""}`}
            viewBox="0 0 24 24"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
