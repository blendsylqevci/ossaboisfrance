"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Locale } from "@/lib/i18n";

type AboutPageProps = {
  params: Promise<{ locale: Locale }>;
};

const faqs = [
  {
    id: "faq-1",
    question: "Peut-on construire sur un terrain en pente ?",
    answer: "Oui, la construction à ossature bois est particulièrement adaptée aux terrains en pente. Grâce à la légèreté structurelle du bois, les fondations (comme des plots en béton ou des vis de fondation) sont moins contraignantes et plus économiques que pour une construction traditionnelle en béton, s'adaptant parfaitement au relief naturel du sol."
  },
  {
    id: "faq-2",
    question: "Quelle est la durée de vie d'une maison à ossature bois ?",
    answer: "La qualité de la conception, des matériaux traités et du mode de construction en usine de nos maisons leur permet de durer plusieurs générations. Les structures en bois moderne bénéficient de traitements de pointe contre l'humidité et les insectes, offrant une longévité équivalente ou supérieure aux constructions traditionnelles en parpaing ou brique."
  },
  {
    id: "faq-3",
    question: "Quelles garanties offrez-vous pour vos constructions ?",
    answer: "Chaque maison construite par Ossa Bois France bénéficie de toutes les garanties constructeurs exigées par la loi française, incluant l'assurance décennale (qui garantit la structure et le clos-couvert pendant 10 ans), la garantie de parfait achèvement (1 an) et la garantie de bon fonctionnement des équipements (2 ans)."
  },
  {
    id: "faq-4",
    question: "Quels sont les avantages de la préfabrication en usine ?",
    answer: "La préfabrication en atelier garantit une précision millimétrique grâce à nos équipements numériques et un contrôle qualité constant à l'abri des intempéries. Cela permet également de diviser par deux les délais de chantier et de minimiser les déchets, tout en garantissant des finitions impeccables."
  }
];

const commitments = [
  {
    title: "Construction écologique",
    desc: "L'ossature bois fait appel à un matériau renouvelable et durable, dont la production génère moins de déchets et consomme moins d'énergie que les matériaux de construction traditionnels."
  },
  {
    title: "Isolation thermique RE2020",
    desc: "Une isolation haute performance intégrée directement dans les murs en usine, offrant une efficacité énergétique maximale et un confort optimal été comme hiver."
  },
  {
    title: "Solidité & Durabilité",
    desc: "Des structures en bois rigoureusement sélectionnées et assemblées sous température contrôlée pour résister durablement aux intempéries et au passage du temps."
  },
  {
    title: "Précision millimétrique",
    desc: "Chaque mur et élément de toiture est pré-assemblé en atelier selon des plans numériques 3D ultra-précis, assurant un ajustement parfait lors du montage."
  }
];

export default function AboutPage({ params }: AboutPageProps) {
  const { locale } = React.use(params);
  const [openFaq, setOpenFaq] = useState<string | null>("faq-1");

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <section className="about-page">
      {/* ─── INTRO SECTION ─── */}
      <div className="about-intro-section">
        <div className="container">
          <h1>À propos de nous</h1>
          <p className="about-intro-text">
            Fabricant de maison modulaire à ossature bois dans toute la France. Créée par des constructeurs disposant de plus de 30 ans d&apos;expérience dans le bâtiment, Ossa Bois France est spécialisée dans la construction de maison modulaire à ossature bois.
          </p>
        </div>
      </div>

      {/* ─── CONCEPT & ADVANTAGES SECTION ─── */}
      <div className="about-concept-section">
        <div className="container">
          <div className="concept-grid">
            <div className="concept-text-col">
              <div className="concept-cards-list">
                <div className="concept-box-card">
                  <h3>Notre concept</h3>
                  <p>La construction, dans toute la France, de maisons fabriquées en usine.</p>
                </div>
                <div className="concept-box-card">
                  <h3>Nos avantages</h3>
                  <p>Des coûts maîtrisés et des délais raccourcis, dans le respect des standards de qualité et des réglementations environnementales en vigueur.</p>
                </div>
              </div>
              <div className="concept-left-image">
                <Image
                  src="https://ossaboisfrance.com/wp-content/uploads/2025/10/Image-2.png"
                  alt="Construction modulaire en usine"
                  width={550}
                  height={640}
                  className="rounded-img"
                />
              </div>
            </div>

            <div className="concept-images-col">
              <div className="concept-right-image-1">
                <Image
                  src="https://ossaboisfrance.com/wp-content/uploads/2025/10/Image.png"
                  alt="Structure ossature bois"
                  width={680}
                  height={734}
                  className="rounded-img"
                />
              </div>
              <div className="concept-right-image-2">
                <Image
                  src="https://ossaboisfrance.com/wp-content/uploads/2025/10/Image-1.png"
                  alt="Assemblage module bois"
                  width={680}
                  height={309}
                  className="rounded-img"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── HOW IT WORKS SECTION ─── */}
      <div className="about-how-section">
        <div className="container">
          <div className="how-grid-layout">
            <div className="how-text-col">
              <div className="how-content-left-aligned">
                <h2>Maison préfabriquée : comment ça se passe ?</h2>
                <p>
                  Le parcours de construction d'une maison à ossature bois repose sur une ingénierie de précision et une organisation industrielle rigoureusement maîtrisée. Implantée à Chartres, en Eure-et-Loir, Ossa Bois France collabore avec un bureau d’études spécialisé et s’appuie sur une usine de production moderne dotée d'équipements de dernière génération au Kosovo. Cette synergie garantit une conception sur-mesure et une fabrication à l'abri des intempéries, assurant une régularité de qualité impossible à obtenir sur un chantier classique.
                </p>
                <p>
                  Notre processus de préfabrication en atelier permet de réaliser l'essentiel du gros œuvre (assemblage des murs, isolation intégrée, pose des menuiseries) dans des conditions optimales de sécurité et de contrôle. Cette méthode moderne réduit considérablement le temps de mise en œuvre global et optimise l'utilisation des ressources en minimisant les déchets de construction sur site.
                </p>
                <p>
                  Une fois les différents modules ou panneaux achevés et certifiés conformes, ils sont transportés avec le plus grand soin vers votre terrain. L'assemblage final est alors réalisé par nos partenaires monteurs agréés dans toute la France. En quelques jours seulement, la structure hors d'eau et hors d'air est érigée, prête à accueillir les finitions intérieures pour vous offrir un emménagement rapide et serein.
                </p>
              </div>
              
              <div className="how-action-btn-left">
                <Link className="about-btn" href={`/${locale}/maisons`}>
                  Découvrir nos modèles de maisons
                  <span className="btn-arrow">→</span>
                </Link>
              </div>
            </div>
            
            <div className="how-image-col">
              <div className="how-image-step-grid">
                {/* 01. Structure */}
                <div className="how-step-card">
                  <Image
                    src="https://ossaboisfrance.com/wp-content/uploads/2026/04/2.-kons-scaled.png"
                    alt="Structure"
                    width={200}
                    height={150}
                    className="how-step-img"
                  />
                  <div className="how-step-badge">01. Structure</div>
                </div>

                {/* 02. Laine de verre */}
                <div className="how-step-card">
                  <Image
                    src="https://ossaboisfrance.com/wp-content/uploads/2026/04/3.-lesh-guri-scaled.png"
                    alt="Laine de verre"
                    width={200}
                    height={150}
                    className="how-step-img"
                  />
                  <div className="how-step-badge">02. Laine Verre</div>
                </div>

                {/* 03. Laine de roche */}
                <div className="how-step-card">
                  <Image
                    src="https://ossaboisfrance.com/wp-content/uploads/2026/04/4.-lesh-druri-scaled.png"
                    alt="Laine de roche"
                    width={200}
                    height={150}
                    className="how-step-img"
                  />
                  <div className="how-step-badge">03. Laine Roche</div>
                </div>

                {/* 04. Laine de bois */}
                <div className="how-step-card">
                  <Image
                    src="https://ossaboisfrance.com/wp-content/uploads/2026/04/5.-lesh-xhami-scaled.png"
                    alt="Laine de bois"
                    width={200}
                    height={150}
                    className="how-step-img"
                  />
                  <div className="how-step-badge">04. Laine Bois</div>
                </div>

                {/* 05. EPS Extérieur */}
                <div className="how-step-card">
                  <Image
                    src="https://ossaboisfrance.com/wp-content/uploads/2026/04/6.-stiropori-scaled.png"
                    alt="EPS Extérieur"
                    width={200}
                    height={150}
                    className="how-step-img"
                  />
                  <div className="how-step-badge">05. Isolation EPS</div>
                </div>

                {/* 06. Fibre de bois */}
                <div className="how-step-card">
                  <Image
                    src="https://ossaboisfrance.com/wp-content/uploads/2026/04/7.-fibra-scaled.png"
                    alt="Fibre de bois"
                    width={200}
                    height={150}
                    className="how-step-img"
                  />
                  <div className="how-step-badge">06. Fibre Bois</div>
                </div>

                {/* 07. Roche Extérieure */}
                <div className="how-step-card">
                  <Image
                    src="https://ossaboisfrance.com/wp-content/uploads/2026/04/8.-leshi-gurit-jashte-scaled.png"
                    alt="Roche Extérieure"
                    width={200}
                    height={150}
                    className="how-step-img"
                  />
                  <div className="how-step-badge">07. Roche Ext</div>
                </div>

                {/* 08. Toit EPDM */}
                <div className="how-step-card">
                  <Image
                    src="https://ossaboisfrance.com/wp-content/uploads/2026/04/10.-epdm-1-scaled.png"
                    alt="Toit EPDM"
                    width={200}
                    height={150}
                    className="how-step-img"
                  />
                  <div className="how-step-badge">08. Toit EPDM</div>
                </div>

                {/* 09. Enduit Blanc */}
                <div className="how-step-card">
                  <Image
                    src="https://ossaboisfrance.com/wp-content/uploads/2026/04/11.-fasada-e-bardhe-1-scaled.png"
                    alt="Enduit Blanc"
                    width={200}
                    height={150}
                    className="how-step-img"
                  />
                  <div className="how-step-badge">09. Façade Blanc</div>
                </div>

                {/* 10. Bardage Bois */}
                <div className="how-step-card">
                  <Image
                    src="https://ossaboisfrance.com/wp-content/uploads/2026/04/12.-fasada-arish-1-scaled.png"
                    alt="Bardage Bois"
                    width={200}
                    height={150}
                    className="how-step-img"
                    />
                  <div className="how-step-badge">10. Bardage Bois</div>
                </div>

                {/* 11. Fenêtres Alu */}
                <div className="how-step-card">
                  <Image
                    src="https://ossaboisfrance.com/wp-content/uploads/2026/04/13.-dritaret-alumin-1-scaled.png"
                    alt="Fenêtres Alu"
                    width={200}
                    height={150}
                    className="how-step-img"
                  />
                  <div className="how-step-badge">11. Fenêtres Alu</div>
                </div>

                {/* 12. Maison Finie */}
                <div className="how-step-card how-final-card">
                  <Image
                    src="https://ossaboisfrance.com/wp-content/uploads/2026/04/5-asebra-scaled.jpg"
                    alt="Maison Finie"
                    width={200}
                    height={150}
                    className="how-step-img how-final-img"
                  />
                  <div className="how-step-badge">12. Maison Finie</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── COMMITMENTS & GUARANTEES SECTION (REFINED) ─── */}
      <div className="about-guarantees-section">
        <div className="container">
          <div className="guarantees-grid-layout">
            <div className="guarantees-intro-col">
              <h2>Nos engagements et garanties</h2>
              <p>
                Chaque maison construite par Ossa Bois France bénéficie de toutes les garanties constructeurs requises par la loi, y compris l&apos;assurance décennale.
              </p>
              <Link className="about-btn" href={`/${locale}/maisons`}>
                Découvrir nos modèles de maisons
                <span className="btn-arrow">→</span>
              </Link>
            </div>

            <div className="guarantees-list-col">
              <div className="commitments-vertical-list">
                {commitments.map((item, idx) => (
                  <div className="commitment-item" key={idx}>
                    <div className="commitment-title-row">
                      <Image
                        src="https://ossaboisfrance.com/wp-content/uploads/2025/10/leaf-line.png"
                        alt="Icône écologie"
                        width={37}
                        height={37}
                        className="commitment-icon"
                      />
                      <h3>{item.title}</h3>
                    </div>
                    <p className="commitment-desc">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FAQ ACCORDION SECTION (REFINED) ─── */}
      <div className="about-faq-section">
        <div className="container">
          <div className="faq-grid-layout">
            <div className="faq-intro-col">
              <h2>Questions-réponses sur l’ossature bois</h2>
              <p>
                Retrouvez les réponses aux questions les plus fréquentes sur la construction de maisons modulaires et le respect des normes.
              </p>
            </div>

            <div className="faq-accordion-col">
              <div className="accordion-wrapper">
                {faqs.map((faq) => {
                  const isOpen = openFaq === faq.id;
                  return (
                    <div key={faq.id} className={`accordion-item ${isOpen ? "active" : ""}`}>
                      <button
                        className="accordion-title-btn"
                        onClick={() => toggleFaq(faq.id)}
                        aria-expanded={isOpen}
                      >
                        <span>{faq.question}</span>
                        <span className="accordion-icon-box">
                          {isOpen ? (
                            <svg className="accordion-icon" viewBox="0 0 448 512">
                              <path fill="currentColor" d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" />
                            </svg>
                          ) : (
                            <svg className="accordion-icon" viewBox="0 0 448 512">
                              <path fill="currentColor" d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" />
                            </svg>
                          )}
                        </span>
                      </button>
                      <div className="accordion-content-panel">
                        <div className="accordion-content-inner">
                          <p>{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
