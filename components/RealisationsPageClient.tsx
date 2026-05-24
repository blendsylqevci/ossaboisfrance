"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Locale } from "@/lib/i18n";

type Project = {
  id: string;
  title: string;
  category: string;
  location: string;
  area: string;
  images: string[];
};

type RealisationsPageClientProps = {
  locale: Locale;
  dict: any;
};

const projectsData: Project[] = [
  {
    id: "australe",
    title: "Maison Australe",
    category: "Toiture terrasse",
    location: "Savoie, France",
    area: "145 m²",
    images: [
      "https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-7-scaled.jpg",
      "https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-1-scaled.jpg",
      "https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-2-scaled.jpg",
      "https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-3-scaled.jpg",
      "https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-4-1-scaled.jpg",
      "https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-5-scaled.jpg"
    ]
  },
  {
    id: "boreale-me-atike",
    title: "Maison Boréale avec Attique",
    category: "Toiture terrasse",
    location: "Chamonix, France",
    area: "120 m²",
    images: [
      "/images/houses/Boreale me atike/7 boreale.jpg",
      "https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-1-scaled.jpg",
      "https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-2-scaled.jpg"
    ]
  },
  {
    id: "calme",
    title: "Maison Calme",
    category: "Toiture terrasse",
    location: "Gironde, France",
    area: "110 m²",
    images: [
      "https://ossaboisfrance.com/wp-content/uploads/2025/12/7-CALME-scaled.jpg",
      "https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-3-scaled.jpg",
      "https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-4-1-scaled.jpg"
    ]
  },
  {
    id: "ambre-me-atike",
    title: "Maison Ambre avec Attique",
    category: "Toiture terrasse",
    location: "Haute-Savoie, France",
    area: "135 m²",
    images: [
      "https://ossaboisfrance.com/wp-content/uploads/2025/12/7-ambre-scaled.jpg",
      "https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-5-scaled.jpg",
      "https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-7-scaled.jpg"
    ]
  },
  {
    id: "loren",
    title: "Maison Loren",
    category: "Toiture terrasse",
    location: "Landes, France",
    area: "98 m²",
    images: [
      "https://ossaboisfrance.com/wp-content/uploads/2025/12/LOREN-7-scaled.jpg",
      "https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-1-scaled.jpg"
    ]
  },
  {
    id: "emmy",
    title: "Maison Emmy",
    category: "Avec étage",
    location: "Yvelines, France",
    area: "165 m²",
    images: [
      "https://ossaboisfrance.com/wp-content/uploads/2025/12/EMMY-7-scaled.jpg",
      "https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-2-scaled.jpg"
    ]
  },
  {
    id: "cristal",
    title: "Maison Cristal",
    category: "Combles aménageables",
    location: "Essonne, France",
    area: "150 m²",
    images: [
      "https://ossaboisfrance.com/wp-content/uploads/2025/12/cristal-comble-7-scaled.jpg",
      "https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-3-scaled.jpg"
    ]
  }
];

export function RealisationsPageClient({ locale, dict }: RealisationsPageClientProps) {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const t = dict?.realisations || {};

  // Localized filter categories names
  const categoryLabels: Record<string, string> = {
    "Tous": t.filters?.all || (locale === "en" ? "All projects" : locale === "de" ? "Alle Projekte" : locale === "nl" ? "Alle projecten" : "Tous les projets"),
    "Toiture terrasse": t.filters?.terrace || (locale === "en" ? "Flat Roof" : locale === "de" ? "Dachterrasse" : locale === "nl" ? "Dakterras" : "Toiture terrasse"),
    "Avec étage": t.filters?.stage || (locale === "en" ? "Two-story" : locale === "de" ? "Mit Etage" : locale === "nl" ? "Met verdieping" : "Avec étage"),
    "Combles aménageables": t.filters?.classic || (locale === "en" ? "Convertible Loft" : locale === "de" ? "Ausbaubares Dachgeschoss" : locale === "nl" ? "Inrichtbare zolder" : "Combles aménageables")
  };

  const categories = ["Tous", "Toiture terrasse", "Avec étage", "Combles aménageables"];

  // Helper function to translate category name
  const translateCategory = (cat: string) => {
    return categoryLabels[cat] || cat;
  };

  // Helper function to translate model titles and details
  const translateTitle = (title: string) => {
    let output = title;
    if (locale === "en") {
      output = output.replace("Maison ", "House ");
      output = output.replace(" avec Attique", " with Penthouse");
    } else if (locale === "de") {
      output = output.replace("Maison ", "Haus ");
      output = output.replace(" avec Attique", " mit Attika");
    } else if (locale === "nl") {
      output = output.replace("Maison ", "Huis ");
      output = output.replace(" avec Attique", " met Attiek");
    }
    return output;
  };

  const translateLocation = (loc: string) => {
    let output = loc;
    if (locale !== "fr") {
      output = output.replace(", France", "");
    }
    return output;
  };

  const trans = {
    title: t.title || (locale === "en" ? "Our Creations" : locale === "de" ? "Unsere Umsetzungen" : locale === "nl" ? "Onze Realisaties" : "Nos réalisations"),
    subtitle: t.subtitle || (locale === "en"
      ? "Discover our modular timber frame house projects, engineered with precision in our prefabrication factory and assembled across the region."
      : locale === "de" ? "Entdecken Sie unsere modularen Holzrahmenhaus-Projekte, präzise in unserem Werk gefertigt und in der gesamten Region montiert."
      : locale === "nl" ? "Ontdek onze modulaire houtskeletbouwprojecten, met precisie gebouwd in onze fabriek en gemonteerd in de hele regio."
      : "Découvrez nos projets de maisons modulaires à ossature bois, conçues avec précision dans notre usine de préfabrication et installées à travers la France."),
    viewAlbum: locale === "en" ? "View album" : locale === "de" ? "Album ansehen" : locale === "nl" ? "Bekijk album" : "Voir l'album",
    photosCount: (count: number) => locale === "en" ? `${count} photos` : locale === "de" ? `${count} Fotos` : locale === "nl" ? `${count} foto's` : `${count} photos`,
    closeLabel: locale === "en" ? "Close" : locale === "de" ? "Schließen" : locale === "nl" ? "Sluiten" : "Fermer",
    prevLabel: locale === "en" ? "Previous image" : locale === "de" ? "Vorheriges Bild" : locale === "nl" ? "Vorige afbeelding" : "Image précédente",
    nextLabel: locale === "en" ? "Next image" : locale === "de" ? "Nächstes Bild" : locale === "nl" ? "Volgende afbeelding" : "Image suivante"
  };

  const filteredProjects = activeCategory === "Tous"
    ? projectsData
    : projectsData.filter((project) => project.category === activeCategory);

  useEffect(() => {
    document.body.style.overflow = selectedProject ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProject]);

  const openLightbox = (project: Project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
  };

  const closeLightbox = () => {
    setSelectedProject(null);
  };

  const showNextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedProject) return;
    setCurrentImageIndex((prev) =>
      prev === selectedProject.images.length - 1 ? 0 : prev + 1
    );
  };

  const showPrevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedProject) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? selectedProject.images.length - 1 : prev - 1
    );
  };

  // Keyboard navigation
  useEffect(() => {
    if (!selectedProject) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        showNextImage();
      } else if (e.key === "ArrowLeft") {
        showPrevImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProject]);

  return (
    <section className="realisations-page">
      <div className="container">
        <h1>{trans.title}</h1>
        <p className="realisations-subtitle">
          {trans.subtitle}
        </p>

        {/* ─── CATEGORY FILTERS ─── */}
        <div className="portfolio-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {translateCategory(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* ─── GALLERY GRID ─── */}
      <div className="container gallery-grid">
        {filteredProjects.map((project) => (
          <div
            className="gallery-item clickable"
            key={project.id}
            onClick={() => openLightbox(project)}
          >
            <Image
              src={project.images[0]}
              alt={translateTitle(project.title)}
              width={800}
              height={530}
              sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 30vw"
              priority={project.id === "australe"}
            />
            <div className="gallery-item-overlay">
              <span className="gallery-item-category">{translateCategory(project.category)}</span>
              <h3 className="gallery-item-title">{translateTitle(project.title)}</h3>
              <div className="gallery-item-meta">
                <span>{translateLocation(project.location)}</span>
                <span className="meta-separator">•</span>
                <span>{project.area}</span>
              </div>
              <span className="gallery-view-album">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="album-icon">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                {trans.viewAlbum} ({trans.photosCount(project.images.length)})
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ─── PORTFOLIO LIGHTBOX MODAL ─── */}
      {selectedProject && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-modal" onClick={(e) => e.stopPropagation()}>
            
            {/* Close button */}
            <button className="lightbox-close" onClick={closeLightbox} aria-label={trans.closeLabel}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* Main Stage Image */}
            <div className="lightbox-stage">
              {/* Left Nav Arrow */}
              <button className="lightbox-nav prev" onClick={showPrevImage} aria-label={trans.prevLabel}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>

              {/* Standard img tag avoids absolute positioning bugs inside flex layout */}
              <img
                src={selectedProject.images[currentImageIndex]}
                alt={`${translateTitle(selectedProject.title)} - Photo ${currentImageIndex + 1}`}
                className="lightbox-main-img"
              />

              {/* Right Nav Arrow */}
              <button className="lightbox-nav next" onClick={showNextImage} aria-label={trans.nextLabel}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>

            {/* Info Panel: Titles, stats, pagination */}
            <div className="lightbox-info-bar">
              <div className="lightbox-info-left">
                <h2>{translateTitle(selectedProject.title)}</h2>
                <p className="lightbox-meta-details">
                  <span>{translateCategory(selectedProject.category)}</span>
                  <span className="dot-sep">•</span>
                  <span>{translateLocation(selectedProject.location)}</span>
                  <span className="dot-sep">•</span>
                  <span>{selectedProject.area}</span>
                </p>
              </div>
              <div className="lightbox-info-right">
                <span className="lightbox-counter">
                  {currentImageIndex + 1} / {selectedProject.images.length}
                </span>
              </div>
            </div>

            {/* Thumbnails bar (only displays if project has multiple photos) */}
            {selectedProject.images.length > 1 && (
              <div className="lightbox-thumbnails-container">
                <div className="lightbox-thumbnails-list">
                  {selectedProject.images.map((img, idx) => (
                    <button
                      key={idx}
                      className={`lightbox-thumb-btn ${currentImageIndex === idx ? "active" : ""}`}
                      onClick={() => setCurrentImageIndex(idx)}
                    >
                      <div className="lightbox-thumb-img-wrapper">
                        <img
                          src={img}
                          alt={`Miniature ${idx + 1}`}
                          className="lightbox-thumb-img"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </section>
  );
}
