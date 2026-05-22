"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type HouseLayersScrollProps = {
  locale: string;
};

export default function HouseLayersScroll({ locale }: HouseLayersScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalHeight = rect.height - window.innerHeight;
      if (totalHeight <= 0) return;

      const scrolled = -rect.top;
      const currentProgress = Math.min(Math.max(scrolled / totalHeight, 0), 1);
      setProgress(currentProgress);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div ref={containerRef} className="hl-scroll-container">
      {/* Background radial gradient glow elements for organic daylight depth */}
      <div className="hl-decor-top" />
      <div className="hl-decor-bottom" />

      {/* Sticky fullscreen viewport */}
      <div className="hl-sticky-viewport">

        {/* HOUSE CANVAS (Centered full-screen visual) */}
        <div className="hl-canvas-column scrolly-cinematic">
          {/* Blueprint background grid (very subtle white overlay) */}
          <div className="hl-canvas-grid" />
          
          {/* Center visual frame wrapper */}
          <div className="hl-canvas-wrapper">
            
            {/* 1. Base Structure / Background - Always Active */}
            <div className="hl-layer-image active">
              <Image
                src="/images/house-layers/calme-atike/1-prapavija.png"
                alt="Fondation"
                fill
                sizes="100vw"
                className="hl-img-el"
                priority
              />
            </div>

            {/* 2. Wooden Frame / Console (Active >= 12%, Slide from Left) */}
            <div className={`hl-layer-image from-left ${progress >= 0.12 ? "active" : ""}`}>
              <Image
                src="/images/house-layers/calme-atike/2-kons.png"
                alt="Ossature"
                fill
                sizes="100vw"
                className="hl-img-el"
                priority
              />
            </div>

            {/* 3. Rockwool Insulation (Active >= 24%, Drop from Top) */}
            <div className={`hl-layer-image from-top ${progress >= 0.24 ? "active" : ""}`}>
              <Image
                src="/images/house-layers/calme-atike/3-lesh-guri.png"
                alt="Isolation Laine de Roche"
                fill
                sizes="100vw"
                className="hl-img-el"
                priority
              />
            </div>

            {/* 4. Outer Insulation (Active >= 36%, Rise from Bottom) */}
            <div className={`hl-layer-image from-bottom ${progress >= 0.36 ? "active" : ""}`}>
              <Image
                src="/images/house-layers/calme-atike/7-lesh-guri-jashte.png"
                alt="Isolation Extérieure"
                fill
                sizes="100vw"
                className="hl-img-el"
                priority
              />
            </div>

            {/* 5. Wood Fiber Sheathing (Active >= 48%, Slide from Right) */}
            <div className={`hl-layer-image from-right ${progress >= 0.48 ? "active" : ""}`}>
              <Image
                src="/images/house-layers/calme-atike/8-fibra.png"
                alt="Panneaux Fibres"
                fill
                sizes="100vw"
                className="hl-img-el"
                priority
              />
            </div>

            {/* 6. Attic Roof Insulation (Active >= 60%, Drop from Top) */}
            <div className={`hl-layer-image from-top ${progress >= 0.60 ? "active" : ""}`}>
              <Image
                src="/images/house-layers/calme-atike/9-stiropori-atikes.png"
                alt="Styropor Attique"
                fill
                sizes="100vw"
                className="hl-img-el"
                priority
              />
            </div>

            {/* 7. EPDM Waterproofing (Active >= 72%, Drop from Top) */}
            <div className={`hl-layer-image from-top ${progress >= 0.72 ? "active" : ""}`}>
              <Image
                src="/images/house-layers/calme-atike/10-epdm.png"
                alt="Étanchéité EPDM"
                fill
                sizes="100vw"
                className="hl-img-el"
                priority
              />
            </div>

            {/* 8. White Facade Finish (Active >= 82%, Rise from Bottom) */}
            <div className={`hl-layer-image from-bottom ${progress >= 0.82 ? "active" : ""}`}>
              <Image
                src="/images/house-layers/calme-atike/11-fasada-e-bardhe.png"
                alt="Crépi Blanc"
                fill
                sizes="100vw"
                className="hl-img-el"
                priority
              />
            </div>

            {/* 9. Premium Aluminium Windows (Active >= 92%, Fly in from Front) */}
            <div className={`hl-layer-image from-front ${progress >= 0.92 ? "active" : ""}`}>
              <Image
                src="/images/house-layers/calme-atike/13-dritare-alumin.png"
                alt="Menuiserie Aluminium"
                fill
                sizes="100vw"
                className="hl-img-el"
                priority
              />
            </div>

          </div>

          {/* Top progress indicator bar */}
          <div className="hl-top-scroll-line">
            <div className="hl-top-scroll-fill" style={{ width: `${progress * 100}%` }} />
          </div>

        </div>

      </div>
    </div>
  );
}
