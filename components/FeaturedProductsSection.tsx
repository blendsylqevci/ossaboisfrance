"use client";

import { useState, useEffect, useRef } from "react";
import { ProductsGrid } from "./ProductsGrid";

type Category = {
  id: string;
  title: string;
  slug: string;
};

type FeaturedHouseItem = {
  slug: string;
  title: string;
  categorySlug: string;
  description: string;
  image: string;
  imageBardage?: string;
  price60x160: number | null;
  neto?: number | null;
  bruto?: number | null;
  planimetry?: string | null;
  planimetryVisual?: string | null;
  planimetryImageCropRight?: number | null;
  planimetryRooms?: { label: string; area: number }[];
};

type FeaturedProductsSectionProps = {
  locale: string;
  categories: Category[];
  allHouses: FeaturedHouseItem[];
  dict: {
    featuredTitle: string;
    featuredSubtitle: string;
    exploreCta: string;
    startingFrom: string;
    onQuote: string;
    configureBtn: string;
  };
};

export function FeaturedProductsSection({
  locale,
  categories,
  allHouses,
  dict,
}: FeaturedProductsSectionProps) {
  // Filter out any categories that have 0 houses in our data to keep the carousel clean
  const activeCategories = categories.filter((cat) => {
    const count = allHouses.filter((h) => h.categorySlug === cat.slug).length;
    return count > 0;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [houseInitialIndex, setHouseInitialIndex] = useState(0);
  const activeTabRef = useRef<HTMLButtonElement | null>(null);
  const prevIndexRef = useRef<number | undefined>(undefined);

  // Scroll active tab into view on mobile
  useEffect(() => {
    if (prevIndexRef.current === undefined) {
      prevIndexRef.current = currentIndex;
      return;
    }
    if (prevIndexRef.current === currentIndex) {
      return;
    }
    prevIndexRef.current = currentIndex;

    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentIndex]);

  const nextSlide = () => {
    setHouseInitialIndex(0);
    setCurrentIndex((prev) => (prev === activeCategories.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setHouseInitialIndex(0);
    setCurrentIndex((prev) => (prev === 0 ? activeCategories.length - 1 : prev - 1));
  };

  return (
    <section className="wp-section-products">
      <div className="container">
        <div className="products-section-header-block">
          <div className="products-section-header">
            <div className="header-left">
              <h2 className="products-title">{dict.featuredTitle}</h2>
              <p className="products-subtitle">{dict.featuredSubtitle}</p>
            </div>
            <div className="header-right">
              <a href={`/${locale}/maisons`} className="view-all-products-btn">
                <span>{dict.exploreCta}</span>
                <svg className="btn-vector-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="prod-category-tabs-container">
            <div className="prod-category-tabs">
              {activeCategories.map((cat, idx) => (
                <button
                  key={cat.id}
                  ref={idx === currentIndex ? activeTabRef : null}
                  className={`prod-category-tab-btn ${idx === currentIndex ? "active" : ""}`}
                  onClick={() => {
                     setHouseInitialIndex(0);
                     setCurrentIndex(idx);
                  }}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>
        </div>


        {/* Sliding Viewport containing a grid of 6 houses per slide */}
        <div className="prod-slider-container">
          <div className="prod-slider-viewport">
            <div
              className="prod-slider-track"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {activeCategories.map((cat, idx) => {
                // Get up to 6 houses for this category
                const categoryHouses = allHouses
                  .filter((h) => h.categorySlug === cat.slug)
                  .slice(0, 6);

                return (
                  <div
                    className="prod-slider-slide"
                    key={cat.id}
                    style={{ flex: "0 0 100%", width: "100%" }}
                  >
                    <ProductsGrid
                      houses={categoryHouses}
                      locale={locale}
                      initialActiveIndex={idx === currentIndex ? houseInitialIndex : 0}
                      onReachEnd={() => {
                        const nextCatIdx = (currentIndex + 1) % activeCategories.length;
                        setHouseInitialIndex(0);
                        setCurrentIndex(nextCatIdx);
                      }}
                      onReachStart={() => {
                        const prevCatIdx = (currentIndex - 1 + activeCategories.length) % activeCategories.length;
                        const prevCat = activeCategories[prevCatIdx];
                        const prevCategoryHousesCount = allHouses.filter((h) => h.categorySlug === prevCat.slug).length;
                        const lastHouseIdx = Math.max(0, Math.min(prevCategoryHousesCount, 6) - 1);
                        setHouseInitialIndex(lastHouseIdx);
                        setCurrentIndex(prevCatIdx);
                      }}
                      dict={{
                        startingFrom: dict.startingFrom,
                        onQuote: dict.onQuote,
                        configureBtn: dict.configureBtn,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation controls at the bottom */}
          <div className="prod-nav-controls">
            <button className="prod-prev-btn" onClick={prevSlide} aria-label="Précédent">
              ‹
            </button>
            
            <div className="prod-dots-indicator">
              {activeCategories.map((_, idx) => (
                <button
                  key={idx}
                  className={`prod-dot-indicator ${idx === currentIndex ? "active" : ""}`}
                  onClick={() => {
                    setHouseInitialIndex(0);
                    setCurrentIndex(idx);
                  }}
                  aria-label={`Aller au slide ${idx + 1}`}
                />
              ))}
            </div>

            <button className="prod-next-btn" onClick={nextSlide} aria-label="Suivant">
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
