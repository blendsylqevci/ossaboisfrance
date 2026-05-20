import Image from "next/image";
import { Locale } from "@/lib/i18n";

type B2BPageProps = {
  params: Promise<{ locale: Locale }>;
};

const advantages = [
  {
    icon: "🏭",
    title: "Production industrielle",
    description: "Capacité de production élevée grâce à notre usine moderne équipée des dernières technologies."
  },
  {
    icon: "📐",
    title: "Sur mesure",
    description: "Chaque projet est adapté aux besoins spécifiques de nos partenaires professionnels."
  },
  {
    icon: "🌍",
    title: "Livraison européenne",
    description: "Nous livrons et installons dans toute l'Europe avec une logistique maîtrisée."
  },
  {
    icon: "📋",
    title: "Conformité totale",
    description: "Toutes nos constructions respectent les normes européennes en vigueur."
  }
];

export default async function B2BPage({ params }: B2BPageProps) {
  const { locale } = await params;
  void locale;

  return (
    <section className="b2b-page">
      <div className="b2b-hero">
        <div className="about-hero-media">
          <Image
            src="https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-3-scaled.jpg"
            alt="Partenariat B2B Ossa Bois"
            fill
            sizes="100vw"
            priority
          />
          <div className="hero-overlay" />
        </div>
        <div className="container about-hero-content">
          <p className="kicker">Professionnels</p>
          <h1>Partenariat B2B</h1>
          <p>Devenez partenaire et proposez des maisons modulaires à ossature bois à vos clients.</p>
        </div>
      </div>

      <div className="container b2b-intro">
        <div className="about-intro-grid">
          <div>
            <h2>Pourquoi travailler avec nous ?</h2>
            <p>
              Ossa Bois France offre aux professionnels du bâtiment, promoteurs et constructeurs
              une solution complète de maisons modulaires à ossature bois. Notre capacité de
              production et notre expertise nous permettent de répondre à des projets de toute
              envergure.
            </p>
            <p>
              Que vous soyez un constructeur cherchant à diversifier votre offre, un promoteur
              immobilier ou un architecte, nous adaptons nos solutions à vos besoins spécifiques.
            </p>
          </div>
          <div className="advantages-grid">
            {advantages.map((item) => (
              <div className="advantage-card" key={item.title}>
                <span className="advantage-icon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="b2b-form-section">
        <div className="container">
          <h2>Demande de partenariat</h2>
          <p className="b2b-form-subtitle">
            Remplissez le formulaire ci-dessous et notre équipe commerciale vous contactera
            rapidement.
          </p>
          <form className="contact-form b2b-form" id="b2b-forma">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="b2b-company">Entreprise</label>
                <input id="b2b-company" type="text" name="company" required />
              </div>
              <div className="form-group">
                <label htmlFor="b2b-name">Nom complet</label>
                <input id="b2b-name" type="text" name="name" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="b2b-email">Email professionnel</label>
                <input id="b2b-email" type="email" name="email" required />
              </div>
              <div className="form-group">
                <label htmlFor="b2b-phone">Téléphone</label>
                <input id="b2b-phone" type="tel" name="phone" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="b2b-message">Description du projet</label>
              <textarea id="b2b-message" name="message" rows={6} required />
            </div>
            <div className="form-group">
              <label htmlFor="b2b-file">Document (optionnel)</label>
              <input id="b2b-file" type="file" name="file" accept=".pdf,.doc,.docx,.xls,.xlsx" />
            </div>
            <button className="button" type="submit">
              Envoyer la demande
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
