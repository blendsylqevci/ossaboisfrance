"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  const [hasInteracted, setHasInteracted] = useState(false);
  const [primaryReady, setPrimaryReady] = useState(false);
  const [secondaryRequested, setSecondaryRequested] = useState(false);
  const [secondaryReady, setSecondaryReady] = useState(false);
  const [secondaryFailed, setSecondaryFailed] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const { isFavorite, handleToggle } = useFavorites();

  // The first full-resolution image remains the LCP candidate. Request the
  // comparison image only after the primary has loaded and the browser is idle.
  useEffect(() => {
    if (!primaryReady || secondaryRequested || secondaryFailed) return;

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(
        () => setSecondaryRequested(true),
        { timeout: 4000 }
      );
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(() => setSecondaryRequested(true), 1500);
    return () => globalThis.clearTimeout(timeoutId);
  }, [primaryReady, secondaryRequested, secondaryFailed]);

  // Wiggle only when both originals are ready, so it cannot reveal an empty
  // clipped layer while the second image is still downloading.
  useEffect(() => {
    if (!secondaryReady || hasInteracted) return;

    // Wait 1.2s after mount to start wiggle so user sees the page load
    const timer = setTimeout(() => {
      if (hasInteracted) return;

      const duration = 2600; // 2.6 seconds duration (longer is slower/smoother)
      const startTime = Date.now();

      const animate = () => {
        if (hasInteracted) return;
        const elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
          setPos(50);
          return;
        }

        const t = elapsed / duration;
        // Decaying amplitude using a smooth cubic function for a very natural slow down: Math.pow(1 - t, 1.5)
        const damping = Math.pow(1 - t, 1.5);
        // Smooth slower wiggle: 2 full cycles (PI * 4), max 12% wiggle
        const currentPos = 50 + Math.sin(t * Math.PI * 4) * 12 * damping;
        setPos(currentPos);

        requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    }, 1200);

    return () => clearTimeout(timer);
  }, [secondaryReady, hasInteracted]);

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
    setHasInteracted(true);
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
    setHasInteracted(true);
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
      onPointerEnter={requestSecondary}
      onFocus={requestSecondary}
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
          priority
          onLoad={() => setPrimaryReady(true)}
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
              priority={false}
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
