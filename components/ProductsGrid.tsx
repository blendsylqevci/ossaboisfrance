"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatArchiveStartingPrice } from "@/data/houses-archive";
import { CompareSlider } from "@/components/HousesArchive";

type House = {
  slug: string;
  title: string;
  description: string;
  image: string;
  imageBardage?: string;
  price60x160?: number | null;
};

type ProductsGridProps = {
  houses: House[];
  locale: string;
  initialActiveIndex?: number;
  onReachEnd?: () => void;
  onReachStart?: () => void;
};

export function ProductsGrid({
  houses,
  locale,
  initialActiveIndex = 0,
  onReachEnd,
  onReachStart,
}: ProductsGridProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

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
      <div className="mobile-products-carousel">
        <div className="mobile-products-viewport">
          <div
            className="mobile-products-track"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {houses.map((house) => (
              <div className="mobile-product-slide" key={house.slug}>
                <div className="prod-card">
                  <div className="prod-card-img-container relative" style={{ height: "320px" }}>
                    {house.image && house.imageBardage && house.image !== house.imageBardage ? (
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
                        width={380}
                        height={320}
                        style={{ objectFit: "cover", width: "100%", height: "320px" }}
                        priority
                      />
                    ) : null}
                  </div>
                  <div className="prod-card-content">
                    <div>
                      <h3 className="prod-card-title">{house.title}</h3>
                      <p className="prod-card-desc">{house.description}</p>
                    </div>
                    
                    <div className="prod-card-footer">
                      {(() => {
                        const formattedPrice = formatArchiveStartingPrice(house.price60x160 ?? null);
                        return formattedPrice ? (
                          <div className="prod-card-price-row">
                            <span className="prod-price-label">À partir de</span>
                            <span className="prod-price-val">{formattedPrice} €</span>
                          </div>
                        ) : (
                          <div className="prod-card-price-row" style={{ minHeight: "24px" }} />
                        );
                      })()}
                      
                      <Link
                        href={`/${locale}/maisons/${house.slug}`}
                        className="prod-card-button"
                      >
                        <span>View & Configure</span>
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
    );
  }

  // Desktop layout (standard 3-column grid)
  return (
    <div className="products-layout-wrapper">
      <div className="products-grid-container">
        {houses.map((house) => {
          return (
            <div className="prod-card" key={house.slug}>
              <div className="prod-card-img-container relative" style={{ height: "320px" }}>
                {house.image && house.imageBardage && house.image !== house.imageBardage ? (
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
                    width={380}
                    height={320}
                    style={{ objectFit: "cover", width: "100%", height: "320px" }}
                  />
                ) : null}
              </div>
              <div className="prod-card-content">
                <div>
                  <h3 className="prod-card-title">{house.title}</h3>
                  <p className="prod-card-desc">{house.description}</p>
                </div>
                
                <div className="prod-card-footer">
                  {(() => {
                    const formattedPrice = formatArchiveStartingPrice(house.price60x160 ?? null);
                    return formattedPrice ? (
                      <div className="prod-card-price-row">
                        <span className="prod-price-label">À partir de</span>
                        <span className="prod-price-val">{formattedPrice} €</span>
                      </div>
                    ) : (
                      // Keep spacing empty so buttons align nicely
                      <div className="prod-card-price-row" style={{ minHeight: "24px" }} />
                    );
                  })()}
                  
                  <Link
                    href={`/${locale}/maisons/${house.slug}`}
                    className="prod-card-button"
                  >
                    <span>View & Configure</span>
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
  );
}

