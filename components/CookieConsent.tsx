"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Locale } from "@/lib/i18n";

type CookieConsentProps = {
  locale: Locale;
};

type TranslationSet = {
  title: string;
  description: string;
  acceptAll: string;
  decline: string;
  customize: string;
  saveSelection: string;
  essentialTitle: string;
  essentialDesc: string;
  analyticsTitle: string;
  analyticsDesc: string;
  policyLink: string;
  cookiePolicy: string;
  reopenLabel: string;
};

const translations: Record<Locale, TranslationSet> = {
  fr: {
    title: "Gestion des cookies 🍪",
    description: "Nous utilisons des cookies essentiels pour le bon fonctionnement de notre site et de votre configurateur. Vous pouvez également accepter les cookies de mesure d'audience pour nous aider à améliorer votre expérience.",
    acceptAll: "Tout accepter",
    decline: "Uniquement essentiels",
    customize: "Personnaliser",
    saveSelection: "Enregistrer mes choix",
    essentialTitle: "Cookies indispensables (Toujours actifs)",
    essentialDesc: "Requis pour naviguer sur le site, enregistrer vos sytèmes de favoris et faire fonctionner le configurateur de maisons.",
    analyticsTitle: "Cookies de mesure d'audience",
    analyticsDesc: "Nous permettent d'analyser le trafic du site de manière anonyme afin d'optimiser l'ergonomie et la vitesse du site.",
    policyLink: "Politique de confidentialité",
    cookiePolicy: "En savoir plus",
    reopenLabel: "Paramètres des cookies"
  },
  en: {
    title: "Cookie Settings 🍪",
    description: "We use essential cookies to ensure the proper functioning of our website and your configurator. You can also accept analytical cookies to help us improve your browsing experience.",
    acceptAll: "Accept All",
    decline: "Essential Only",
    customize: "Customize Settings",
    saveSelection: "Save Preferences",
    essentialTitle: "Strictly Necessary Cookies (Always Active)",
    essentialDesc: "Required for site navigation, saving your favorites list, and operating the interactive house configurator.",
    analyticsTitle: "Analytical & Performance Cookies",
    analyticsDesc: "Allows us to anonymously analyze site traffic to optimize performance, ergonomics, and page load speeds.",
    policyLink: "Privacy Policy",
    cookiePolicy: "Learn more",
    reopenLabel: "Cookie settings"
  },
  de: {
    title: "Cookie-Einstellungen 🍪",
    description: "Wir verwenden essenzielle Cookies, um das ordnungsgemäße Funktionieren unserer Website und Ihres Konfigurators zu gewährleisten. Sie können auch Analyse-Cookies akzeptieren, um uns zu helfen, Ihr Surferlebnis zu verbessern.",
    acceptAll: "Alle akzeptieren",
    decline: "Nur essenzielle",
    customize: "Anpassen",
    saveSelection: "Auswahl speichern",
    essentialTitle: "Unbedingt erforderliche Cookies (Immer aktiv)",
    essentialDesc: "Erforderlich für die Navigation auf der Website, das Speichern Ihrer Favoritenliste und die Nutzung des Haus-Konfigurators.",
    analyticsTitle: "Analytische & Performance-Cookies",
    analyticsDesc: "Ermöglicht uns die anonyme Analyse des Website-Verkehrs, um Leistung, Ergonomie und Ladegeschwindigkeit zu optimieren.",
    policyLink: "Datenschutzerklärung",
    cookiePolicy: "Mehr erfahren",
    reopenLabel: "Cookie-Einstellungen"
  },
  nl: {
    title: "Cookie-instellingen 🍪",
    description: "We gebruiken essentiële cookies om de goede werking van onze website en uw configurator te garanderen. U kunt ook analytische cookies accepteren om ons te helpen uw browse-ervaring te verbeteren.",
    acceptAll: "Alles accepteren",
    decline: "Alleen essentiële",
    customize: "Aanpassen",
    saveSelection: "Voorkeuren opslaan",
    essentialTitle: "Strikt noodzakelijke cookies (Altijd actief)",
    essentialDesc: "Vereist voor websitenavigatie, het opslaan van uw favorietenlijst en de werking van de interactieve huisconfigurator.",
    analyticsTitle: "Analytische & prestatiecookies",
    analyticsDesc: "Stelt ons in staat om anoniem websiteverkeer te analyseren om de prestaties, ergonomie en laadsnelheid te optimaliseren.",
    policyLink: "Privacybeleid",
    cookiePolicy: "Meer informatie",
    reopenLabel: "Cookie-instellingen"
  }
};

function applyConsentMode(analyticsGranted: boolean) {
  if (typeof window === "undefined") return;

  // Set a global variable for custom scripts
  (window as any).cookieConsentState = analyticsGranted ? "all" : "essential";

  // Google Consent Mode v2 update call if gtag is loaded
  if ((window as any).gtag) {
    (window as any).gtag("consent", "update", {
      analytics_storage: analyticsGranted ? "granted" : "denied",
      ad_storage: "denied", // We don't use advertisement cookies
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }
}

export function CookieConsent({ locale }: CookieConsentProps) {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [analyticsAccepted, setAnalyticsAccepted] = useState(false);

  const t = translations[locale] || translations.fr;

  useEffect(() => {
    setMounted(true);
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setShowBanner(true);
    } else {
      // If consent is already saved, apply Consent Mode
      applyConsentMode(consent === "all");
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookie_consent", "all");
    applyConsentMode(true);
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "essential");
    applyConsentMode(false);
    setShowBanner(false);
  };

  const handleSaveCustom = () => {
    const consentValue = analyticsAccepted ? "all" : "essential";
    localStorage.setItem("cookie_consent", consentValue);
    applyConsentMode(analyticsAccepted);
    setShowBanner(false);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating Reopen Button (GDPR Requirement: Choices must be editable) */}
      {!showBanner && (
        <button
          className="cookie-reopen-trigger"
          onClick={() => {
            const consent = localStorage.getItem("cookie_consent");
            setAnalyticsAccepted(consent === "all");
            setShowBanner(true);
          }}
          type="button"
          aria-label={t.reopenLabel}
          title={t.reopenLabel}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 0 0-10 10v0a10 10 0 0 0 10 10v0a10 10 0 0 0 10-10v0A10 10 0 0 0 12 2Z" />
            <path d="M12 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
            <path d="M7.5 10.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
            <path d="M16.5 11.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
            <path d="M11.5 16.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
          </svg>
        </button>
      )}

      {/* Main Cookie Consent Banner */}
      {showBanner && (
        <div className="cookie-consent-overlay" role="dialog" aria-labelledby="cookie-title" aria-describedby="cookie-desc">
          <div className="cookie-consent-card">
            {!showCustomizer ? (
              <>
                <h3 id="cookie-title">{t.title}</h3>
                <p id="cookie-desc" className="cookie-consent-desc">
                  {t.description}{" "}
                  <Link href={`/${locale}/politique-de-confidentialite`} className="cookie-policy-link">
                    {t.cookiePolicy}
                  </Link>
                  .
                </p>
                <div className="cookie-consent-buttons">
                  <button className="button primary cookie-accept-btn" onClick={handleAcceptAll} type="button">
                    {t.acceptAll}
                  </button>
                  <button className="button secondary cookie-decline-btn" onClick={handleDecline} type="button">
                    {t.decline}
                  </button>
                  <button className="cookie-customize-link-btn" onClick={() => setShowCustomizer(true)} type="button">
                    {t.customize}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>{t.customize}</h3>
                
                <div className="cookie-customizer-options">
                  {/* Essential Option */}
                  <div className="cookie-option-row disabled">
                    <div className="cookie-option-info">
                      <strong>{t.essentialTitle}</strong>
                      <p>{t.essentialDesc}</p>
                    </div>
                    <div className="cookie-checkbox-wrapper">
                      <input type="checkbox" checked disabled id="cookie-opt-essential" />
                      <label htmlFor="cookie-opt-essential" className="disabled-checkbox-label" />
                    </div>
                  </div>

                  {/* Analytics Option */}
                  <div className="cookie-option-row">
                    <div className="cookie-option-info">
                      <strong>{t.analyticsTitle}</strong>
                      <p>{t.analyticsDesc}</p>
                    </div>
                    <div className="cookie-checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={analyticsAccepted}
                        onChange={(e) => setAnalyticsAccepted(e.target.checked)}
                        id="cookie-opt-analytics"
                      />
                      <label htmlFor="cookie-opt-analytics" className="checkbox-label" />
                    </div>
                  </div>
                </div>

                <div className="cookie-customizer-buttons">
                  <button className="button primary cookie-save-btn" onClick={handleSaveCustom} type="button">
                    {t.saveSelection}
                  </button>
                  <button className="cookie-back-btn" onClick={() => setShowCustomizer(false)} type="button">
                    ← Retour
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
