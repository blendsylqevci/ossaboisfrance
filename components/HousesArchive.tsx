"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatArchiveStartingPrice } from "@/data/houses-archive";
import { Locale } from "@/lib/i18n";
import { useFavorites } from "@/lib/favorites";
import { useSavedConfigurations } from "@/lib/saved-configs";
import { useSearchParams } from "next/navigation";

export type CMSCategoryItem = {
  id: string;
  title: string;
  slug: string;
};

export type CMSHouseItem = {
  slug: string;
  title: string;
  categoryName: string;
  categorySlug: string;
  description: string;
  image: string;
  imageBardage: string;
  price60x160: number | null;
  neto?: number | null;
  bruto?: number | null;
  planimetry?: string | null;
};

type HousesArchiveProps = {
  locale: Locale;
  initialHouses: CMSHouseItem[];
  initialCategories: CMSCategoryItem[];
  dict: any;
};

export function CompareSlider({ imageA, imageB, altA, altB }: { imageA: string; imageB: string; altA: string; altB: string }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

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
      e.preventDefault();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      updatePos(clientX);
    };
    const onUp = () => { dragging.current = false; };

    window.addEventListener("mousemove", onMove, { passive: false });
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
    e.preventDefault();
    dragging.current = true;
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    updatePos(clientX);
  };

  return (
    <div
      ref={containerRef}
      className="compare-slider"
      onMouseDown={onPointerDown}
      onTouchStart={onPointerDown}
    >
      {/* Bottom layer — Bardage (full) */}
      <Image
        className="compare-img compare-img-full"
        src={imageB}
        alt={altB}
        width={900}
        height={600}
        sizes="(max-width: 760px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={false}
        draggable={false}
      />

      {/* Top layer — Enduit (clipped) */}
      <div className="compare-clip" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image
          className="compare-img"
          src={imageA}
          alt={altA}
          width={900}
          height={600}
          sizes="(max-width: 760px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div className="compare-divider" style={{ left: `${pos}%` }}>
        <div className="compare-divider-line" />
        <div className="compare-handle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <span className="compare-label compare-label-left" style={{ opacity: pos > 15 ? 1 : 0 }}>Enduit</span>
      <span className="compare-label compare-label-right" style={{ opacity: pos < 85 ? 1 : 0 }}>Bardage</span>
    </div>
  );
}

function HouseCard({ house, locale, dict, onOpenPlanimetry }: { house: CMSHouseItem; locale: Locale; dict: any; onOpenPlanimetry?: (house: CMSHouseItem) => void }) {
  const price = formatArchiveStartingPrice(house.price60x160);
  const hasBothImages = !!house.image && !!house.imageBardage && house.image !== house.imageBardage;
  const { isFavorite, handleToggle } = useFavorites();

  return (
    <article className="house-archive-card reveal-on-scroll">
      <div className="house-archive-card-image">
        {hasBothImages ? (
          <CompareSlider
            imageA={house.image}
            imageB={house.imageBardage}
            altA={`${house.title} — Enduit`}
            altB={`${house.title} — Bardage`}
          />
        ) : house.image ? (
          <Image 
            src={house.image} 
            alt={house.title} 
            width={900} 
            height={600} 
            sizes="(max-width: 760px) 100vw, (max-width: 1200px) 50vw, 33vw" 
            priority={false}
          />
        ) : null}

        <button
          className="card-planimetry-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onOpenPlanimetry) onOpenPlanimetry(house);
          }}
          aria-label="View floor plan"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18M9 13h12M15 13v8M3 9h6" />
          </svg>
        </button>

        <button
          className="card-favorite-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleToggle(house.slug);
          }}
          aria-label="Save to favorites"
        >
          <svg className={`heart-icon ${isFavorite(house.slug) ? "is-fav" : ""}`} viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <div className="house-archive-card-body">
        <span className="house-archive-card-category">{house.categoryName}</span>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", width: "100%", marginBottom: "12px", flexWrap: "wrap" }}>
          <h3 style={{ margin: 0 }}>{house.title}</h3>
          {house.neto && (
            <div style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
              <span style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "5px", opacity: 0.75 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 3v18M9 12h12" />
                </svg>
                Neto: {house.neto} m²
              </span>
              <span style={{ color: "#E5E7EB", userSelect: "none" }}>|</span>
              <span style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "5px", opacity: 0.75 }}>
                  <rect x="5" y="5" width="14" height="14" rx="1.5" />
                  <path d="M2 5h3M2 19h3M19 5h3M19 19h3M5 2v3M19 2v3M5 19v3M19 19v3" />
                </svg>
                Bruto: {house.bruto} m²
              </span>
            </div>
          )}
        </div>
        <p className="house-archive-card-desc">{house.description}</p>
        
        <div className="house-archive-card-footer">
          {price ? (
            <div className="house-archive-price">
              <span className="price-label">{dict.startingFrom}</span>
              <strong className="price-val">{price}&nbsp;€</strong>
            </div>
          ) : (
            <div className="house-archive-price price-placeholder">
              <span className="price-label">{dict.onQuote}</span>
            </div>
          )}
          <Link className="house-archive-button" href={`/${locale}/maisons/${house.slug}`}>
            <span>{dict.configureBtn}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function HousesArchive({ locale, initialHouses, initialCategories, dict }: HousesArchiveProps) {
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showSavedConfigurations, setShowSavedConfigurations] = useState(false);
  const [activePlanimetry, setActivePlanimetry] = useState<CMSHouseItem | null>(null);
  const { isFavorite } = useFavorites();
  const { hasSavedConfig } = useSavedConfigurations();
  const totalFavoritesCount = initialHouses.filter((house) => isFavorite(house.slug)).length;
  const totalSavedConfigsCount = initialHouses.filter((house) => hasSavedConfig(house.slug)).length;

  const searchParams = useSearchParams();
  const view = searchParams ? searchParams.get("view") : null;

  useEffect(() => {
    if (view === "saves") {
      setShowSavedConfigurations(true);
      setShowOnlyFavorites(false);
    } else if (view === "favorites") {
      setShowOnlyFavorites(true);
      setShowSavedConfigurations(false);
    }
  }, [view]);

  // Reset showOnlyFavorites and showSavedConfigurations when a hash is present or changes (e.g. from header nav links)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash) {
        setShowOnlyFavorites(false);
        setShowSavedConfigurations(false);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    // Also run on mount to handle direct page loads with hash
    if (window.location.hash) {
      setShowOnlyFavorites(false);
      setShowSavedConfigurations(false);
    }
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Intersection Observer for scroll animations with a safety timeout to ensure React DOM is painted
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let revealElements: NodeListOf<Element> | null = null;

    const timer = setTimeout(() => {
      const observerOptions = {
        root: null,
        rootMargin: "0px 0px -40px 0px",
        threshold: 0.02
      };

      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            if (observer) {
              observer.unobserve(entry.target);
            }
          }
        });
      }, observerOptions);

      revealElements = document.querySelectorAll(".reveal-on-scroll");
      revealElements.forEach((el) => {
        if (observer) observer.observe(el);
      });
    }, 150); // 150ms delay guarantees the DOM nodes are present and painted

    return () => {
      clearTimeout(timer);
      if (observer && revealElements) {
        revealElements.forEach((el) => {
          if (observer) observer.unobserve(el);
        });
      }
    };
  }, [showOnlyFavorites, showSavedConfigurations]);

  const pageTitle = dict.pageTitle;
  const pageSubtitle = dict.pageSubtitle;
  
  const commitmentsTitle = dict.commitmentsTitle;
  const commitmentsSubtitle = dict.commitmentsSubtitle;
  const commitmentsList = dict.commitmentsList || [];

  return (
    <section className="houses-archive-page">
      {/* Hero Header */}
      <div className="houses-archive-hero">
        <div className="container">
          <div className="houses-archive-hero-content">
            <span className="hero-kicker">OSSA BOIS FRANCE</span>
            <h1>{pageTitle}</h1>
            <p>{pageSubtitle}</p>
            
            {/* Quick Category Anchors */}
            <div className="category-quick-nav">
              {initialCategories.map((category) => {
                const count = initialHouses.filter((house) => house.categorySlug === category.slug).length;
                if (count === 0) return null;
                return (
                  <a 
                    href={`#${category.id}`} 
                    className="category-nav-badge" 
                    key={category.id}
                    onClick={() => {
                      setShowOnlyFavorites(false);
                      setShowSavedConfigurations(false);
                    }}
                  >
                    <span>{category.title}</span>
                    <span className="badge-count notranslate" translate="no">{count}</span>
                  </a>
                );
              })}
              
              <button 
                className={`category-nav-badge favorites-toggle-badge ${showOnlyFavorites ? "active" : ""}`}
                onClick={() => {
                  setShowOnlyFavorites(!showOnlyFavorites);
                  setShowSavedConfigurations(false);
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {dict.favoritesLabel}
                </span>
                <span className="badge-count notranslate" translate="no">
                  {totalFavoritesCount}
                </span>
              </button>

              <button 
                className={`category-nav-badge saved-configs-toggle-badge ${showSavedConfigurations ? "active" : ""}`}
                onClick={() => {
                  setShowSavedConfigurations(!showSavedConfigurations);
                  setShowOnlyFavorites(false);
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  {dict.savedConfigsLabel}
                </span>
                <span className="badge-count notranslate" translate="no">
                  {totalSavedConfigsCount}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
 
      {/* Sticky Bar - Client scroll controlled in CSS / global */}
      <div className="archive-sticky-nav-container">
        <div className="container">
          <div className="archive-sticky-nav">
            {initialCategories.map((category) => {
              const count = initialHouses.filter((house) => house.categorySlug === category.slug).length;
              return (
                <a 
                  href={`#${category.id}`} 
                  key={category.id}
                  onClick={() => {
                    setShowOnlyFavorites(false);
                    setShowSavedConfigurations(false);
                  }}
                >
                  <span>{category.title}</span>
                  <span className="sticky-nav-count notranslate" translate="no">{count || 0}</span>
                </a>
              );
            })}
            
             <button 
              className={`favorites-sticky-toggle ${showOnlyFavorites ? "active" : ""}`}
              onClick={() => {
                setShowOnlyFavorites(!showOnlyFavorites);
                setShowSavedConfigurations(false);
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {dict.favoritesLabel}
              </span>
              <span className="sticky-nav-count notranslate" translate="no">
                {totalFavoritesCount}
              </span>
            </button>

            <button 
              className={`favorites-sticky-toggle saved-configs-sticky-toggle ${showSavedConfigurations ? "active" : ""}`}
              style={{ marginLeft: "8px" }}
              onClick={() => {
                setShowSavedConfigurations(!showSavedConfigurations);
                setShowOnlyFavorites(false);
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                {dict.savedConfigsLabel}
              </span>
              <span className="sticky-nav-count notranslate" translate="no">
                {totalSavedConfigsCount}
              </span>
            </button>
          </div>
        </div>
      </div>
 
      {/* Commitments & Guarantees section */}
      {!showOnlyFavorites && !showSavedConfigurations && (
        <div className="archive-commitments-section">
          <div className="container">
            <div className="commitments-header reveal-on-scroll">
              <h2>{commitmentsTitle}</h2>
              <p>{commitmentsSubtitle}</p>
            </div>
            <div className="archive-commitments-grid">
              {commitmentsList.map((item: any, idx: number) => (
                <div className="commitment-card reveal-on-scroll" key={idx}>
                  <div className="commitment-icon">
                    {idx === 0 && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {idx === 1 && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {idx === 2 && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {idx === 3 && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
 
      {/* Houses Sections by Category */}
      <div className="archive-sections-container">
        {showOnlyFavorites && (
          <div className="favorites-info-wrapper container">
            <div className="favorites-explanation-box reveal-on-scroll is-visible direct-show">
              <div className="explanation-content">
                <h4>
                  <span className="info-icon" style={{ marginRight: "8px" }}>💡</span>
                  {dict.favoritesExplanationTitle}
                </h4>
                <ul>
                  <li>
                    {dict.favoritesExplanationStorage}
                  </li>
                  <li>
                    {dict.favoritesExplanationAccount}
                  </li>
                  <li>
                    {dict.favoritesExplanationCache}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {showSavedConfigurations && (
          <div className="favorites-info-wrapper container">
            <div className="favorites-explanation-box reveal-on-scroll is-visible direct-show">
              <div className="explanation-content">
                <h4>
                  <span className="info-icon" style={{ marginRight: "8px" }}>💡</span>
                  {dict.savedConfigsExplanationTitle}
                </h4>
                <ul>
                  <li>
                    {dict.savedConfigsExplanationStorage}
                  </li>
                  <li>
                    {dict.savedConfigsExplanationAccount}
                  </li>
                  <li>
                    {dict.savedConfigsExplanationCache}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
 
        {showOnlyFavorites && totalFavoritesCount === 0 && (
          <div className="favorites-empty-state container reveal-on-scroll is-visible">
            <div className="empty-state-content">
              <div className="empty-state-icon" style={{ display: "flex", justifyContent: "center", alignItems: "center", background: "#fef2f2", border: "1px solid #fca5a5" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h3>{dict.favoritesEmptyTitle}</h3>
              <p>
                {dict.favoritesEmptyText}
              </p>
              <button className="primary-btn" onClick={() => setShowOnlyFavorites(false)}>
                {dict.favoritesEmptyBtn}
              </button>
            </div>
          </div>
        )}

        {showSavedConfigurations && totalSavedConfigsCount === 0 && (
          <div className="favorites-empty-state container reveal-on-scroll is-visible">
            <div className="empty-state-content">
              <div className="empty-state-icon" style={{ display: "flex", justifyContent: "center", alignItems: "center", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5E6F4F" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3>{dict.savedConfigsEmptyTitle}</h3>
              <p>
                {dict.savedConfigsEmptyText}
              </p>
              <button className="primary-btn" onClick={() => setShowSavedConfigurations(false)}>
                {dict.savedConfigsEmptyBtn}
              </button>
            </div>
          </div>
        )}
 
        {initialCategories.map((category) => {
          const houses = initialHouses.filter((house) => {
            const matchesCategory = house.categorySlug === category.slug;
            if (!matchesCategory) return false;
            if (showOnlyFavorites) return isFavorite(house.slug);
            if (showSavedConfigurations) return hasSavedConfig(house.slug);
            return true;
          });
          if (houses.length === 0) return null;
          return (
            <div className="archive-house-section" id={category.id} key={category.id}>
              <div className="container">
                <div className="section-heading-block reveal-on-scroll">
                  <h2>{category.title}</h2>
                  <span className="model-count-label">
                    {houses.length} {houses.length > 1 ? dict.modelsCount : dict.modelCount}
                  </span>
                </div>
                <div className="house-archive-grid">
                  {houses.map((house) => (
                    <HouseCard key={house.slug} house={house} locale={locale} dict={dict} onOpenPlanimetry={setActivePlanimetry} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activePlanimetry && (
        <div
          className="material-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActivePlanimetry(null);
          }}
        >
          <div className="material-modal" role="dialog" aria-modal="true" aria-labelledby="planimetry-modal-title">
            <button
              type="button"
              className="material-modal-close"
              onClick={() => setActivePlanimetry(null)}
            >
              ×
            </button>
            <div className="material-modal-media">
              <Image
                src={activePlanimetry.planimetry || '/api/media/file/asebra-me-atike_default.jpg'}
                alt={`Planimetria - ${activePlanimetry.title}`}
                width={1100}
                height={620}
                className="modal-image-el"
                style={{ width: "100%", height: "100%", objectFit: "contain", background: "#f9fafb", padding: "20px" }}
              />
            </div>
            <div className="material-modal-content" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <p className="material-modal-kicker">{activePlanimetry.categoryName}</p>
              <h2 id="planimetry-modal-title" style={{ margin: "0 0 10px 0" }}>{activePlanimetry.title}</h2>
              <p style={{ margin: "0 0 24px 0", color: "#4B5563", fontSize: "14px", lineHeight: "1.6" }}>
                {locale === "en" ? "Planimetry / Floor plan layout details. This plan showcases the interior room distribution and usable living spaces." :
                 locale === "de" ? "Planimetrie / Grundriss. Dieser Plan zeigt die Aufteilung der Innenräume und die nutzbaren Wohnflächen." :
                 locale === "nl" ? "Planimetrie / Plattegrond. Dit plan toont de indeling van de binnenruimtes en de bruikbare woonoppervlaktes." :
                 "Planimétrie / Plan de sol. Ce plan présente l'aménagement intérieur et la distribution des espaces de vie."}
              </p>
              <div className="material-attributes-grid" style={{ marginTop: "0" }}>
                {activePlanimetry.neto && (
                  <div className="material-attribute-card">
                    <span className="material-attribute-label">Neto</span>
                    <span className="material-attribute-value">{activePlanimetry.neto} m²</span>
                  </div>
                )}
                {activePlanimetry.bruto && (
                  <div className="material-attribute-card">
                    <span className="material-attribute-label">Bruto</span>
                    <span className="material-attribute-value">{activePlanimetry.bruto} m²</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
