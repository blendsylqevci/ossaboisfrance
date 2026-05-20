import Image from "next/image";
import Link from "next/link";
import { Locale } from "@/lib/i18n";

type AboutPageProps = {
  params: Promise<{ locale: Locale }>;
};

const values = [
  {
    icon: "🎯",
    title: "Précision",
    description: "Chaque élément est fabriqué avec une précision industrielle dans notre usine moderne."
  },
  {
    icon: "🌿",
    title: "Durabilité",
    description: "Le bois est un matériau renouvelable. Nos maisons sont conçues pour durer des générations."
  },
  {
    icon: "⚡",
    title: "Rapidité",
    description: "Grâce à la préfabrication, les délais de construction sont considérablement réduits."
  },
  {
    icon: "🤝",
    title: "Accompagnement",
    description: "De la conception à l'installation, nous sommes à vos côtés à chaque étape."
  }
];

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;

  return (
    <section className="about-page">
      <div className="about-hero">
        <div className="about-hero-media">
          <Image
            src="https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-4-scaled.jpg"
            alt="Usine Ossa Bois"
            fill
            sizes="100vw"
            priority
          />
          <div className="hero-overlay" />
        </div>
        <div className="container about-hero-content">
          <p className="kicker">Qui sommes-nous</p>
          <h1>Ossa Bois France</h1>
          <p>Spécialistes de la maison modulaire à ossature bois depuis plus de 30 ans.</p>
        </div>
      </div>

      <div className="container about-intro">
        <div className="about-intro-grid">
          <div>
            <h2>Notre histoire</h2>
            <p>
              Ossa Bois France est une entreprise spécialisée dans la fabrication de maisons
              modulaires à ossature bois. Avec des bureaux en France et une usine de production
              moderne au Kosovo, nous concevons et réalisons des constructions durables, rapides et
              entièrement personnalisées.
            </p>
            <p>
              Nous accompagnons nos clients dans toute l&apos;Europe, en offrant un service
              complet : conception, fabrication, transport et installation sur site. Notre priorité
              est la qualité, la précision et le respect des délais.
            </p>
          </div>
          <div className="about-stats-block">
            <div className="stat-item large">
              <strong>30+</strong>
              <span>années d&apos;expérience cumulée dans la construction modulaire</span>
            </div>
            <div className="stat-item large">
              <strong>700+</strong>
              <span>projets livrés en Europe</span>
            </div>
            <div className="stat-item large">
              <strong>100%</strong>
              <span>personnalisable selon vos besoins</span>
            </div>
          </div>
        </div>
      </div>

      <div className="about-values-section">
        <div className="container">
          <h2>Nos valeurs</h2>
          <div className="values-grid">
            {values.map((item) => (
              <div className="value-card" key={item.title}>
                <span className="value-icon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="about-process-section">
        <div className="container">
          <h2>Notre processus</h2>
          <div className="process-steps">
            <div className="process-step">
              <span className="step-number">01</span>
              <h3>Conception</h3>
              <p>Choisissez votre modèle et personnalisez chaque détail selon vos envies.</p>
            </div>
            <div className="process-step">
              <span className="step-number">02</span>
              <h3>Fabrication</h3>
              <p>Votre maison est fabriquée dans notre usine avec des matériaux de qualité.</p>
            </div>
            <div className="process-step">
              <span className="step-number">03</span>
              <h3>Transport</h3>
              <p>Les modules sont transportés sur votre terrain, prêts pour l&apos;assemblage.</p>
            </div>
            <div className="process-step">
              <span className="step-number">04</span>
              <h3>Installation</h3>
              <p>Nos équipes qualifiées assemblent votre maison rapidement et efficacement.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="about-cta">
        <div className="container home-cta-content">
          <h2>Envie d&apos;en savoir plus ?</h2>
          <p>Découvrez nos modèles ou contactez-nous pour discuter de votre projet.</p>
          <div className="home-cta-buttons">
            <Link className="button" href={`/${locale}/maisons`}>Voir les modèles</Link>
            <Link className="button secondary" href={`/${locale}/contact`}>Nous contacter</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
