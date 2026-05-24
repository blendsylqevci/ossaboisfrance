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
  houses: SliderHouse[];
  initialIdx: number;
};

export function HeroSlider({ houses, initialIdx }: HeroSliderProps) {
  const [mounted, setMounted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(initialIdx);
  const [pos, setPos] = useState(50);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const hasRunRotation = useRef(false);

  const { isFavorite, handleToggle } = useFavorites();

  // 1. Session Rotation Logic (Sets cookie for the NEXT refresh)
  useEffect(() => {
    setMounted(true);
    if (!houses || houses.length === 0 || hasRunRotation.current) return;
    hasRunRotation.current = true;

    try {
      // Calculate the index of the next house to display on next refresh
      const nextIdx = (initialIdx + 1) % houses.length;
      
      // Store the NEXT house slug in a cookie expiring in 1 week (604800 seconds)
      document.cookie = `hero_house_slug=${houses[nextIdx].slug}; path=/; max-age=604800; SameSite=Lax`;
    } catch (err) {
      console.warn("Failed to set cookie for HeroSlider:", err);
    }
  }, [houses, initialIdx]);

  // 2. Wiggle Animation Logic (Triggers on every refresh during testing)
  useEffect(() => {
    if (!mounted || hasInteracted) return;

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
  }, [mounted, hasInteracted]);

  // 3. Slider Interaction Handlers
  const updatePos = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPos(pct);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      if (e.cancelable) {
        e.preventDefault();
      }
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      updatePos(clientX);
    };
    
    const onUp = () => {
      dragging.current = false;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [updatePos]);

  const onPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    setHasInteracted(true);
    dragging.current = true;
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    updatePos(clientX);
  };

  if (!houses || houses.length === 0) return null;

  const activeHouse = houses[currentIdx] || houses[0];

  return (
    <div
      ref={containerRef}
      className="hero-compare-slider"
      onMouseDown={onPointerDown}
      onTouchStart={onPointerDown}
    >
      {/* Bottom Image — Bardage */}
      <div className="hero-slider-img-wrapper">
        <Image
          className="hero-slider-img"
          src={activeHouse.imageBardage}
          alt={`${activeHouse.title} — Bardage`}
          fill
          sizes="100vw"
          priority
          style={{ objectFit: "cover" }}
          draggable={false}
        />
      </div>

      {/* Top Image — Enduit (Clipped) */}
      <div className="hero-slider-clip" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <div className="hero-slider-img-wrapper">
          <Image
            className="hero-slider-img"
            src={activeHouse.image}
            alt={`${activeHouse.title} — Enduit`}
            fill
            sizes="100vw"
            priority
            style={{ objectFit: "cover" }}
            draggable={false}
          />
        </div>
      </div>

      {/* Divider Bar */}
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

      {/* Labels */}
      <span className="hero-slider-label hero-slider-label-left" style={{ opacity: pos > 15 ? 1 : 0 }}>Enduit</span>
      <span className="hero-slider-label hero-slider-label-right" style={{ opacity: pos < 85 ? 1 : 0 }}>Bardage</span>
      
      {/* Badge indicating active house name (hidden on desktop via CSS, shown on mobile) */}
      <div className="hero-slider-badge">
        <span>{activeHouse.title}</span>
        <button 
          className="hero-slider-favorite-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleToggle(activeHouse.slug);
          }}
          aria-label="Save House"
        >
          <svg 
            className={`heart-icon ${isFavorite(activeHouse.slug) ? "is-fav" : ""}`} 
            viewBox="0 0 24 24"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
