"use client";

import React, { useState } from "react";
import { Locale } from "@/lib/i18n";

type ContactPageProps = {
  params: Promise<{ locale: Locale }>;
};

export default function ContactPage({ params }: ContactPageProps) {
  const { locale } = React.use(params);
  void locale;

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulate enterprise api call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch (err) {
      setError("Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer.");
      void err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact-page">
      {/* ─── ENTERPRISE HERO HEADER ─── */}
      <div className="contact-hero-section">
        <div className="container contact-hero-grid">
          <div className="contact-hero-left">
            <span className="contact-kicker">Contact & Support</span>
            <h1>Discutons de votre projet de construction</h1>
            <p className="contact-subtitle">
              Vous envisagez de construire une maison modulaire à ossature bois ? Une question sur notre processus de préfabrication ? Notre équipe d&apos;experts est à votre écoute pour vous accompagner.
            </p>
          </div>
          <div className="contact-hero-right">
            <div className="contact-quick-stats">
              <div className="stat-card">
                <span className="stat-num">48h</span>
                <span className="stat-lbl">Délai moyen de réponse</span>
              </div>
              <div className="stat-card">
                <span className="stat-num">100%</span>
                <span className="stat-lbl">Conception sur mesure</span>
              </div>
              <div className="stat-card">
                <span className="stat-num">10 ans</span>
                <span className="stat-lbl">Garantie décennale fabricant</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container contact-main-grid">
        {/* ─── LEFT COLUMN: CONTACT FORM ─── */}
        <div className="contact-form-container">
          <div className="contact-form-header">
            <h2>Formulaire de contact</h2>
            <p>Remplissez le formulaire ci-dessous et un conseiller technique prendra contact avec vous rapidement.</p>
          </div>

          {submitted ? (
            <div className="contact-feedback success">
              <div className="feedback-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div className="feedback-content">
                <h3>Message envoyé avec succès !</h3>
                <p>Merci pour votre intérêt envers OSSA Bois France. Notre équipe technique étudie votre demande et vous répondra sous 24 à 48 heures ouvrées.</p>
              </div>
            </div>
          ) : (
            <form className="contact-form-enterprise" onSubmit={handleSubmit}>
              {error && (
                <div className="contact-feedback error">
                  <p>{error}</p>
                </div>
              )}

              <div className="form-row-2col">
                <div className="form-group-enterprise">
                  <label htmlFor="contact-firstname">Prénom *</label>
                  <input id="contact-firstname" type="text" name="firstname" required placeholder="Jean" />
                </div>
                <div className="form-group-enterprise">
                  <label htmlFor="contact-lastname">Nom *</label>
                  <input id="contact-lastname" type="text" name="lastname" required placeholder="Dupont" />
                </div>
              </div>

              <div className="form-row-2col">
                <div className="form-group-enterprise">
                  <label htmlFor="contact-email">Adresse e-mail *</label>
                  <input id="contact-email" type="email" name="email" required placeholder="jean.dupont@exemple.com" />
                </div>
                <div className="form-group-enterprise">
                  <label htmlFor="contact-phone">Téléphone</label>
                  <input id="contact-phone" type="tel" name="phone" placeholder="+33 (0) 6 12 34 56 78" />
                </div>
              </div>

              <div className="form-group-enterprise">
                <label htmlFor="contact-subject">Sujet de votre demande *</label>
                <div className="select-wrapper-enterprise">
                  <select id="contact-subject" name="subject" required defaultValue="">
                    <option value="" disabled>Sélectionnez un sujet</option>
                    <option value="devis">Demande d&apos;étude & devis de maison</option>
                    <option value="info">Demande d&apos;informations techniques</option>
                    <option value="visite">Visite de notre usine de préfabrication</option>
                    <option value="b2b">Partenariat B2B (Architectes, Constructeurs, Promoteurs)</option>
                    <option value="autre">Autre demande</option>
                  </select>
                  <div className="select-arrow-enterprise">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="form-group-enterprise">
                <label htmlFor="contact-message">Message *</label>
                <textarea id="contact-message" name="message" rows={6} required placeholder="Décrivez brièvement votre projet (lieu de construction, type de modèle, budget estimé)..." />
              </div>

              <div className="form-checkbox-enterprise">
                <label className="checkbox-container">
                  <input type="checkbox" required />
                  <span className="checkmark-box"></span>
                  <span className="checkbox-text">
                    J&apos;accepte la politique de confidentialité de OSSA Bois France. Les données recueillies sont confidentielles et traitées uniquement pour répondre à ma demande de projet.
                  </span>
                </label>
              </div>

              <button className="contact-submit-btn" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-enterprise"></span>
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <span>Envoyer la demande</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* ─── RIGHT COLUMN: ENTERPRISE INFO & LOCATIONS ─── */}
        <div className="contact-details-container">
          {/* Card 1: Headquarters */}
          <div className="details-card-enterprise">
            <div className="details-card-header">
              <div className="details-icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h3>Siège social</h3>
            </div>
            <div className="details-card-body">
              <p className="address-text">50 rue Chanzy<br />28000 Chartres, France</p>
              <p className="contact-link-row">
                <span className="link-label">Email:</span>
                <a href="mailto:infoossabois@gmail.com">infoossabois@gmail.com</a>
              </p>
            </div>
          </div>

          {/* Card 2: Factory & Prefabrication */}
          <div className="details-card-enterprise">
            <div className="details-card-header">
              <div className="details-icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
                  <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
                  <line x1="6" y1="6" x2="6.01" y2="6"/>
                  <line x1="6" y1="18" x2="6.01" y2="18"/>
                </svg>
              </div>
              <h3>Usine & Logistique</h3>
            </div>
            <div className="details-card-body">
              <p>Préfabrication des modules & Usinage numérique CNC.</p>
              <span className="badge-warning-enterprise">Visites uniquement sur rendez-vous</span>
            </div>
          </div>

          {/* Card 3: Partners & B2B */}
          <div className="details-card-enterprise">
            <div className="details-card-header">
              <div className="details-icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3>Professionnels & B2B</h3>
            </div>
            <div className="details-card-body">
              <p>Architectes, promoteurs et bureaux d&apos;études.</p>
              <p className="contact-link-row">
                <span className="link-label">Ligne directe:</span>
                <a href="mailto:b2b@ossaboisfrance.com">b2b@ossaboisfrance.com</a>
              </p>
            </div>
          </div>

          {/* Card 4: Hours */}
          <div className="details-card-enterprise">
            <div className="details-card-header">
              <div className="details-icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3>Horaires d&apos;ouverture</h3>
            </div>
            <div className="details-card-body">
              <p>Lundi – Vendredi : 9h00 – 12h00, 13h30 – 18h00</p>
              <p className="closed-label">Samedi – Dimanche : Fermé</p>
            </div>
          </div>

          {/* Styled European Presence Map Widget */}
          <div className="contact-map-widget-enterprise">
            <div className="widget-overlay-gradient"></div>
            <div className="widget-content">
              <h4>Préfabrication Haute Précision</h4>
              <p>Toutes nos structures bois sont assemblées en usine pour garantir un niveau de finition et une isolation thermique de premier ordre.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
