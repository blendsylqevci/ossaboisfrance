"use client";

import { useState } from "react";
import { HouseArchiveCategory, HouseArchiveItem } from "@/data/houses-archive";
import { ProductsGrid } from "./ProductsGrid";

type FeaturedProductsSectionProps = {
  locale: string;
  categories: HouseArchiveCategory[];
  allHouses: HouseArchiveItem[];
};

export function FeaturedProductsSection({
  locale,
  categories,
  allHouses,
}: FeaturedProductsSectionProps) {
  // Filter out any categories that have 0 houses in our data to keep the carousel clean
  const activeCategories = categories.filter((cat) => {
    const count = allHouses.filter((h) => h.category === cat.sourceCategory).length;
    return count > 0;
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === activeCategories.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeCategories.length - 1 : prev - 1));
  };

  return (
    <section className="wp-section-products">
      <div className="container">
        <div className="products-section-header-block">
          <div className="products-section-header">
            <div className="header-left">
              <h2 className="products-title">Découvrez nos annonces en vedette</h2>
              <p className="products-subtitle">Découvrez une sélection de modèles populaires, conçus pour répondre à tous les besoins.</p>
            </div>
            <div className="header-right">
              <a href={`/${locale}/maisons`} className="view-all-products-btn">
                <span>Voir tous les produits</span>
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
                  className={`prod-category-tab-btn ${idx === currentIndex ? "active" : ""}`}
                  onClick={() => setCurrentIndex(idx)}
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
              {activeCategories.map((cat) => {
                // Get up to 6 houses for this category
                const categoryHouses = allHouses
                  .filter((h) => h.category === cat.sourceCategory)
                  .slice(0, 6);

                return (
                  <div
                    className="prod-slider-slide"
                    key={cat.id}
                    style={{ flex: "0 0 100%", width: "100%" }}
                  >
                    <ProductsGrid houses={categoryHouses} locale={locale} />
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
                  onClick={() => setCurrentIndex(idx)}
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
