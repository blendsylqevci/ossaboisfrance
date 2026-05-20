"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Locale } from "@/lib/i18n";

type B2BPageProps = {
  params: Promise<{ locale: Locale }>;
};

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let start = 0;
    const end = target;
    const duration = 1200; // 1.2 seconds
    const steps = 40;
    const stepValue = end / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.round(stepValue * currentStep));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  if (!mounted) {
    return <>{target}{suffix}</>;
  }

  return <>{count}{suffix}</>;
}

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
    answer: "La préfabrication en atelier garantit une précision millimétrique grâce à nos équipements numériques et un contrôle qualité constant à l'abri des intempéries. Cela permet également de diviser par deux les délais de chantier et de minimiser les déchets, tout en garantissant des finitions de qualité supérieure."
  }
];

const steps = [
  {
    num: "01",
    title: "Planification & Étude",
    desc: "Analyse technique de vos fichiers DAO/CAD par notre bureau d'études intégré pour optimiser la structure."
  },
  {
    num: "02",
    title: "Taille & Découpe CNC",
    desc: "Usinage robotisé de haute précision sur notre centre de taille numérique pour un ajustement parfait."
  },
  {
    num: "03",
    title: "Assemblage en Usine",
    desc: "Préfabrication des murs avec isolation RE2020 intégrée et pose facultative des menuiseries extérieures."
  },
  {
    num: "04",
    title: "Logistique & Livraison",
    desc: "Livraison directe des kits numérotés sur votre chantier partout en France, accompagnés des plans de montage."
  }
];

export default function B2BPage({ params }: B2BPageProps) {
  const { locale } = React.use(params);
  const [openFaq, setOpenFaq] = useState<string | null>("faq-1");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileName(e.dataTransfer.files[0].name);
      const fileInput = document.getElementById("b2b-file") as HTMLInputElement;
      if (fileInput) {
        fileInput.files = e.dataTransfer.files;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitStatus("success");
      setFileName(null);
      (e.target as HTMLFormElement).reset();
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="b2b-page">
      {/* ─── TYPOGRAPHIC HERO SECTION (NO BACKGROUND IMAGE) ─── */}
      <div className="b2b-hero-clean">
        <div className="container">
          <div className="b2b-hero-grid-layout">
            <div className="b2b-hero-text-col">
              <span className="b2b-hero-kicker">Partenaires & Professionnels</span>
              <h1>Travailler avec nous</h1>
              <p className="hero-description">
                Associez notre usine de production à votre expertise pour des projets bois d&apos;exception. Un partenariat de confiance, réactif et économiquement avantageux.
              </p>
            </div>
            <div className="b2b-hero-stats-col">
              <div className="b2b-hero-stat-item">
                <span className="hero-stat-num">
                  <AnimatedNumber target={50} suffix="+" />
                </span>
                <span className="hero-stat-lbl">Partenaires professionnels actifs en France</span>
              </div>
              <div className="b2b-hero-stat-item">
                <span className="hero-stat-num">
                  <AnimatedNumber target={8} suffix="+ ans" />
                </span>
                <span className="hero-stat-lbl">De collaboration moyenne sans interruption</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FORM SECTION (MOVED TO TOP FOR HIGHER CONVERSION & VISIBILITY) ─── */}
      <div className="b2b-form-section" id="b2b-form-section">
        <div className="container">
          <div className="b2b-form-layout">
            {/* Left side: Form */}
            <div className="b2b-form-col">
              <h2>Demander une étude</h2>
              <p className="b2b-form-subtitle">
                Sélectionnez le type de collaboration et transmettez-nous vos plans de projet pour analyse par nos ingénieurs.
              </p>
              
              {submitStatus === "success" && (
                <div className="form-alert success">
                  <p>✓ Votre demande a été transmise avec succès. Notre bureau d&apos;études l&apos;étudie dans les meilleurs délais.</p>
                </div>
              )}
              {submitStatus === "error" && (
                <div className="form-alert error">
                  <p>✗ Une erreur est survenue lors de l&apos;envoi. Veuillez réessayer ou nous contacter par email.</p>
                </div>
              )}

              <form className="contact-form b2b-form" id="b2b-forma" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="b2b-inquiry">Type de projet / collaboration</label>
                  <select id="b2b-inquiry" name="inquiryType" required>
                    <option value="">Sélectionnez une option</option>
                    <option value="cnc">Découpe CNC & Charpente</option>
                    <option value="architecture">Bureau d&apos;études & Architecture (Plans/Permis)</option>
                    <option value="kit">Fabrication de Kit (Murs, Isolation, Fenêtres)</option>
                    <option value="montage">Construction & Montage complet</option>
                    <option value="autre">Autre type de projet</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="b2b-firstname">Prénom</label>
                    <input id="b2b-firstname" type="text" name="firstname" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="b2b-lastname">Nom de famille</label>
                    <input id="b2b-lastname" type="text" name="lastname" required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="b2b-email">Email professionnel</label>
                    <input id="b2b-email" type="email" name="email" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="b2b-phone">Numéro de téléphone</label>
                    <input id="b2b-phone" type="tel" name="phone" required />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="b2b-message">Message</label>
                  <textarea 
                    id="b2b-message" 
                    name="message" 
                    rows={5} 
                    placeholder="Détaillez vos besoins (dimensions, plans déjà existants, délais de livraison attendus...)" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Import File (Plans, PDF, CAD, ZIP...)</label>
                  <div 
                    className={`b2b-upload-field ${isDragActive ? "drag-active" : ""}`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input 
                      id="b2b-file" 
                      type="file" 
                      name="file" 
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.dwg,.dxf"
                      onChange={handleFileChange}
                    />
                    <div className="b2b-upload-content">
                      <svg className="upload-svg" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <span className="upload-text">
                        {fileName ? fileName : "Déposer vos fichiers ici ou cliquer pour choisir"}
                      </span>
                    </div>
                  </div>
                </div>

                <button className="button button-loading-container" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="btn-spinner"></span>
                      Envoi en cours...
                    </>
                  ) : (
                    "Soumettre le projet"
                  )}
                </button>
              </form>
            </div>

            {/* Right side: Commitments & Assurances card */}
            <div className="b2b-info-col">
              <div className="b2b-commitments-card">
                <h3>Pourquoi choisir Ossa Bois France ?</h3>
                
                <div className="b2b-commitment-item">
                  <svg className="commitment-check" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <div>
                    <h4>Bureau d&apos;Études Intégré</h4>
                    <p>Optimisation technique poussée de vos plans de pose et de découpe par nos ingénieurs.</p>
                  </div>
                </div>
                
                <div className="b2b-commitment-item">
                  <svg className="commitment-check" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <div>
                    <h4>Usinage CNC Haute Précision</h4>
                    <p>Découpe robotisée garantissant une précision millimétrique de chaque élément d&apos;ossature.</p>
                  </div>
                </div>
                
                <div className="b2b-commitment-item">
                  <svg className="commitment-check" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <div>
                    <h4>Garanties & Assurances</h4>
                    <p>Tous nos kits et structures préfabriquées bénéficient de l&apos;assurance décennale française.</p>
                  </div>
                </div>

                <div className="b2b-commitment-item">
                  <svg className="commitment-check" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <div>
                    <h4>Approvisionnement Certifié</h4>
                    <p>Utilisation exclusive de bois certifié PEFC issu de forêts gérées durablement.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── PROCESS timeline SECTION ─── */}
      <div className="b2b-process-section">
        <div className="container">
          <div className="b2b-process-header">
            <h2>Notre processus de collaboration</h2>
            <p>
              Un flux de travail industriel structuré et rigoureux pour garantir la précision,
              le respect des délais et la solidité de vos constructions.
            </p>
          </div>

          <div className="b2b-process-grid">
            {steps.map((step, idx) => (
              <div className="b2b-step-card" key={idx}>
                <div className="b2b-step-num">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── TRUST & WELCOMING SECTION ─── */}
      <div className="b2b-trust-section">
        <div className="container">
          <div className="b2b-trust-layout">
            <div className="b2b-trust-content">
              <span className="b2b-trust-kicker">Une relation humaine et durable</span>
              <h2>Une culture de la fidélité et de l&apos;accueil</h2>
              <p>
                Chez Ossa Bois France, nous ne sommes pas de simples fournisseurs de bois. Nous sommes des partenaires de proximité, chaleureux, à l&apos;écoute et toujours prêts à vous accueillir pour échanger autour de vos projets ou visiter notre usine.
              </p>
              <p>
                Nous croyons en une communication transparente, simple et réactive. C&apos;est cette approche humaine alliée à la rentabilité économique de nos solutions qui fait notre force : <strong>la totalité de nos partenaires professionnels collaborent avec nous depuis plus de 8 ans sans jamais changer de fabricant.</strong>
              </p>
            </div>
            <div className="b2b-trust-stats">
              <div className="b2b-stat-box">
                <span className="stat-number">
                  <AnimatedNumber target={8} suffix="+" />
                </span>
                <span className="stat-label">Années de collaboration moyenne avec nos partenaires</span>
              </div>
              <div className="b2b-stat-box">
                <span className="stat-number">
                  <AnimatedNumber target={100} suffix="%" />
                </span>
                <span className="stat-label">De taux de rétention de nos partenaires clés</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FAQ ACCORDION SECTION ─── */}
      <div className="about-faq-section">
        <div className="container">
          <div className="faq-grid-layout">
            <div className="faq-intro-col">
              <h2>Questions-réponses sur l’ossature bois</h2>
              <p>
                Every house built by Pobepo has all the builder&apos;s guarantees required by law, including ten-year insurance.
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
                          )
                          }
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
