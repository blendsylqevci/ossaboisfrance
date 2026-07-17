"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatArchiveStartingPrice } from "@/data/houses-archive";
import { CompareSlider } from "@/components/HousesArchive";
import { useFavorites } from "@/lib/favorites";
import { publicMediaUrl } from "@/lib/media-url";
import { PlanimetryModal } from "@/components/PlanimetryModal";
import type { PlanimetryRoom } from "@/lib/planimetry-rooms";

type House = {
  slug: string;
  title: string;
  description: string;
  image: string;
  imageBardage?: string;
  price60x160?: number | null;
  neto?: number | null;
  bruto?: number | null;
  planimetry?: string | null;
  planimetryVisual?: string | null;
  planimetryImageCropRight?: number | null;
  planimetryRooms?: PlanimetryRoom[];
  categoryName?: string;
};

type ProductsGridProps = {
  houses: House[];
  locale: string;
  initialActiveIndex?: number;
  onReachEnd?: () => void;
  onReachStart?: () => void;
  dict: {
    startingFrom: string;
    onQuote: string;
    configureBtn: string;
  };
};

export function ProductsGrid({
  houses,
  locale,
  initialActiveIndex = 0,
  onReachEnd,
  onReachStart,
  dict,
}: ProductsGridProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activePlanimetry, setActivePlanimetry] = useState<House | null>(null);
  const { isFavorite, handleToggle } = useFavorites();

  const renderPlanimetryModal = () => (
    <PlanimetryModal
      open={Boolean(activePlanimetry)}
      onClose={() => setActivePlanimetry(null)}
      locale={locale as "fr" | "en" | "de" | "nl"}
      title={activePlanimetry?.title ?? ""}
      imageSrc={
        activePlanimetry?.planimetry ||
        publicMediaUrl("asebra-me-atike_default.jpg")
      }
      imageAlt={`Planimétrie - ${activePlanimetry?.title ?? ""}`}
    />
  );

  // Mobile touch gesture tracking states
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".compare-slider")) {
      return; // Ignore swipes that originate from the compare slider handle
    }
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".compare-slider")) {
      return;
    }
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset index when initialActiveIndex changes or houses change
  useEffect(() => {
    setCurrentIndex(initialActiveIndex);
  }, [initialActiveIndex, houses]);

  const nextSlide = () => {
    if (currentIndex === houses.length - 1) {
      if (onReachEnd) {
        onReachEnd();
      } else {
        setCurrentIndex(0);
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex === 0) {
      if (onReachStart) {
        onReachStart();
      } else {
        setCurrentIndex(houses.length - 1);
      }
    } else {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (isMobile) {
    return (
      <>
        <div className="mobile-products-carousel">
          <div 
            className="mobile-products-viewport"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div 
              className="mobile-products-track"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
                transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {houses.map((house) => (
                <div className="mobile-product-slide" key={house.slug}>
                  <div className="prod-card">
                    <div className="prod-card-img-container relative" style={{ height: "320px" }}>
                      {house.image && house.imageBardage && house.image !== house.imageBardage ? (
                        <CompareSlider
                          key={`${house.image}|${house.imageBardage}`}
                          imageA={house.image}
                          imageB={house.imageBardage}
                          altA={`${house.title} — Enduit`}
                          altB={`${house.title} — Bardage`}
                        />
                      ) : house.image ? (
                        <Image
                          src={house.image}
                          alt={house.title}
                          width={380}
                          height={320}
                          style={{ objectFit: "cover", width: "100%", height: "320px" }}
                          priority
                        />
                      ) : null}
                      
                      <button
                        className="card-planimetry-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActivePlanimetry(house);
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
                    <div className="prod-card-content">
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", width: "100%", marginBottom: "8px", flexWrap: "wrap" }}>
                          <h3 className="prod-card-title" style={{ margin: 0 }}>{house.title}</h3>
                          {house.neto && (
                            <div style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                              <span style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px", opacity: 0.75 }}>
                                  <rect x="3" y="3" width="18" height="18" rx="2" />
                                  <path d="M9 3v18M9 12h12" />
                                </svg>
                                Neto: {house.neto} m²
                              </span>
                              <span style={{ color: "#E5E7EB", userSelect: "none" }}>|</span>
                              <span style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px", opacity: 0.75 }}>
                                  <rect x="5" y="5" width="14" height="14" rx="1.5" />
                                  <path d="M2 5h3M2 19h3M19 5h3M19 19h3M5 2v3M19 2v3M5 19v3M19 19v3" />
                                </svg>
                                Bruto: {house.bruto} m²
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="prod-card-desc">{house.description}</p>
                      </div>
                      
                      <div className="prod-card-footer">
                        {(() => {
                          const formattedPrice = formatArchiveStartingPrice(house.price60x160 ?? null);
                          return formattedPrice ? (
                            <div className="prod-card-price-row">
                              <span className="prod-price-label">{dict.startingFrom}</span>
                              <span className="prod-price-val">{formattedPrice} €</span>
                            </div>
                          ) : (
                            <div className="prod-card-price-row price-placeholder">
                              <span className="prod-price-label">{dict.onQuote}</span>
                            </div>
                          );
                        })()}
                        
                        <Link
                          href={`/${locale}/maisons/${house.slug}`}
                          className="prod-card-button"
                        >
                          <span>{dict.configureBtn}</span>
                          <svg className="prod-btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel navigation controls (arrows and dots using original design classes) */}
          {houses.length > 1 && (
            <div className="prod-nav-controls">
              <button className="prod-prev-btn" onClick={prevSlide} aria-label="Précédent">
                ‹
              </button>
              <div className="prod-dots-indicator">
                {houses.map((_, idx) => (
                  <button
                    key={idx}
                    className={`prod-dot-indicator ${idx === currentIndex ? "active" : ""}`}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Aller au slide ${idx + 1}`}
                  />
                ))}
              </div>
              <button className="prod-next-btn" onClick={nextSlide} aria-label="Suivant">
                ›
              </button>
            </div>
          )}
        </div>
        {renderPlanimetryModal()}
      </>
    );
  }

  // Desktop layout (standard 3-column grid)
  return (
    <>
      <div className="products-layout-wrapper">
      <div className="products-grid-container">
        {houses.map((house) => {
          return (
            <div className="prod-card" key={house.slug}>
              <div className="prod-card-img-container relative" style={{ height: "320px" }}>
                {house.image && house.imageBardage && house.image !== house.imageBardage ? (
                  <CompareSlider
                    key={`${house.image}|${house.imageBardage}`}
                    imageA={house.image}
                    imageB={house.imageBardage}
                    altA={`${house.title} — Enduit`}
                    altB={`${house.title} — Bardage`}
                  />
                ) : house.image ? (
                  <Image
                    src={house.image}
                    alt={house.title}
                    width={380}
                    height={320}
                    style={{ objectFit: "cover", width: "100%", height: "320px" }}
                  />
                ) : null}
                
                <button
                  className="card-planimetry-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActivePlanimetry(house);
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
              <div className="prod-card-content">
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", width: "100%", marginBottom: "8px", flexWrap: "wrap" }}>
                    <h3 className="prod-card-title" style={{ margin: 0 }}>{house.title}</h3>
                    {house.neto && (
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                        <span style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px", opacity: 0.75 }}>
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M9 3v18M9 12h12" />
                          </svg>
                          Neto: {house.neto} m²
                        </span>
                        <span style={{ color: "#E5E7EB", userSelect: "none" }}>|</span>
                        <span style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px", opacity: 0.75 }}>
                            <rect x="5" y="5" width="14" height="14" rx="1.5" />
                            <path d="M2 5h3M2 19h3M19 5h3M19 19h3M5 2v3M19 2v3M5 19v3M19 19v3" />
                          </svg>
                          Bruto: {house.bruto} m²
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="prod-card-desc">{house.description}</p>
                </div>
                
                <div className="prod-card-footer">
                  {(() => {
                    const formattedPrice = formatArchiveStartingPrice(house.price60x160 ?? null);
                    return formattedPrice ? (
                      <div className="prod-card-price-row">
                        <span className="prod-price-label">{dict.startingFrom}</span>
                        <span className="prod-price-val">{formattedPrice} €</span>
                      </div>
                    ) : (
                      <div className="prod-card-price-row price-placeholder">
                        <span className="prod-price-label">{dict.onQuote}</span>
                      </div>
                    );
                  })()}
                  
                  <Link
                    href={`/${locale}/maisons/${house.slug}`}
                    className="prod-card-button"
                  >
                    <span>{dict.configureBtn}</span>
                    <svg className="prod-btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    {renderPlanimetryModal()}
  </>
  );
}
