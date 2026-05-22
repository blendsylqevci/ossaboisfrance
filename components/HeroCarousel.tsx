"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type HeroCarouselProps = {
  images: string[];
};

export function HeroCarousel({ images }: HeroCarouselProps) {
  return (
    <div className="hero-carousel-container">
      <div className="hero-carousel-slide" style={{ width: "100%", height: "100%" }}>
        <video
          src="/images/hero/mp_.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{ objectFit: "cover", width: "100%", height: "100%", display: "block" }}
        />
      </div>
    </div>
  );
}
