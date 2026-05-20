"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  formatArchiveStartingPrice,
  houseArchiveCategories,
  houseArchiveItems,
  HouseArchiveItem
} from "@/data/houses-archive";
import { Locale } from "@/lib/i18n";

type HousesArchiveProps = {
  locale: Locale;
};

function HouseCard({ house, locale }: { house: HouseArchiveItem; locale: Locale }) {
  const price = formatArchiveStartingPrice(house.price60x160);

  return (
    <article className="house-archive-card reveal-on-scroll">
      <div className="house-archive-card-image">
        <Image 
          src={house.image} 
          alt={house.title} 
          width={900} 
          height={600} 
          sizes="(max-width: 760px) 100vw, (max-width: 1200px) 50vw, 33vw" 
          priority={false}
        />
        <div className="house-archive-card-badge">
          Structure Bois
        </div>
      </div>
      <div className="house-archive-card-body">
        <span className="house-archive-card-category">{house.category}</span>
        <h3>{house.title}</h3>
        <p className="house-archive-card-desc">{house.description}</p>
        
        <div className="house-archive-card-footer">
          {price ? (
            <div className="house-archive-price">
              <span className="price-label">à partir de</span>
              <strong className="price-val">{price}&nbsp;€</strong>
            </div>
          ) : (
            <div className="house-archive-price price-placeholder">
              <span className="price-label">Sur devis</span>
            </div>
          )}
          <Link className="house-archive-button" href={`/${locale}/maisons/${house.slug}`}>
            <span>Configurer</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function HousesArchive({ locale }: HousesArchiveProps) {
  // Intersection Observer for scroll animations with a safety timeout to ensure React DOM is painted
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let revealElements: NodeListOf<Element> | null = null;

    const timer = setTimeout(() => {
      const observerOptions = {
        root: null,
        rootMargin: "0px 0px -40px 0px",
        threshold: 0.02
      };

      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            if (observer) {
              observer.unobserve(entry.target);
            }
          }
        });
      }, observerOptions);

      revealElements = document.querySelectorAll(".reveal-on-scroll");
      revealElements.forEach((el) => {
        if (observer) observer.observe(el);
      });
    }, 150); // 150ms delay guarantees the DOM nodes are present and painted

    return () => {
      clearTimeout(timer);
      if (observer && revealElements) {
        revealElements.forEach((el) => {
          if (observer) observer.unobserve(el);
        });
      }
    };
  }, []);

  // Translate commitments and titles based on locale
  const isEn = locale === "en";
  
  const pageTitle = isEn ? "House Models" : "Modèles de Maisons";
  const pageSubtitle = isEn 
    ? "Discover our range of premium modular timber-frame homes. Fully customizable to fit your life." 
    : "Découvrez notre gamme de maisons modulaires à ossature bois haut de gamme. Entérieurement personnalisables pour s'adapter à votre vie.";
  
  const commitmentsTitle = isEn ? "Our Commitments & Guarantees" : "Engagements & Garanties";
  const commitmentsSubtitle = isEn
    ? "Building with Ossa Bois France is the guarantee of a serene, sustainable, and high-performance project."
    : "Construire avec Ossa Bois France, c'est l'assurance d'un projet serein, durable et performant.";

  const commitmentsList = [
    {
      title: isEn ? "Decennial Guarantee" : "Garantie Décennale",
      desc: isEn 
        ? "All builder's guarantees required by French law, including ten-year structural insurance." 
        : "Toutes les garanties constructeurs requises par la loi, y compris l'assurance décennale de structure."
    },
    {
      title: isEn ? "RE2020 Compliance" : "Conformité RE2020",
      desc: isEn 
        ? "High thermal performance design meeting the latest ecological and energy savings standards." 
        : "Conception bioclimatique à haute performance thermique, conforme aux normes environnementales RE2020."
    },
    {
      title: isEn ? "Eco-Responsible Wood" : "Bois Éco-responsable",
      desc: isEn 
        ? "Certified premium timber sourced from sustainably managed European forests." 
        : "Matériaux certifiés de haute qualité issus de forêts gérées durablement."
    },
    {
      title: isEn ? "Millimeter Precision" : "Précision Millimétrique",
      desc: isEn 
        ? "Prefabricated in our state-of-the-art facility for swift and perfect assembly on site." 
        : "Préfabrication robotisée en atelier garantissant un assemblage rapide et sans défaut sur chantier."
    }
  ];

  return (
    <section className="houses-archive-page">
      {/* Hero Header */}
      <div className="houses-archive-hero">
        <div className="container">
          <div className="houses-archive-hero-content">
            <span className="hero-kicker">OSSA BOIS FRANCE</span>
            <h1>{pageTitle}</h1>
            <p>{pageSubtitle}</p>
            
            {/* Quick Category Anchors */}
            <div className="category-quick-nav">
              {houseArchiveCategories.map((category) => {
                const count = houseArchiveItems.filter((house) => house.category === category.sourceCategory).length;
                if (count === 0) return null;
                return (
                  <a href={`#${category.id}`} className="category-nav-badge" key={category.id}>
                    <span>{category.title}</span>
                    <span className="badge-count notranslate" translate="no">{count}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bar - Client scroll controlled in CSS / global */}
      <div className="archive-sticky-nav-container">
        <div className="container">
          <div className="archive-sticky-nav">
            {houseArchiveCategories.map((category) => {
              const count = houseArchiveItems.filter((house) => house.category === category.sourceCategory).length;
              return (
                <a href={`#${category.id}`} key={category.id}>
                  <span>{category.title}</span>
                  <span className="sticky-nav-count notranslate" translate="no">{count || 0}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Commitments & Guarantees section */}
      <div className="archive-commitments-section">
        <div className="container">
          <div className="commitments-header reveal-on-scroll">
            <h2>{commitmentsTitle}</h2>
            <p>{commitmentsSubtitle}</p>
          </div>
          <div className="archive-commitments-grid">
            {commitmentsList.map((item, idx) => (
              <div className="commitment-card reveal-on-scroll" key={idx}>
                <div className="commitment-icon">
                  {idx === 0 && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {idx === 1 && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {idx === 2 && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {idx === 3 && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Houses Sections by Category */}
      <div className="archive-sections-container">
        {houseArchiveCategories.map((category) => {
          const houses = houseArchiveItems.filter((house) => house.category === category.sourceCategory);
          if (houses.length === 0) return null;
          return (
            <div className="archive-house-section" id={category.id} key={category.id}>
              <div className="container">
                <div className="section-heading-block reveal-on-scroll">
                  <h2>{category.title}</h2>
                  <span className="model-count-label">
                    {houses.length} {houses.length > 1 ? (isEn ? "Models" : "Modèles") : (isEn ? "Model" : "Modèle")}
                  </span>
                </div>
                <div className="house-archive-grid">
                  {houses.map((house) => (
                    <HouseCard key={house.slug} house={house} locale={locale} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
