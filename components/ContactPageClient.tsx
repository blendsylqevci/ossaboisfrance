"use client";

import React, { useState } from "react";
import { Locale } from "@/lib/i18n";

type ContactPageClientProps = {
  locale: Locale;
  dict: any;
};

export function ContactPageClient({ locale, dict }: ContactPageClientProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch (err) {
      setError(
        locale === "en" 
          ? "An error occurred while sending your message. Please try again."
          : locale === "de" ? "Beim Senden Ihrer Nachricht ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut."
          : locale === "nl" ? "Er is een fout opgetreden bij het verzenden van uw bericht. Probeer het opnieuw."
          : "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer."
      );
      void err;
    } finally {
      setLoading(false);
    }
  };

  const t = dict?.contact || {};

  // Form subject options
  const subjectOptions = [
    { value: "", label: locale === "en" ? "Select a subject" : locale === "de" ? "Wählen Sie ein Thema" : locale === "nl" ? "Selecteer een onderwerp" : "Sélectionnez un sujet" },
    { value: "devis", label: locale === "en" ? "House study & quote request" : locale === "de" ? "Hausanalyse & Preisanfrage" : locale === "nl" ? "Huisstudie & offerteaanvraag" : "Demande d'étude & devis de maison" },
    { value: "info", label: locale === "en" ? "Technical information request" : locale === "de" ? "Technische Informationsanfrage" : locale === "nl" ? "Technische informatieaanvraag" : "Demande d'informations techniques" },
    { value: "visite", label: locale === "en" ? "Visit our prefabrication plant" : locale === "de" ? "Besichtigung unseres Vorfertigungswerks" : locale === "nl" ? "Bezoek aan onze prefabriek" : "Visite de notre usine de préfabrication" },
    { value: "b2b", label: locale === "en" ? "B2B Partnership (Architects, Developers)" : locale === "de" ? "B2B-Partnerschaft (Architekten, Entwickler)" : locale === "nl" ? "B2B Partnerschap (Architecten, Ontwikkelaars)" : "Partenariat B2B (Architectes, Constructeurs, Promoteurs)" },
    { value: "autre", label: locale === "en" ? "Other request" : locale === "de" ? "Andere Anfrage" : locale === "nl" ? "Andere vraag" : "Autre demande" }
  ];

  const trans = {
    kicker: locale === "en" ? "Contact & Support" : locale === "de" ? "Kontakt & Support" : locale === "nl" ? "Contact & Support" : "Contact & Support",
    heroTitle: locale === "en" ? "Let's discuss your building project" : locale === "de" ? "Lassen Sie uns über Ihr Bauprojekt sprechen" : locale === "nl" ? "Laten we uw bouwproject bespreken" : "Discutons de votre projet de construction",
    heroSubtitle: locale === "en"
      ? "Are you planning to build a modular timber frame house? A question about our prefabrication process? Our team of experts is at your service to accompany you."
      : locale === "de" ? "Planen Sie den Bau eines modularen Holzrahmenhauses? Eine Frage zu unserem Vorfertigungsprozess? Unser Expertenteam steht Ihnen gerne zur Seite."
      : locale === "nl" ? "Bent u van plan een modulair houtskeletwoning te bouwen? Een vraag over ons prefabriceerproces? Ons team van experts staat voor u klaar."
      : "Vous envisagez de construire une maison modulaire à ossature bois ? Une question sur notre processus de préfabrication ? Notre équipe d'experts est à votre écoute pour vous accompagner.",
    stat1Num: "48h",
    stat1Lbl: locale === "en" ? "Average response time" : locale === "de" ? "Mittlere Antwortzeit" : locale === "nl" ? "Gemiddelde reactietijd" : "Délai moyen de réponse",
    stat2Num: "100%",
    stat2Lbl: locale === "en" ? "Custom design" : locale === "de" ? "Maßgeschneidertes Design" : locale === "nl" ? "Ontwerp op maat" : "Conception sur mesure",
    stat3Num: locale === "en" ? "10 yrs" : locale === "de" ? "10 J." : locale === "nl" ? "10 jr" : "10 ans",
    stat3Lbl: locale === "en" ? "Manufacturer decennial guarantee" : locale === "de" ? "Zehnjährige Herstellergarantie" : locale === "nl" ? "10 jaar fabrieksgarantie" : "Garantie décennale fabricant",
    
    formTitle: locale === "en" ? "Contact Form" : locale === "de" ? "Kontaktformular" : locale === "nl" ? "Contactformulier" : "Formulaire de contact",
    formSubtitle: locale === "en" 
      ? "Fill in the form below and a technical advisor will contact you shortly."
      : locale === "de" ? "Füllen Sie das folgende Formular aus und ein technischer Berater wird sich in Kürze mit Ihnen in Verbindung setzen."
      : locale === "nl" ? "Vul het onderstaande formulier in en een technisch adviseur neemt spoedig contact met u op."
      : "Remplissez le formulaire ci-dessous et un conseiller technique prendra contact avec vous rapidement.",
    
    successTitle: locale === "en" ? "Message sent successfully!" : locale === "de" ? "Nachricht erfolgreich gesendet!" : locale === "nl" ? "Bericht succesvol verzonden!" : "Message envoyé avec succès !",
    successDesc: locale === "en"
      ? "Thank you for your interest in OSSA Bois France. Our technical team is reviewing your request and will reply within 24 to 48 business hours."
      : locale === "de" ? "Vielen Dank für Ihr Interesse an OSSA Bois France. Unser technisches Team prüft Ihre Anfrage und wird Ihnen innerhalb von 24 bis 48 Werktagen antworten."
      : locale === "nl" ? "Dank u voor uw interesse in OSSA Bois France. Ons technisch team beoordeelt uw aanvraag en antwoordt binnen 24 tot 48 werkuren."
      : "Merci pour votre intérêt envers OSSA Bois France. Notre équipe technique étudie votre demande et vous répondra sous 24 à 48 heures ouvrées.",

    firstName: locale === "en" ? "First Name" : locale === "de" ? "Vorname" : locale === "nl" ? "Voornaam" : "Prénom",
    lastName: locale === "en" ? "Last Name" : locale === "de" ? "Nachname" : locale === "nl" ? "Achternaam" : "Nom",
    email: locale === "en" ? "Email Address" : locale === "de" ? "E-Mail-Adresse" : locale === "nl" ? "E-mailadres" : "Adresse e-mail",
    phone: locale === "en" ? "Phone Number" : locale === "de" ? "Telefonnummer" : locale === "nl" ? "Telefoonnummer" : "Téléphone",
    subjectLabel: locale === "en" ? "Subject of your request" : locale === "de" ? "Betreff Ihrer Anfrage" : locale === "nl" ? "Onderwerp van uw verzoek" : "Sujet de votre demande",
    messageLabel: locale === "en" ? "Message" : locale === "de" ? "Nachricht" : locale === "nl" ? "Bericht" : "Message",
    messagePlaceholder: locale === "en"
      ? "Briefly describe your project (location, home model, estimated budget)..."
      : locale === "de" ? "Beschreiben Sie kurz Ihr Projekt (Bauort, Hausmodell, geschätztes Budget)..."
      : locale === "nl" ? "Beschrijf kort uw project (bouwlocatie, huismodel, geschat budget)..."
      : "Décrivez brièvement votre projet (lieu de construction, type de modèle, budget estimé)...",
    privacyText: locale === "en"
      ? "I accept the privacy policy of OSSA Bois France. Collected data is confidential and processed solely to answer my project request."
      : locale === "de" ? "Ich akzeptiere die Datenschutzrichtlinie von OSSA Bois France. Die erhobenen Daten sind vertraulich und werden ausschließlich zur Beantwortung meiner Projektanfrage verarbeitet."
      : locale === "nl" ? "Ik accepteer het privacybeleid van OSSA Bois France. De verzamelde gegevens zijn vertrouwelijk en worden uitsluitend verwerkt om mijn projectaanvraag te beantwoorden."
      : "J'accepte la politique de confidentialité de OSSA Bois France. Les données recueillies sont confidentielles et traitées uniquement pour répondre à ma demande de projet.",
    
    submitBtn: locale === "en" ? "Send Request" : locale === "de" ? "Anfrage senden" : locale === "nl" ? "Aanvraag verzenden" : "Envoyer la demande",
    loadingText: locale === "en" ? "Sending..." : locale === "de" ? "Wird gesendet..." : locale === "nl" ? "Verzenden..." : "Envoi en cours...",

    hqTitle: locale === "en" ? "Headquarters" : locale === "de" ? "Hauptsitz" : locale === "nl" ? "Hoofdkantoor" : "Siège social",
    usineTitle: locale === "en" ? "Factory & Logistics" : locale === "de" ? "Werk & Logistik" : locale === "nl" ? "Fabriek & Logistiek" : "Usine & Logistique",
    usineDesc: locale === "en" ? "Prefabrication of modules & CNC numerical machining." : locale === "de" ? "Vorfertigung der Module & CNC numerische Bearbeitung." : locale === "nl" ? "Prefabricage van modules & CNC numerieke bewerking." : "Préfabrication des modules & Usinage numérique CNC.",
    usineWarning: locale === "en" ? "Visits by appointment only" : locale === "de" ? "Besuche nur nach Vereinbarung" : locale === "nl" ? "Bezoeken alleen op afspraak" : "Visites uniquement sur rendez-vous",
    
    b2bTitle: locale === "en" ? "Professionals & B2B" : locale === "de" ? "Fachleute & B2B" : locale === "nl" ? "Professionals & B2B" : "Professionnels & B2B",
    b2bDesc: locale === "en" ? "Architects, developers, and engineering offices." : locale === "de" ? "Architekten, Bauträger und Planungsbüros." : locale === "nl" ? "Architecten, projectontwikkelaars en ingenieursbureaus." : "Architectes, promoteurs et bureaux d'études.",
    b2bDirect: locale === "en" ? "Direct email:" : locale === "de" ? "Direkte E-Mail:" : locale === "nl" ? "Direct e-mailadres:" : "Ligne directe:",

    hoursTitle: locale === "en" ? "Opening Hours" : locale === "de" ? "Öffnungszeiten" : locale === "nl" ? "Openingstijden" : "Horaires d'ouverture",
    hoursWeek: locale === "en" ? "Monday – Friday: 9:00 AM – 12:00 PM, 1:30 PM – 6:00 PM" : locale === "de" ? "Montag – Freitag: 9:00 – 12:00 Uhr, 13:30 – 18:00 Uhr" : locale === "nl" ? "Maandag – Vrijdag: 9:00 – 12:00 uur, 13:30 – 18:00 uur" : "Lundi – Vendredi : 9h00 – 12h00, 13h30 – 18h00",
    hoursWeekend: locale === "en" ? "Saturday – Sunday: Closed" : locale === "de" ? "Samstag – Sonntag: Geschlossen" : locale === "nl" ? "Zaterdag – Zondag: Gesloten" : "Samedi – Dimanche : Fermé",

    mapWidgetTitle: locale === "en" ? "High Precision Prefabrication" : locale === "de" ? "Hochpräzise Vorfertigung" : locale === "nl" ? "Hoge Precisie Prefabricage" : "Préfabrication Haute Précision",
    mapWidgetDesc: locale === "en"
      ? "All our wood structures are factory assembled to guarantee a premium level of finish and top-tier thermal insulation."
      : locale === "de" ? "Alle unsere Holzstrukturen werden im Werk montiert, um eine erstklassige Verarbeitung und eine erstklassige Wärmedämmung zu garantieren."
      : locale === "nl" ? "Al onze houten structuren worden in de fabriek gemonteerd om een hoogwaardige afwerking en hoogwaardige thermische isolatie te garanderen."
      : "Toutes nos structures bois sont assemblées en usine pour garantir un niveau de finition et une isolation thermique de premier ordre."
  };

  return (
    <section className="contact-page">
      {/* ─── ENTERPRISE HERO HEADER ─── */}
      <div className="contact-hero-section">
        <div className="container contact-hero-grid">
          <div className="contact-hero-left">
            <span className="contact-kicker">{trans.kicker}</span>
            <h1>{t.title || trans.heroTitle}</h1>
            <p className="contact-subtitle">
              {t.subtitle || trans.heroSubtitle}
            </p>
          </div>
          <div className="contact-hero-right">
            <div className="contact-quick-stats">
              <div className="stat-card">
                <span className="stat-num">{trans.stat1Num}</span>
                <span className="stat-lbl">{trans.stat1Lbl}</span>
              </div>
              <div className="stat-card">
                <span className="stat-num">{trans.stat2Num}</span>
                <span className="stat-lbl">{trans.stat2Lbl}</span>
              </div>
              <div className="stat-card">
                <span className="stat-num">{trans.stat3Num}</span>
                <span className="stat-lbl">{trans.stat3Lbl}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container contact-main-grid">
        {/* ─── LEFT COLUMN: CONTACT FORM ─── */}
        <div className="contact-form-container">
          <div className="contact-form-header">
            <h2>{t.formTitle || trans.formTitle}</h2>
            <p>{trans.formSubtitle}</p>
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
                <h3>{trans.successTitle}</h3>
                <p>{t.success || trans.successDesc}</p>
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
                  <label htmlFor="contact-firstname">{trans.firstName} *</label>
                  <input id="contact-firstname" type="text" name="firstname" required placeholder="Jean" />
                </div>
                <div className="form-group-enterprise">
                  <label htmlFor="contact-lastname">{trans.lastName} *</label>
                  <input id="contact-lastname" type="text" name="lastname" required placeholder="Dupont" />
                </div>
              </div>

              <div className="form-row-2col">
                <div className="form-group-enterprise">
                  <label htmlFor="contact-email">{t.email || trans.email} *</label>
                  <input id="contact-email" type="email" name="email" required placeholder="jean.dupont@exemple.com" />
                </div>
                <div className="form-group-enterprise">
                  <label htmlFor="contact-phone">{t.phone || trans.phone}</label>
                  <input id="contact-phone" type="tel" name="phone" placeholder="+33 (0) 6 12 34 56 78" />
                </div>
              </div>

              <div className="form-group-enterprise">
                <label htmlFor="contact-subject">{t.subject || trans.subjectLabel} *</label>
                <div className="select-wrapper-enterprise">
                  <select id="contact-subject" name="subject" required defaultValue="">
                    {subjectOptions.map((opt, i) => (
                      <option key={i} value={opt.value} disabled={opt.value === ""}>{opt.label}</option>
                    ))}
                  </select>
                  <div className="select-arrow-enterprise">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="form-group-enterprise">
                <label htmlFor="contact-message">{t.message || trans.messageLabel} *</label>
                <textarea id="contact-message" name="message" rows={6} required placeholder={trans.messagePlaceholder} />
              </div>

              <div className="form-checkbox-enterprise">
                <label className="checkbox-container">
                  <input type="checkbox" required />
                  <span className="checkmark-box"></span>
                  <span className="checkbox-text">
                    {trans.privacyText}
                  </span>
                </label>
              </div>

              <button className="contact-submit-btn" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-enterprise"></span>
                    <span>{t.loading || trans.loadingText}</span>
                  </>
                ) : (
                  <span>{t.submit || trans.submitBtn}</span>
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
              <h3>{t.details?.address || trans.hqTitle}</h3>
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
              <h3>{trans.usineTitle}</h3>
            </div>
            <div className="details-card-body">
              <p>{trans.usineDesc}</p>
              <span className="badge-warning-enterprise">{trans.usineWarning}</span>
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
              <h3>{trans.b2bTitle}</h3>
            </div>
            <div className="details-card-body">
              <p>{trans.b2bDesc}</p>
              <p className="contact-link-row">
                <span className="link-label">{trans.b2bDirect}</span>
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
              <h3>{t.details?.hours || trans.hoursTitle}</h3>
            </div>
            <div className="details-card-body">
              <p>{t.details?.hoursText || trans.hoursWeek}</p>
              <p className="closed-label">{trans.hoursWeekend}</p>
            </div>
          </div>

          {/* Styled European Presence Map Widget */}
          <div className="contact-map-widget-enterprise">
            <div className="widget-overlay-gradient"></div>
            <div className="widget-content">
              <h4>{trans.mapWidgetTitle}</h4>
              <p>{trans.mapWidgetDesc}</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
