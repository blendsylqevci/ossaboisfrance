"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type StoredSelection = {
  house?: {
    name?: string;
    id?: string;
    image?: string;
  };
  size?: {
    value?: string;
    price?: string;
    image?: string;
  };
  currentImage?: string;
  isolation?: { value?: string };
  outerIsolation?: { value?: string };
  facade?: { value?: string };
  etancheite?: { value?: string };
  toiture?: { value?: string };
  etancheiteTerrasse?: { value?: string };
  strukturaPlloqes?: { value?: string };
  izolimiPlloqes?: { value?: string };
  dritaret?: { value?: string };
  totalPrice?: number;
  priceBreakdown?: Array<{ label: string; value: number }>;
  perdhesa?: Record<string, number | string>;
};

const TRANSPORTATION_COST = 3000;

const euroFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const PERDHESA_LABELS: Record<string, { fr: string; en: string }> = {
  bruto: { fr: "Surface Brute", en: "Gross Surface" },
  neto: { fr: "Surface Nette", en: "Net Surface" },
  mure_te_jashtme: { fr: "Murs Extérieurs", en: "Exterior Walls" },
  mure_mbajtese: { fr: "Murs Porteurs", en: "Load-bearing Walls" },
  mure_ndarese: { fr: "Murs Séparateurs", en: "Partition Walls" },
  pllaka_e_kulmit: { fr: "Dalle de Toit", en: "Roof Plate" },
  pllaka_e_katit_0: { fr: "Dalle d'Étage 0", en: "Floor Slab 0" },
  pllaka_e_katit_1: { fr: "Dalle d'Étage 1", en: "Floor Slab 1" },
  pllaka_e_katit_2: { fr: "Dalle d'Étage 2", en: "Floor Slab 2" },
  pllaka_e_katit: { fr: "Dalle d'Étage", en: "Floor Slab" },
  kulmi: { fr: "Toiture", en: "Roof Area" },
};

export function CheckoutPage() {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");

  const [selection, setSelection] = useState<StoredSelection | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderRef, setOrderRef] = useState("");
  const [clientName, setClientName] = useState("");

  // Transport is mandatory and locked
  const transport = true;

  // Agreement checkbox states
  const [agreeShipping, setAgreeShipping] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeUrban, setAgreeUrban] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreementsError, setAgreementsError] = useState(false);

  // Address lookup state variables
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("France");
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (selectedCountry !== "France" || streetAddress.trim().length < 4) {
      setAddressSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(streetAddress)}&limit=5`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.features) {
            setAddressSuggestions(data.features);
            setShowSuggestions(true);
          } else {
            setAddressSuggestions([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching address suggestions:", err);
          setAddressSuggestions([]);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [streetAddress, selectedCountry]);

  const handleSelectSuggestion = (feature: any) => {
    const props = feature.properties;
    setStreetAddress(props.name || props.label);
    setCity(props.city || "");
    setZipCode(props.postcode || "");
    
    let region = "";
    if (props.context) {
      const parts = props.context.split(",");
      if (parts.length >= 3) {
        region = parts[2].trim();
      } else if (parts.length >= 2) {
        region = parts[1].trim();
      } else {
        region = props.context;
      }
    }
    setStateRegion(region);
    setAddressSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const raw = sessionStorage.getItem("house_selections");
    if (!raw) return;
    try {
      setSelection(JSON.parse(raw) as StoredSelection);
    } catch {
      setSelection(null);
    }
  }, []);

  const basePrice = selection?.totalPrice ?? 0;
  const total = useMemo(() => basePrice + TRANSPORTATION_COST, [basePrice]);

  const t = {
    title: isEn ? "Finalize Your Wooden House Project" : "Finalisation de votre projet bois",
    step1: isEn ? "Configuration" : "Configuration",
    step2: isEn ? "Your Details" : "Informations",
    step3: isEn ? "Confirmation" : "Validation",
    selectedCustoms: isEn ? "Selected Customizations" : "Personnalisations choisies",
    archSpecs: isEn ? "Architectural Specifications" : "Spécifications Architecturales",
    personalInfo: isEn ? "Personal Information" : "Informations personnelles",
    fullName: isEn ? "Full Name" : "Nom complet",
    email: isEn ? "Email Address" : "Adresse e-mail",
    phone: isEn ? "Phone Number" : "Numéro de téléphone",
    deliveryTitle: isEn ? "Construction Site / Delivery Address" : "Lieu de construction / Livraison",
    address: isEn ? "Street Address" : "Adresse (rue)",
    city: isEn ? "City" : "Ville",
    zipCode: isEn ? "Zip Code" : "Code postal",
    region: isEn ? "Region / State" : "Région / Département",
    country: isEn ? "Country" : "Pays",
    additionalNotes: isEn ? "Additional Notes" : "Notes supplémentaires",
    notesPlaceholder: isEn 
      ? "Tell us about your plot, accessibility, or special requests..." 
      : "Précisez ici les détails du terrain, l'accès, ou toute autre demande spécifique...",
    shippingTitle: isEn ? "Shipping & Logistics" : "Mode de transport & Logistique",
    shippingMethod: isEn ? "Standard Secure Convoy" : "Transport standard sécurisé",
    shippingDesc: isEn
      ? "Delivery by crane truck directly to your plot under secure conditions within 3 to 4 weeks"
      : "Livraison par camion grue directement sur votre terrain sous 3 à 4 semaines avec encadrement de sécurité",
    agreeShippingText: isEn
      ? "I accept the delivery conditions by special convoy. I certify that my plot is accessible for heavy crane trucks."
      : "J'accepte les conditions de livraison par convoi exceptionnel. Je certifie que mon terrain est accessible aux camions grues de gros tonnage.",
    agreeTermsText: isEn
      ? "I accept the general terms of sale and payment conditions (30% downpayment on order, 40% on timber frame assembly, 30% on key handover)."
      : "J'accepte les conditions générales de vente et les modalités de paiement (30% d'acompte à la commande, 40% au montage de la structure, 30% à la remise des clés).",
    agreeUrbanText: isEn
      ? "I confirm the compliance of my project with local urban planning regulations (PLU) and accept the building permit steps."
      : "Je confirme la conformité de mon projet avec les règles d'urbanisme locales (PLU) et prends connaissance des démarches de permis de construire requises.",
    agreePrivacyText: isEn
      ? "I authorize Ossa Bois to process my personal data in order to conduct the technical and financial feasibility study of my project."
      : "J'autorise Ossa Bois à traiter mes données personnelles afin de réaliser l'étude de faisabilité technique et financière de mon projet.",
    agreementsErrorText: isEn
      ? "Please accept all terms and conditions above to submit your request."
      : "Veuillez accepter toutes les conditions ci-dessus pour envoyer votre demande.",
    summaryTitle: isEn ? "Project Summary" : "Récapitulatif du projet",
    selectedModel: isEn ? "Selected Model" : "Modèle choisi",
    basePriceLabel: isEn ? "Base Price" : "Prix de base",
    shippingCost: isEn ? "Transport Estimate" : "Estimation transport",
    totalEst: isEn ? "Total Estimate" : "Estimation totale",
    vatIncl: isEn ? "incl. VAT" : "TTC",
    submitButton: isEn ? "Submit Project Request" : "Envoyer ma demande de projet",
    submitLoading: isEn ? "Processing Request..." : "Traitement en cours...",
    terms: isEn 
      ? "By submitting your request, you agree to our general terms of service." 
      : "En envoyant votre demande, vous acceptez nos conditions générales et notre politique de confidentialité.",
    emptyTitle: isEn ? "Your Selection is Empty" : "Votre sélection est vide",
    emptyDesc: isEn 
      ? "Please go back to our models and customize your dream home first." 
      : "Veuillez d'abord configurer la maison de vos rêves dans notre catalogue.",
    discoverModels: isEn ? "Discover Our Models" : "Découvrir nos modèles",
    successTitle: isEn ? "Project Request Submitted!" : "Demande envoyée avec succès !",
    successDesc: (name: string) => isEn 
      ? `Thank you, ${name}. Our technical team is reviewing your project details. A modular housing expert will contact you within 24 hours to discuss the next steps.`
      : `Merci, ${name}. Notre bureau d'études analyse les détails de votre configuration. Un expert en construction bois vous recontactera sous 24h pour affiner votre projet.`,
    orderRefLabel: isEn ? "Project Reference" : "Référence du projet",
    goHome: isEn ? "Back to Homepage" : "Retour à l'accueil",
    trust1Title: isEn ? "10-Year CCMI Guarantee" : "Garantie Décennale CCMI",
    trust1Desc: isEn 
      ? "All structural components are insured for 10 years by French law." 
      : "Garantie de livraison et assurance décennale structurelle incluses.",
    trust2Title: isEn ? "RE2020 Energy Standards" : "Normes Thermiques RE2020",
    trust2Desc: isEn 
      ? "Engineered for superior energy savings and insulation." 
      : "Conception bioclimatique à très haute performance énergétique.",
    trust3Title: isEn ? "Ecological Timber" : "Bois Certifié PEFC",
    trust3Desc: isEn 
      ? "100% sustainably sourced wood from local European forests." 
      : "Provenance certifiée de forêts gérées durablement."
  };

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    // Check custom agreements validation
    if (!agreeShipping || !agreeTerms || !agreeUrban || !agreePrivacy) {
      setAgreementsError(true);
      return;
    }
    
    setAgreementsError(false);
    const data = new FormData(event.currentTarget);
    const fullName = (data.get("full_name") as string) || "Client";
    setClientName(fullName);
    setIsSubmitting(true);

    const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const year = new Date().getFullYear();
    const ref = `OB-${year}-${randomCode}`;
    setOrderRef(ref);

    const personalInfo = {
      fullName,
      email: data.get("email"),
      phone: data.get("phone")
    };

    const deliveryInfo = {
      streetAddress: data.get("street_address"),
      city: data.get("city"),
      zipCode: data.get("zip_code"),
      stateRegion: data.get("state_region"),
      country: data.get("country"),
      notes: data.get("notes")
    };

    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selection,
        personalInfo,
        deliveryInfo,
        orderRef: ref,
        total,
        transportCost: TRANSPORTATION_COST
      })
    })
      .then((res) => res.json())
      .then((result) => {
        setIsSubmitting(false);
        if (result.success) {
          setSuccess(true);
          sessionStorage.removeItem("house_selections");
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          alert(isEn ? "Failed to send request. Please try again." : "Échec de l'envoi de la demande. Veuillez réessayer.");
        }
      })
      .catch((err) => {
        console.error(err);
        setIsSubmitting(false);
        alert(isEn ? "An error occurred. Please try again." : "Une erreur est survenue. Veuillez réessayer.");
      });
  }


  return (
    <div className={`checkout-page${success ? " success-showing" : ""}`}>
      <div className="checkout-container">
        
        {/* Step Indicator Header */}
        <div className="checkout-header-wrapper">
          <h1 className="checkout-title">{t.title}</h1>
          <div className="checkout-steps">
            <span className="checkout-step">
              <span className="checkout-step-num">1</span>
              {t.step1}
            </span>
            <span className="checkout-step-line" />
            <span className={`checkout-step ${!success ? "active" : ""}`}>
              <span className="checkout-step-num">2</span>
              {t.step2}
            </span>
            <span className="checkout-step-line" />
            <span className={`checkout-step ${success ? "active" : ""}`}>
              <span className="checkout-step-num">3</span>
              {t.step3}
            </span>
          </div>
        </div>

        {success ? (
          <div id="success-message" className="success-message show">
            <div className="success-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3>{t.successTitle}</h3>
            <p>{t.successDesc(clientName)}</p>
            
            <div className="order-ref-card">
              <div className="order-ref-label">{t.orderRefLabel}</div>
              <div className="order-ref-val">{orderRef}</div>
            </div>

            <Link href={`/${isEn ? "en" : "fr"}`} className="home-btn">
              {t.goHome}
            </Link>
          </div>
        ) : (
          <>
            {selection ? (
              <div className="checkout-content">
                <div className="checkout-form-section">
                  <form id="checkout-form" className="checkout-form-card" onSubmit={submitOrder}>
                    {/* Section 1: Personal info */}
                    <div className="form-section">
                      <div className="form-section-header">
                        <span className="form-section-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        </span>
                        <h2 className="form-title">{t.personalInfo}</h2>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group form-group-half">
                          <label className="form-label">
                            {t.fullName} <span className="required">*</span>
                          </label>
                          <div className="form-input-wrapper">
                            <input className="form-input" name="full_name" required type="text" placeholder="Jean Dupont" />
                          </div>
                        </div>
                        <div className="form-group form-group-half">
                          <label className="form-label">
                            {t.email} <span className="required">*</span>
                          </label>
                          <div className="form-input-wrapper">
                            <input className="form-input" name="email" required type="email" placeholder="jean.dupont@example.com" />
                          </div>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group form-group-half">
                          <label className="form-label">
                            {t.phone} <span className="required">*</span>
                          </label>
                          <div className="form-input-wrapper">
                            <input className="form-input" name="phone" required type="tel" placeholder="+33 6 12 34 56 78" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Construction/Delivery details */}
                    <div className="form-section">
                      <div className="form-section-header">
                        <span className="form-section-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
                          </svg>
                        </span>
                        <h2 className="form-title">{t.deliveryTitle}</h2>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group form-group-full">
                          <label className="form-label">
                            {t.address} <span className="required">*</span>
                          </label>
                          <div className="form-input-wrapper">
                            <input 
                              className="form-input" 
                              name="street_address" 
                              required 
                              type="text" 
                              placeholder="12 Rue de la Forêt" 
                              value={streetAddress}
                              onChange={(e) => setStreetAddress(e.target.value)}
                              onFocus={() => setShowSuggestions(true)}
                              onBlur={() => {
                                setTimeout(() => setShowSuggestions(false), 200);
                              }}
                              autoComplete="off"
                            />
                            {showSuggestions && addressSuggestions.length > 0 && (
                              <ul className="address-suggestions-dropdown">
                                {addressSuggestions.map((suggestion, idx) => (
                                  <li
                                    key={idx}
                                    className="address-suggestion-item"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      handleSelectSuggestion(suggestion);
                                    }}
                                  >
                                    {suggestion.properties.label}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group form-group-half">
                          <label className="form-label">
                            {t.city} <span className="required">*</span>
                          </label>
                          <div className="form-input-wrapper">
                            <input 
                              className="form-input" 
                              name="city" 
                              required 
                              type="text" 
                              placeholder="Paris" 
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="form-group form-group-half">
                          <label className="form-label">
                            {t.zipCode} <span className="required">*</span>
                          </label>
                          <div className="form-input-wrapper">
                            <input 
                              className="form-input" 
                              name="zip_code" 
                              required 
                              type="text" 
                              placeholder="75001" 
                              value={zipCode}
                              onChange={(e) => setZipCode(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group form-group-half">
                          <label className="form-label">
                            {t.region} <span className="required">*</span>
                          </label>
                          <div className="form-input-wrapper">
                            <input 
                              className="form-input" 
                              name="state_region" 
                              required 
                              type="text" 
                              placeholder="Île-de-France" 
                              value={stateRegion}
                              onChange={(e) => setStateRegion(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="form-group form-group-half">
                          <label className="form-label">
                            {t.country} <span className="required">*</span>
                          </label>
                          <div className="form-input-wrapper select-wrapper">
                            <select 
                              className="form-input" 
                              name="country" 
                              required 
                              value={selectedCountry}
                              onChange={(e) => setSelectedCountry(e.target.value)}
                            >
                              <option value="France">France</option>
                              <option value="Belgique">{isEn ? "Belgium" : "Belgique"}</option>
                              <option value="Suisse">{isEn ? "Switzerland" : "Suisse"}</option>
                              <option value="Luxembourg">Luxembourg</option>
                              <option value="Allemagne">{isEn ? "Germany" : "Allemagne"}</option>
                              <option value="Pays-Bas">{isEn ? "Netherlands" : "Pays-Bas"}</option>
                              <option value="Italie">{isEn ? "Italy" : "Italie"}</option>
                              <option value="Espagne">{isEn ? "Spain" : "Espagne"}</option>
                              <option value="Royaume-Uni">{isEn ? "United Kingdom" : "Royaume-Uni"}</option>
                              <option value="Autriche">{isEn ? "Austria" : "Autriche"}</option>
                              <option value="Portugal">Portugal</option>
                              <option value="Autre">{isEn ? "Other European Country" : "Autre pays d'Europe"}</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group form-group-full">
                          <label className="form-label">{t.additionalNotes}</label>
                          <div className="form-input-wrapper">
                            <textarea 
                              className="form-textarea" 
                              name="notes" 
                              rows={3} 
                              placeholder={t.notesPlaceholder}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Shipping logistics options */}
                    <div className="form-section">
                      <div className="form-section-header">
                        <span className="form-section-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125a1.125 1.125 0 001.125-1.125V9.75M8.25 18.75h7.5m-10.5-6h9.75c1.012 0 1.867-.668 2.145-1.579l1.3-4.24a1.125 1.125 0 00-1.079-1.456H5.25m1.5 9.75v-1.5" />
                          </svg>
                        </span>
                        <h2 className="form-title">{t.shippingTitle}</h2>
                      </div>
                      
                      <div className="transportation-options-wrapper">
                        {/* Static locked checked shipping option card */}
                        <div className="transportation-card checked static-card">
                          <input
                            className="transportation-checkbox"
                            type="checkbox"
                            checked={true}
                            readOnly
                          />
                          <span className="transportation-custom-checkbox" />
                          <div className="transportation-content">
                            <div className="transportation-info">
                              <span className="transportation-name">{t.shippingMethod}</span>
                              <span className="transportation-description">{t.shippingDesc}</span>
                            </div>
                            <span className="transportation-price">{euroFormatter.format(TRANSPORTATION_COST)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Sidebar summary panel with Configuration Details integrated */}
                <aside className="order-summary-card">
                  <h2 className="order-summary-title">{t.summaryTitle}</h2>
                  <div className="order-details">
                    <div className="order-product-item">
                      <div className="order-product-details">
                        <div className="order-product-image">
                          <Image
                            src={selection.currentImage || selection.house?.image || "/images/houses/ambre/10 ambre.jpg"}
                            alt={selection.house?.name || "Maison"}
                            width={90}
                            height={90}
                            priority
                          />
                        </div>
                        <div className="order-product-info">
                          <div className="order-product-name">{selection.house?.name || "Maison"}</div>
                          <div className="order-product-qty">1 · {selection.size?.value}</div>
                        </div>
                        <div className="order-product-price">{euroFormatter.format(basePrice)}</div>
                      </div>

                      {/* Displaying configured customizations */}
                      <div className="specs-table-title">{t.selectedCustoms}</div>
                      <div className="configured-options-list">
                        {selection.isolation?.value && (
                          <div className="config-option-item">
                            <span>{isEn ? "Insulation" : "Isolation"}</span>
                            <span>{selection.isolation.value}</span>
                          </div>
                        )}
                        {selection.outerIsolation?.value && (
                          <div className="config-option-item">
                            <span>{isEn ? "Ext. Insulation" : "Isolation Ext."}</span>
                            <span>{selection.outerIsolation.value}</span>
                          </div>
                        )}
                        {selection.facade?.value && (
                          <div className="config-option-item">
                            <span>{isEn ? "Facade" : "Façade"}</span>
                            <span>{selection.facade.value}</span>
                          </div>
                        )}
                        {selection.toiture?.value && (
                          <div className="config-option-item">
                            <span>{isEn ? "Roof Cover" : "Couverture"}</span>
                            <span>{selection.toiture.value}</span>
                          </div>
                        )}
                        {selection.dritaret?.value && (
                          <div className="config-option-item">
                            <span>{isEn ? "Windows" : "Menuiseries"}</span>
                            <span>{selection.dritaret.value}</span>
                          </div>
                        )}
                      </div>

                      {/* Displaying architectural specifications if available */}
                      {selection.perdhesa && Object.keys(selection.perdhesa).length > 0 && (
                        <>
                          <div className="specs-table-title">{t.archSpecs}</div>
                          <div className="configured-options-list architectural-specs">
                            {Object.entries(selection.perdhesa)
                              .filter(([_, value]) => value && Number(value) > 0)
                              .map(([key, value]) => {
                                const translation = PERDHESA_LABELS[key];
                                const label = translation ? (isEn ? translation.en : translation.fr) : key.replaceAll("_", " ");
                                return (
                                  <div className="config-option-item" key={key}>
                                    <span>{label}</span>
                                    <span>{value} m²</span>
                                  </div>
                                );
                              })}
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="order-divider" />
                    
                    <div className="order-price-row">
                      <span className="order-price-label">{t.basePriceLabel}</span>
                      <span className="order-price-value">{euroFormatter.format(basePrice)}</span>
                    </div>
                    <div className="order-price-row">
                      <span className="order-price-label">{t.shippingCost}</span>
                      <span className="order-price-value">{euroFormatter.format(TRANSPORTATION_COST)}</span>
                    </div>
                    
                    <div className="order-divider" />
                    
                    <div className="order-price-row order-total-row">
                      <span className="order-price-label">{t.totalEst} <small style={{fontSize: "11px", color: "#8c8c80", fontWeight: "normal"}}>({t.vatIncl})</small></span>
                      <span className="order-price-value order-total-price">{euroFormatter.format(total)}</span>
                    </div>
                  </div>

                  <div className="order-summary-footer">
                    <button 
                      className="place-order-button" 
                      type="submit" 
                      form="checkout-form"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="spinner-icon" width="16" height="16" viewBox="0 0 38 38" stroke="currentColor" style={{animation: "spin 1s linear infinite"}}>
                            <g fill="none" fillRule="evenodd">
                              <g transform="translate(1 1)" strokeWidth="2">
                                <circle strokeOpacity=".5" cx="18" cy="18" r="18"/>
                                <path d="M36 18c0-9.94-8.06-18-18-18"/>
                              </g>
                            </g>
                          </svg>
                          {t.submitLoading}
                        </>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                          </svg>
                          {t.submitButton}
                        </>
                      )}
                    </button>

                    {/* Validation Error Message Box */}
                    {agreementsError && (
                      <div className="agreements-error-message">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{marginRight: "6px", flexShrink: 0}}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        <span>{t.agreementsErrorText}</span>
                      </div>
                    )}

                    {/* Agreement checkboxes relocated under the submit button inside the sidebar order-summary-footer */}
                    <div className="sidebar-agreements-section">
                      <label className="sidebar-agreement-card">
                        <input
                          className="sidebar-agreement-checkbox"
                          type="checkbox"
                          checked={agreeShipping}
                          onChange={(e) => {
                            setAgreeShipping(e.target.checked);
                            if (e.target.checked && agreeTerms && agreeUrban && agreePrivacy) {
                              setAgreementsError(false);
                            }
                          }}
                          name="agree_shipping"
                        />
                        <span className="sidebar-agreement-custom-checkbox" />
                        <span className="sidebar-agreement-description">
                          {t.agreeShippingText} <span className="required">*</span>
                        </span>
                      </label>

                      <label className="sidebar-agreement-card">
                        <input
                          className="sidebar-agreement-checkbox"
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => {
                            setAgreeTerms(e.target.checked);
                            if (agreeShipping && e.target.checked && agreeUrban && agreePrivacy) {
                              setAgreementsError(false);
                            }
                          }}
                          name="agree_terms"
                        />
                        <span className="sidebar-agreement-custom-checkbox" />
                        <span className="sidebar-agreement-description">
                          {t.agreeTermsText} <span className="required">*</span>
                        </span>
                      </label>

                      <label className="sidebar-agreement-card">
                        <input
                          className="sidebar-agreement-checkbox"
                          type="checkbox"
                          checked={agreeUrban}
                          onChange={(e) => {
                            setAgreeUrban(e.target.checked);
                            if (agreeShipping && agreeTerms && e.target.checked && agreePrivacy) {
                              setAgreementsError(false);
                            }
                          }}
                          name="agree_urban"
                        />
                        <span className="sidebar-agreement-custom-checkbox" />
                        <span className="sidebar-agreement-description">
                          {t.agreeUrbanText} <span className="required">*</span>
                        </span>
                      </label>

                      <label className="sidebar-agreement-card">
                        <input
                          className="sidebar-agreement-checkbox"
                          type="checkbox"
                          checked={agreePrivacy}
                          onChange={(e) => {
                            setAgreePrivacy(e.target.checked);
                            if (agreeShipping && agreeTerms && agreeUrban && e.target.checked) {
                              setAgreementsError(false);
                            }
                          }}
                          name="agree_privacy"
                        />
                        <span className="sidebar-agreement-custom-checkbox" />
                        <span className="sidebar-agreement-description">
                          {t.agreePrivacyText} <span className="required">*</span>
                        </span>
                      </label>
                    </div>

                    <p className="terms-text">{t.terms}</p>
                  </div>

                  {/* Trust Badges */}
                  <div className="checkout-trust-badges">
                    <div className="trust-badge-item">
                      <span className="trust-badge-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 30v-30z" />
                        </svg>
                      </span>
                      <div>
                        <div className="trust-badge-title">{t.trust1Title}</div>
                        <div className="trust-badge-desc">{t.trust1Desc}</div>
                      </div>
                    </div>
                    <div className="trust-badge-item">
                      <span className="trust-badge-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3" />
                        </svg>
                      </span>
                      <div>
                        <div className="trust-badge-title">{t.trust2Title}</div>
                        <div className="trust-badge-desc">{t.trust2Desc}</div>
                      </div>
                    </div>
                    <div className="trust-badge-item">
                      <span className="trust-badge-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </span>
                      <div>
                        <div className="trust-badge-title">{t.trust3Title}</div>
                        <div className="trust-badge-desc">{t.trust3Desc}</div>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            ) : (
              <div className="empty-checkout">
                <div className="empty-checkout-icon">🛖</div>
                <h2>{t.emptyTitle}</h2>
                <p>{t.emptyDesc}</p>
                <Link href={`/${isEn ? "en" : "fr"}/maisons`} className="discover-btn">
                  {t.discoverModels}
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
