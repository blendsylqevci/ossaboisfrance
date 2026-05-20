"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatArchiveStartingPrice } from "@/data/houses-archive";

type House = {
  slug: string;
  title: string;
  description: string;
  image: string;
  price60x160?: number;
};

type ProductsCarouselProps = {
  houses: House[];
  locale: string;
};

export function ProductsCarousel({ houses, locale }: ProductsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(3);

  // Reset index when houses change to avoid out of bounds slide issues
  useEffect(() => {
    setCurrentIndex(0);
  }, [houses]);

  // Responsive slides calculation
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesToShow(1);
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, houses.length - slidesToShow);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  // Auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 8000);
    return () => clearInterval(interval);
  }, [maxIndex, slidesToShow]);

  const slideWidth = 100 / slidesToShow;

  return (
    <div className="prod-slider-container">
      <div className="prod-slider-viewport">
        <div
          className="prod-slider-track"
          style={{
            transform: `translateX(-${currentIndex * slideWidth}%)`,
          }}
        >
          {houses.map((house) => {
            const price = formatArchiveStartingPrice(house.price60x160 ?? null);
            return (
              <div
                className="prod-slider-slide"
                key={house.slug}
                style={{ flex: `0 0 ${slideWidth}%`, padding: "0 12px" }}
              >
                <div className="prod-card">
                  <div className="prod-card-img-container">
                    <Image
                      src={house.image}
                      alt={house.title}
                      width={400}
                      height={280}
                      style={{ objectFit: "cover", width: "100%", height: "280px" }}
                    />
                  </div>
                  <div className="prod-card-content">
                    <h3 className="prod-card-title">{house.title}</h3>
                    <p className="prod-card-desc">{house.description}</p>
                    
                    <div className="prod-card-footer">
                      {price && (
                        <div className="prod-card-price-row">
                          <span className="prod-price-label">À partir de</span>
                          <strong className="prod-price-val">{price} €</strong>
                        </div>
                      )}
                      
                      <Link
                        href={`/${locale}/maisons/${house.slug}`}
                        className="prod-card-button"
                      >
                        <span>Voir et configurer</span>
                        <svg className="prod-btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="prod-nav-controls">
        <button className="prod-prev-btn" onClick={prevSlide} aria-label="Précédent">
          ‹
        </button>
        
        <div className="prod-dots-indicator">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
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
  );
}
