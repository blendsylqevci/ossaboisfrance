import Image from "next/image";
import Link from "next/link";
import { houseArchiveItems, houseArchiveCategories } from "@/data/houses-archive";
import { Locale } from "@/lib/i18n";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ReviewsCarousel } from "@/components/ReviewsCarousel";
import { CollaboratorsCarousel } from "@/components/CollaboratorsCarousel";
import { FeaturedProductsSection } from "@/components/FeaturedProductsSection";
import { AboutStats } from "@/components/AboutStats";

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
  "boreale",
  "australe",
  "ambre-sans-faitage"
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
    text: "Nous prenons en charge le transport et livrons votre maison modulaire en un délai court, partout en Europe, grâce à une logistique optimisée."
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
  
  // Get the 6 featured houses from archive list
  const featuredHouses = featuredSlugs
    .map((s) => houseArchiveItems.find((h) => h.slug === s))
    .filter((h): h is NonNullable<typeof h> => !!h);

  return (
    <main className="homepage-root">
      {/* ═══════════════ SEKTION 1: HERO TEXT ═══════════════ */}
      <section className="wp-section-hero">
        <div className="container hero-content-wrapper">
          <h1 className="hero-title">MAISONS PRÉFABRIQUÉES</h1>
          <p className="hero-description">
            Des maisons modernes, durables et entièrement personnalisables, conçues pour s’adapter parfaitement à votre mode de vie.
          </p>
          <div className="hero-btn-container">
            <Link href={`/${locale}/maisons`} className="hero-discover-btn">
              <span>Découvrir</span>
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
        <HeroCarousel images={heroImages} />
      </section>

      {/* ═══════════════ SEKTION 3: ABOUT (C'EST NOUS...) ═══════════════ */}
      <section className="wp-section-about">
        <div className="container about-grid">
          <div className="about-left-col">
            <h2 className="about-title">
              C’est nous, <br />
              Ossa Bois <br />
              France
            </h2>
            <Link href={`/${locale}/qui-sommes-nous`} className="about-link-btn">
              <span>Découvrez qui <br /> nous sommes</span>
              <svg className="about-arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
          
          <div className="about-right-col">
            <div className="about-editorial-text">
              <p>
                Ossa Bois France réinvente l’habitat individuel et collectif à travers une approche moderne, écologique et hautement performante de la construction en bois. Forts de notre expertise d’ingénierie et de notre savoir-faire industriel, nous concevons des structures d'exception qui allient design contemporain, durabilité environnementale et confort de vie inégalé.
              </p>
              <p>
                De la conception sur-mesure à la fabrication de haute précision dans nos ateliers de pointe, chaque projet bénéficie d'un suivi rigoureux. Grâce à une logistique intégrée et des équipes d'assemblage qualifiées, nous garantissons un accompagnement clé en main à travers toute l'Europe, éliminant les aléas des chantiers traditionnels en respectant strictement vos budgets et vos délais.
              </p>
              <p className="about-bold-highlight">
                <strong>Une construction d'avenir, durable et certifiée, pour concrétiser vos projets architecturaux les plus exigeants.</strong>
              </p>
            </div>

            <AboutStats />
          </div>
        </div>
      </section>

      {/* ═══════════════ SEKTION 4: FEATURED PRODUCTS ═══════════════ */}
      <FeaturedProductsSection
        locale={locale}
        categories={houseArchiveCategories}
        allHouses={houseArchiveItems}
      />

      {/* ═══════════════ SEKTION 5: CLIENT TESTIMONIALS ═══════════════ */}
      <section className="wp-section-reviews">
        <div className="container reviews-grid">
          <div className="reviews-left-col">
            <h2 className="reviews-title">Les avis de nos clients</h2>
            <p className="reviews-subtitle">Les témoignages de nos clients à travers l’Europe</p>
            <Link href={`/${locale}/qui-sommes-nous`} className="reviews-more-btn">
              <span>Voir plus d’avis</span>
              <svg className="about-arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          <div className="reviews-right-col">
            <ReviewsCarousel reviews={clientReviews} />
          </div>
        </div>
      </section>

      {/* ═══════════════ SEKTION 6: WHY CHOOSE US ═══════════════ */}
      <section className="wp-section-why">
        <div className="container">
          <h2 className="why-title">Pourquoi choisir Ossa Bois France</h2>
          <p className="why-subtitle">Des prix imbattables et une personnalisation complète de votre maison, du kit jusqu’aux fenêtres.</p>
          
          <div className="why-grid">
            {whyCards.map((card, i) => (
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
          <h2 className="collabs-title">Nos Collaborateurs Européens</h2>
          <CollaboratorsCarousel logos={collabLogos} />
        </div>
      </section>

      {/* ═══════════════ SEKTION 8: CTA BOX ═══════════════ */}
      <section className="wp-section-cta">
        <div className="container">
          <div className="cta-gray-box">
            <div className="cta-left-content">
              <h2 className="cta-box-title">Construisez votre maison idéale</h2>
              <p className="cta-box-desc">
                Choisissez votre modèle, personnalisez chaque détail et suivez le prix en temps réel. <br />
                Simple. Rapide. Transparent.
              </p>
              <Link href={`/${locale}/contact`} className="cta-contact-btn">
                <span>Contactez-nous</span>
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
