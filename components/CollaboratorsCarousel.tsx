"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type CollabLogo = {
  src: string;
  alt: string;
};

type CollaboratorsCarouselProps = {
  logos: CollabLogo[];
};

export function CollaboratorsCarousel({ logos }: CollaboratorsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % (logos.length - 3 > 0 ? logos.length - 3 : 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [logos.length]);

  return (
    <div className="collabs-carousel">
      <div className="collabs-carousel-viewport">
        <div
          className="collabs-carousel-track"
          style={{
            transform: `translateX(-${currentIndex * 25}%)`,
          }}
        >
          {logos.map((logo, index) => (
            <div className="collabs-carousel-slide" key={index}>
              <Image
                src={logo.src}
                alt={logo.alt}
                width={280}
                height={120}
                style={{ objectFit: "contain", maxHeight: "110px" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
