import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { getPayload } from "payload";
import config from "@/payload.config";
import { Locale } from "@/lib/i18n";

import { HeroSlider } from "@/components/HeroSlider";
import { ReviewsCarousel } from "@/components/ReviewsCarousel";
import { CollaboratorsCarousel } from "@/components/CollaboratorsCarousel";
import { FeaturedProductsSection } from "@/components/FeaturedProductsSection";
import { AboutStats } from "@/components/AboutStats";
import { getDictionary } from "@/lib/dictionary";
import { translateText, translateHouseDescription } from "@/lib/translation-helper";
import { calculateStructureSizePrice } from "@/lib/house-mapper";
import { getPlanimetryRooms } from "@/lib/planimetry-rooms";
import { getPlanimetryImageCropRight } from "@/lib/planimetry-visual-crop";
import { siteAssets } from "@/lib/site-assets";
import { isPublishedHousePrice } from "@/lib/price-availability";


type HomePageProps = {
  params: Promise<{ locale: Locale }>;
};

// House and option hooks revalidate this route on demand. The TTL is a safety
// net and keeps the homepage out of the request-by-request database path.
export const revalidate = 600;

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const titles = {
    fr: "Ossa Bois France | Constructeur de Maisons Ossature Bois",
    en: "Ossa Bois France | Timber Frame House Builder",
    de: "Ossa Bois France | Holzrahmenhaus-Hersteller",
    nl: "Ossa Bois France | Houtskelet Bouwer",
  };

  const descriptions = {
    fr: "Ossa Bois France propose des maisons modulaires contemporaines de haute qualité à ossature bois. Configurez et estimez le prix de votre maison en ligne.",
    en: "Ossa Bois France offers high-quality contemporary modular timber frame homes. Configure and estimate the price of your house online.",
    de: "Ossa Bois France bietet hochwertige moderne modulare Holzrahmenhäuser. Konfigurieren und berechnen Sie den Preis Ihres Hauses online.",
    nl: "Ossa Bois France biedt modulaire houtskeletwoningen van hoge kwaliteit. Configureer en schat de prijs van uw huis online.",
  };

  const title = titles[locale] || titles.fr;
  const description = descriptions[locale] || descriptions.fr;

  return {
    title,
    description,
    alternates: {
      canonical: `https://ossaboisfrance.com/${locale}`,
      languages: {
        fr: `https://ossaboisfrance.com/fr`,
        en: `https://ossaboisfrance.com/en`,
        de: `https://ossaboisfrance.com/de`,
        nl: `https://ossaboisfrance.com/nl`,
      }
    },
    openGraph: {
      title,
      description,
      url: `https://ossaboisfrance.com/${locale}`,
      type: "website",
    }
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const [dict, payload] = await Promise.all([
    getDictionary(locale),
    getPayload({ config }),
  ]);

  const categoriesPromise = payload.find({
    collection: 'house-categories',
    limit: 100,
    locale: locale,
  });

  const housesPromise = payload.find({
    collection: 'houses',
    limit: 100,
    depth: 1,
    locale: locale,
  });

  const globalOptionsPromise = payload
    .findGlobal({
      slug: 'house-options',
      locale: locale,
    })
    .catch((error) => {
      console.error('Failed to fetch global house options on homepage:', error);
      return null;
    });

  // These reads are independent, so avoid paying their latency sequentially.
  const [categoriesRes, housesRes, globalOptions] = await Promise.all([
    categoriesPromise,
    housesPromise,
    globalOptionsPromise,
  ]);
  const globalMargin = globalOptions?.marginPercent ?? 40;

  const categoryOrder = [
    "maison-toitu-terrasse",
    "maison-sans-faitage",
    "maison-plein-pied",
    "maison-combles-ammenageable",
    "maison-avec-etage"
  ];

  const categorySlugToKey: Record<string, string> = {
    "maison-toitu-terrasse": "terrace",
    "maison-sans-faitage": "terraceEtage",
    "maison-plein-pied": "plainPied",
    "maison-combles-ammenageable": "combles",
    "maison-avec-etage": "etage"
  };

  // Map to matching layout types
  const categories = categoriesRes.docs
    .map((doc) => {
      const key = categorySlugToKey[doc.slug];
      const categoriesObj = dict.header?.categories as Record<string, string> | undefined;
      const translatedTitle = key && categoriesObj?.[key] ? categoriesObj[key] : translateText(doc.name, locale);
      return {
        id: doc.slug,
        title: translatedTitle,
        slug: doc.slug,
        sourceCategory: doc.name,
      };
    })
    .sort((a, b) => {
      const idxA = categoryOrder.indexOf(a.id);
      const idxB = categoryOrder.indexOf(b.id);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });

  const allHouses = housesRes.docs.map((doc) => {
    const imageUrl = typeof doc.defaultImage === 'object' ? doc.defaultImage?.url : '';
    const finalImageUrl = typeof doc.finalImage === 'object' ? doc.finalImage?.url : '';
    const planimetryUrl = typeof doc.planimetry === 'object' ? doc.planimetry?.url : '';
    const planimetryVisualUrl =
      typeof doc.planimetryVisual === 'object' ? doc.planimetryVisual?.url : '';
    const catObj = typeof doc.category === 'object' ? doc.category : null;
    
    const neto = doc.perdhesa?.neto || 0;
    const rawPrice = isPublishedHousePrice(doc.price60x160)
      ? calculateStructureSizePrice(
          "60x160",
          neto,
          doc.price60x160,
          globalOptions?.priceRate60x160,
          globalOptions?.priceRate60x200
        )
      : null;
    const marginMultiplier = 1 + (doc.marginPercent ?? globalMargin) / 100;
    const finalPrice = rawPrice !== null ? rawPrice * marginMultiplier : null;

    return {
      slug: doc.slug,
      title: translateText(doc.title, locale),
      categoryName: translateText(catObj?.name || 'Maison', locale),
      categorySlug: catObj?.slug || '',
      description: translateHouseDescription(doc.description || doc.subheading || '', doc.slug, locale),
      image: imageUrl || '',
      imageBardage: finalImageUrl || '',
      price60x160: finalPrice,
      neto: doc.perdhesa?.neto || null,
      bruto: doc.perdhesa?.bruto || null,
      planimetry: planimetryUrl || null,
      planimetryVisual: planimetryVisualUrl || null,
      planimetryImageCropRight: getPlanimetryImageCropRight(doc.slug),
      planimetryRooms: getPlanimetryRooms(doc.slug, doc.planimetryDetails, locale),
    };
  });

  // Filter houses that have both images for the Hero Slider comparison
  const sliderHouses = allHouses
    .filter((h) => h.image && h.imageBardage && h.image !== h.imageBardage)
    .map((h) => ({
      slug: h.slug,
      title: h.title,
      categoryName: h.categoryName,
      image: h.image,
      imageBardage: h.imageBardage,
    }));

  // Keep the first server render deterministic so the page can be ISR-cached.
  // The comparison remains interactive; only the refresh-to-refresh rotation
  // cookie is removed from the critical server path.
  let initialIdx = sliderHouses.findIndex((h) => h.slug === "maison-2-etage-me-atike");
  if (initialIdx === -1) {
    initialIdx = 0;
  }

  // Construct localized client reviews by merging text with static media links
  const carouselReviews = (dict.home.clientReviews || []).map((rev: any, index: number) => ({
    content: rev.content,
    name: rev.name,
    title: rev.title,
    image: index === 0 ? siteAssets.reviewAvatar : undefined,
    socialIcon: siteAssets.reviewSocial
  }));

  return (
    <main className="homepage-root">
      {/* Homepage Hero Group (for desktop viewport height docking) */}
      <div className="homepage-hero-wrapper">
        {/* ═══════════════ SEKTION 1: HERO TEXT ═══════════════ */}
        <section className="wp-section-hero">
          <div className="container hero-content-wrapper">
            <h1 className="hero-title">{dict.home.heroTitle}</h1>
            <p className="hero-description">
              {dict.home.heroDescription}
            </p>
            <div className="hero-btn-container">
              <Link href={`/${locale}/maisons`} className="hero-discover-btn">
                <span>{dict.home.exploreCta}</span>
                <span className="hero-btn-icon-wrapper">
                  <svg className="hero-btn-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════ SEKTION 2: HERO CAROUSEL ═══════════════ */}
        <section className="wp-section-carousel">
          <div className="hero-carousel-container">
            <HeroSlider
              key={`${sliderHouses[initialIdx]?.image ?? ""}|${sliderHouses[initialIdx]?.imageBardage ?? ""}`}
              house={sliderHouses[initialIdx] ?? null}
            />
          </div>
        </section>
      </div>

      {/* ═══════════════ SEKTION 3: ABOUT (C'EST NOUS...) ═══════════════ */}
      <section className="wp-section-about">
        <div className="container about-grid">
          <div className="about-left-col">
            <h2 className="about-title">
              {dict.home.aboutTitle.split(', ').map((part: string, index: number) => (
                <React.Fragment key={index}>
                  {part}
                  {index < dict.home.aboutTitle.split(', ').length - 1 && <>, <br /></>}
                </React.Fragment>
              ))}
            </h2>
            <Link href={`/${locale}/qui-sommes-nous`} className="about-link-btn">
              <span>
                {dict.home.aboutCta.split(' ').map((word: string, idx: number, arr: string[]) => {
                  // Put a line break before the last words to match design
                  if (idx === arr.length - 2) {
                    return <React.Fragment key={idx}>{word} <br /></React.Fragment>;
                  }
                  return idx === arr.length - 1 ? word : word + ' ';
                })}
              </span>
              <svg className="about-arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
          
          <div className="about-right-col">
            <div className="about-editorial-text">
              <p>
                {dict.home.aboutText1}
              </p>
              <p>
                {dict.home.aboutText2}
              </p>
              <p className="about-bold-highlight">
                <strong>{dict.home.aboutBold}</strong>
              </p>
            </div>

            <AboutStats dict={dict.home.stats} />
          </div>
        </div>
      </section>

      {/* ═══════════════ SEKTION 4: FEATURED PRODUCTS ═══════════════ */}
      <FeaturedProductsSection
        locale={locale}
        categories={categories}
        allHouses={allHouses}
        dict={{
          featuredTitle: dict.home.featuredTitle,
          featuredSubtitle: dict.home.featuredSubtitle,
          exploreCta: dict.home.exploreCta,
          startingFrom: dict.archive.startingFrom,
          onQuote: dict.archive.onQuote,
          configureBtn: dict.archive.configureBtn,
        }}
      />

      {/* ═══════════════ SEKTION 5: CLIENT TESTIMONIALS ═══════════════ */}
      <section className="wp-section-reviews">
        <div className="container reviews-grid">
          <div className="reviews-left-col">
            <h2 className="reviews-title">{dict.home.reviewsTitle}</h2>
            <p className="reviews-subtitle">{dict.home.reviewsSubtitle}</p>
            <Link href={`/${locale}/qui-sommes-nous`} className="reviews-more-btn">
              <span>{dict.home.reviewsMore}</span>
              <svg className="about-arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          <div className="reviews-right-col">
            <ReviewsCarousel reviews={carouselReviews} />
          </div>
        </div>
      </section>

      {/* ═══════════════ SEKTION 6: WHY CHOOSE US ═══════════════ */}
      <section className="wp-section-why">
        <div className="container">
          <h2 className="why-title">{dict.home.whyTitle}</h2>
          <p className="why-subtitle">{dict.home.whySubtitle}</p>
          
          <div className="why-grid">
            {(dict.home.whyCards || []).map((card: any, i: number) => (
              <div className="why-card" key={i}>
                <div className="why-card-header">
                  <div className="why-card-icon-container">
                    <Image
                      src={siteAssets.clipboard}
                      alt=""
                      width={24}
                      height={24}
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                  <h3 className="why-card-title">{card.title}</h3>
                </div>
                <p className="why-card-desc">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ SEKTION 7: COLLABORATORS ═══════════════ */}
      <section className="wp-section-collabs">
        <div className="container">
          <h2 className="collabs-title">{dict.home.collabsTitle}</h2>
          <CollaboratorsCarousel logos={[...siteAssets.collabLogos]} />
        </div>
      </section>

      {/* ═══════════════ SEKTION 8: CTA BOX ═══════════════ */}
      <section className="wp-section-cta">
        <div className="container">
          <div className="cta-gray-box">
            <div className="cta-left-content">
              <h2 className="cta-box-title">{dict.home.ctaTitle}</h2>
              <p className="cta-box-desc">
                {dict.home.ctaDesc.split('. ').map((part: string, index: number, arr: string[]) => (
                  <React.Fragment key={index}>
                    {part}{index < arr.length - 1 ? '.' : ''}
                    {index === 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
              <Link href={`/${locale}/contact`} className="cta-contact-btn">
                <span>{dict.home.ctaCta}</span>
                <svg className="cta-btn-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
