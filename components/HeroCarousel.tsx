"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type HeroCarouselProps = {
  images: string[];
};

export function HeroCarousel({ images }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="hero-carousel-container">
      <div
        className="hero-carousel-track"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {images.map((src, index) => (
          <div className="hero-carousel-slide" key={index}>
            <Image
              src={src}
              alt={`Slide ${index + 1}`}
              fill
              sizes="100vw"
              priority={index === 0}
              style={{ objectFit: "cover" }}
            />
          </div>
        ))}
      </div>

      <div className="hero-carousel-dots">
        {images.map((_, index) => (
          <button
            key={index}
            className={`hero-carousel-dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Aller au slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
