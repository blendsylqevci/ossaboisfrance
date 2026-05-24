import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@/payload.config";
import { Locale } from "@/lib/i18n";
import { cookies } from "next/headers";
import { HeroSlider } from "@/components/HeroSlider";
import { ReviewsCarousel } from "@/components/ReviewsCarousel";
import { CollaboratorsCarousel } from "@/components/CollaboratorsCarousel";
import { FeaturedProductsSection } from "@/components/FeaturedProductsSection";
import { AboutStats } from "@/components/AboutStats";
import { getDictionary } from "@/lib/dictionary";
import { translateText, translateHouseDescription } from "@/lib/translation-helper";

type HomePageProps = {
  params: Promise<{ locale: Locale }>;
};

const heroImages = [
  "/images/hero/step1.jpg",
  "/images/hero/step2.jpg",
  "/images/hero/step3.jpg",
  "/images/hero/step4.jpg",
  "/images/hero/step5.jpg"
];

const featuredSlugs = [
  "emmy-house-etage-toiture-terrasse",
  "emeraude-toiture-terrasse",
  "diademe-toiture-terrasse",
  "boreale-me-atike",
  "australe",
  "ambre-me-atike"
];

const whyCards = [
  {
    title: "Prix très avantageux",
    text: "Nos maisons modulaires sont proposées à des prix compétitifs grâce à notre propre usine de production. Un excellent rapport qualité-prix sans compromis sur la solidité ou la finition."
  },
  {
    title: "Personnalisation complète en ligne",
    text: "Vous pouvez configurer votre maison comme vous le souhaitez directement sur notre site : modèle, surface, isolation, matériaux, fenêtres et finitions — tout est personnalisable selon vos besoins."
  },
  {
    title: "Livraison rapide dans toute l'Europe",
    text: "We take care of the transport and deliver your modular home in a short time, anywhere in Europe, thanks to optimized logistics."
  },
  {
    title: "Fabrication contrôlée en usine",
    text: "Production réalisée dans notre usine moderne au France, sous contrôle strict de qualité : structure solide, précision millimétrique et matériaux certifiés."
  },
  {
    title: "Installation simple et rapide",
    text: "Grâce à la construction modulaire, l'installation sur votre terrain est propre, rapide et sans surprises. Un processus beaucoup plus efficace que la construction traditionnelle."
  },
  {
    title: "Entreprise sérieuse & accompagnement complet",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo."
  }
];

const collabLogos = [
  { src: "https://ossaboisfrance.com/wp-content/uploads/2025/10/logo-4.png", alt: "Millisy" },
  { src: "https://ossaboisfrance.com/wp-content/uploads/2025/10/logo-3.png", alt: "Partner 2" },
  { src: "https://ossaboisfrance.com/wp-content/uploads/2025/10/logo-2.png", alt: "Elementor" },
  { src: "https://ossaboisfrance.com/wp-content/uploads/2025/10/logo-1.png", alt: "Booking Online" },
  { src: "https://ossaboisfrance.com/wp-content/uploads/2025/10/logo-5.png", alt: "Partner 5" },
  { src: "https://ossaboisfrance.com/wp-content/uploads/2025/10/Image-3.png", alt: "Partner 6" }
];

const clientReviews = [
  {
    content: "Service impeccable, livraison rapide et qualité supérieure. Notre maison modulaire a été installée parfaitement et le résultat dépasse nos attentes. Nous recommandons fortement Ossa Bois France.",
    name: "Mrs. Khorsan",
    title: "04/13/2025",
    image: "https://ossaboisfrance.com/wp-content/uploads/2025/10/div.avarta.png",
    socialIcon: "https://ossaboisfrance.com/wp-content/uploads/2025/10/SVG-1.svg"
  },
  {
    content: "“Une équipe très professionnelle, un accompagnement complet du début à la fin. La qualité de la construction est remarquable et les délais ont été parfaitement respectés. Je suis ravie de ma maison modulaire.”",
    name: "Sophie L.",
    title: "@nom d'utilisateur",
    socialIcon: "https://ossaboisfrance.com/wp-content/uploads/2025/10/SVG-1.svg"
  },
  {
    content: "“Installation rapide, matériaux solides et un service client toujours disponible. Notre maison est exactement comme nous l’avions imaginée. Merci à Ossa Bois France pour ce travail de qualité.”",
    name: "Marc et Élodie R.",
    title: "@nom d'utilisateur",
    socialIcon: "https://ossaboisfrance.com/wp-content/uploads/2025/10/SVG-1.svg"
  },
  {
    content: "“Excellent rapport qualité-prix. Le transport et le montage se sont déroulés sans aucun problème. Je recommande cette entreprise à 100 %.”",
    name: "Jean-Michel D.",
    title: "@nom d'utilisateur",
    socialIcon: "https://ossaboisfrance.com/wp-content/uploads/2025/10/SVG-1.svg"
  }
];

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  
  const payload = await getPayload({ config });

  // Fetch categories
  const categoriesRes = await payload.find({
    collection: 'house-categories',
    limit: 100,
    locale: locale,
  });

  // Fetch houses
  const housesRes = await payload.find({
    collection: 'houses',
    limit: 100,
    depth: 1,
    locale: locale,
  });

  // Fetch global house options to get the global margin percentage
  let globalOptions = null;
  try {
    globalOptions = await payload.findGlobal({
      slug: 'house-options',
      locale: locale,
    });
  } catch (error) {
    console.error('Failed to fetch global house options on homepage:', error);
  }
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
    const catObj = typeof doc.category === 'object' ? doc.category : null;
    
    const rawPrice = doc.price60x160 || null;
    const marginMultiplier = 1 + (doc.marginPercent ?? globalMargin) / 100;
    const finalPrice = rawPrice ? rawPrice * marginMultiplier : null;

    return {
      slug: doc.slug,
      title: translateText(doc.title, locale),
      categoryName: translateText(catObj?.name || 'Maison', locale),
      categorySlug: catObj?.slug || '',
      description: translateHouseDescription(doc.description || doc.subheading || '', doc.slug, locale),
      image: imageUrl || '',
      imageBardage: finalImageUrl || '',
      price60x160: finalPrice,
    };
  });

  // Get the 6 featured houses from dynamic list
  const featuredHouses = featuredSlugs
    .map((s) => allHouses.find((h) => h.slug === s))
    .filter((h): h is NonNullable<typeof h> => !!h);

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

  // Read cookie on the server to determine the initial house to render
  const cookieStore = await cookies();
  const heroHouseSlug = cookieStore.get("hero_house_slug")?.value || "maison-2-etage-me-atike";

  let initialIdx = sliderHouses.findIndex((h) => h.slug === heroHouseSlug);
  if (initialIdx === -1) {
    initialIdx = sliderHouses.findIndex((h) => h.slug === "maison-2-etage-me-atike");
    if (initialIdx === -1) initialIdx = 0;
  }

  // Construct localized client reviews by merging text with static media links
  const carouselReviews = (dict.home.clientReviews || []).map((rev: any, index: number) => ({
    content: rev.content,
    name: rev.name,
    title: rev.title,
    image: index === 0 ? "https://ossaboisfrance.com/wp-content/uploads/2025/10/div.avarta.png" : undefined,
    socialIcon: "https://ossaboisfrance.com/wp-content/uploads/2025/10/SVG-1.svg"
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
            <HeroSlider houses={sliderHouses} initialIdx={initialIdx} />
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
                      src="https://ossaboisfrance.com/wp-content/uploads/2025/10/clipboard.png"
                      alt="clipboard"
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
          <CollaboratorsCarousel logos={collabLogos} />
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
            
            <div className="cta-right-image-overlay">
              <Image
                src="https://ossaboisfrance.com/wp-content/uploads/2025/10/5-asebra-1.png"
                alt="Maison Asebra"
                width={650}
                height={400}
                className="cta-image-el"
                priority
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
