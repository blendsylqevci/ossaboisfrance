"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import type { InstallationMode } from "@/lib/house-pricing";

type StoredOption = { value?: string; label?: string; price?: string; image?: string };

type StoredSelectedOption = {
  categoryId?: string;
  categoryLabel?: string;
  optionId?: string;
  label?: string;
};

type StoredSelection = {
  house?: {
    name?: string;
    id?: string;
    image?: string;
  };
  size?: {
    value?: string;
    label?: string;
    price?: string;
    image?: string;
  };
  currentImage?: string;
  isolation?: StoredOption;
  outerIsolation?: StoredOption;
  facade?: StoredOption;
  etancheite?: StoredOption;
  toiture?: StoredOption;
  etancheiteTerrasse?: StoredOption;
  strukturaPlloqes?: StoredOption;
  izolimiPlloqes?: StoredOption;
  dritaret?: StoredOption;
  selectedOptions?: StoredSelectedOption[];
  configurationSubtotal?: number;
  truckCount?: number;
  transportCost?: number;
  installationMode?: InstallationMode;
  assemblyCost?: number;
  totalPrice?: number;
  priceBasis?: "excl_vat";
  vatIncluded?: false;
  priceBreakdown?: Array<{ label: string; value: number }>;
  perdhesa?: Record<string, number | string>;
};

const euroFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function getNonNegativeNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function getPositiveInteger(value: unknown): number | null {
  const number = getNonNegativeNumber(value);
  return number !== null && number > 0 && Number.isInteger(number) ? number : null;
}

type CheckoutPageProps = {
  locale: string;
};

const PERDHESA_LABELS: Record<string, { fr: string; en: string; de: string; nl: string }> = {
  bruto: { fr: "Bruto", en: "Bruto", de: "Bruto", nl: "Bruto" },
  neto: { fr: "Neto", en: "Neto", de: "Neto", nl: "Neto" },
  mure_te_jashtme: { fr: "Murs Extérieurs", en: "Exterior Walls", de: "Außenwände", nl: "Buitenmuren" },
  mure_mbajtese: { fr: "Murs Porteurs", en: "Load-bearing Walls", de: "Tragende Wände", nl: "Dragende muren" },
  mure_ndarese: { fr: "Murs Séparateurs", en: "Partition Walls", de: "Trennwände", nl: "Tussenmuren" },
  pllaka_e_kulmit: { fr: "Dalle de Toit", en: "Roof Plate", de: "Dachplatte", nl: "Dakplaat" },
  pllaka_e_katit_0: { fr: "Dalle d'Étage 0", en: "Floor Slab 0", de: "Bodenplatte 0", nl: "Vloerplaat 0" },
  pllaka_e_katit_1: { fr: "Dalle d'Étage 1", en: "Floor Slab 1", de: "Bodenplatte 1", nl: "Vloerplaat 1" },
  pllaka_e_katit_2: { fr: "Dalle d'Étage 2", en: "Floor Slab 2", de: "Bodenplatte 2", nl: "Vloerplaat 2" },
  pllaka_e_katit: { fr: "Dalle d'Étage", en: "Floor Slab", de: "Bodenplatte", nl: "Vloerplaat" },
  kulmi: { fr: "Toiture", en: "Roof Area", de: "Dachbereich", nl: "Dakgebied" },
};

export function CheckoutPage({ locale }: CheckoutPageProps) {
  const isEn = locale === "en";

  const [selection, setSelection] = useState<StoredSelection | null>(null);
  const [success, setSuccess] = useState(false);
  const [notificationsSent, setNotificationsSent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderRef, setOrderRef] = useState("");
  const [clientName, setClientName] = useState("");

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
    if (streetAddress.trim().length < 4) {
      setAddressSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      if (selectedCountry === "France") {
        fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(streetAddress)}&limit=5`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.features) {
              const normalized = data.features.map((f: any) => {
                const props = f.properties;
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
                return {
                  label: props.label,
                  street: props.name || props.label,
                  city: props.city || "",
                  postcode: props.postcode || "",
                  region: region
                };
              });
              setAddressSuggestions(normalized);
              setShowSuggestions(true);
            } else {
              setAddressSuggestions([]);
            }
          })
          .catch((err) => {
            console.error("Error fetching French address suggestions:", err);
            setAddressSuggestions([]);
          });
      } else {
        // Mapping country names to ISO codes for OpenStreetMap Nominatim filtering
        const COUNTRY_CODES: Record<string, string> = {
          Belgique: "be",
          Suisse: "ch",
          Luxembourg: "lu",
          Allemagne: "de",
          "Pays-Bas": "nl",
          Italie: "it",
          Espagne: "es",
          "Royaume-Uni": "gb",
          Autriche: "at",
          Portugal: "pt"
        };
        const countryCode = COUNTRY_CODES[selectedCountry] || "";
        const countryFilter = countryCode ? `&countrycodes=${countryCode}` : "";

        fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(streetAddress)}&format=json&addressdetails=1&limit=5${countryFilter}`)
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) {
              const normalized = data.map((item: any) => {
                const addr = item.address || {};
                
                // Extract road/street details
                const streetName = addr.road || addr.suburb || addr.pedestrian || addr.neighbourhood || addr.city_district || "";
                const houseNum = addr.house_number ? " " + addr.house_number : "";
                const street = streetName ? `${streetName}${houseNum}` : item.display_name;

                // Extract city
                const cityName = addr.city || addr.town || addr.village || addr.municipality || "";

                // Extract postcode
                const postcode = addr.postcode || "";

                // Extract region/state
                const region = addr.state || addr.region || addr.county || "";

                return {
                  label: item.display_name,
                  street: street,
                  city: cityName,
                  postcode: postcode,
                  region: region
                };
              });
              setAddressSuggestions(normalized);
              setShowSuggestions(true);
            } else {
              setAddressSuggestions([]);
            }
          })
          .catch((err) => {
            console.error("Error fetching global address suggestions:", err);
            setAddressSuggestions([]);
          });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [streetAddress, selectedCountry]);

  const handleSelectSuggestion = (suggestion: any) => {
    setStreetAddress(suggestion.street);
    setCity(suggestion.city);
    setZipCode(suggestion.postcode);
    setStateRegion(suggestion.region);
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

  const storedTotal = getNonNegativeNumber(selection?.totalPrice);
  const transportCost = getNonNegativeNumber(selection?.transportCost) ?? 0;
  const assemblyCost = getNonNegativeNumber(selection?.assemblyCost) ?? 0;
  const truckCount = getPositiveInteger(selection?.truckCount);
  const installationMode = selection?.installationMode;
  const hasAuthoritativeBreakdown = Boolean(
    selection &&
      (selection.configurationSubtotal !== undefined ||
        selection.transportCost !== undefined ||
        selection.assemblyCost !== undefined ||
        selection.installationMode !== undefined)
  );
  const configurationSubtotal =
    getNonNegativeNumber(selection?.configurationSubtotal) ??
    (hasAuthoritativeBreakdown && storedTotal !== null
      ? Math.max(0, storedTotal - transportCost - assemblyCost)
      : storedTotal ?? 0);
  const total =
    hasAuthoritativeBreakdown && storedTotal !== null
      ? storedTotal
      : configurationSubtotal + transportCost + assemblyCost;

  const formatTransportCost = (value: number) => {
    if (value === 0) return "0.00 €";
    return euroFormatter.format(value);
  };


  const hasCustomizations = useMemo(() => {
    if (!selection) return false;
    return !!(
      selection.selectedOptions?.length ||
      selection.isolation?.value ||
      selection.outerIsolation?.value ||
      selection.facade?.value ||
      selection.toiture?.value ||
      selection.dritaret?.value ||
      selection.etancheite?.value ||
      selection.etancheiteTerrasse?.value ||
      selection.strukturaPlloqes?.value ||
      selection.izolimiPlloqes?.value
    );
  }, [selection]);

  const coreCategoryIds = new Set([
    "isolation",
    "outerIsolation",
    "facade",
    "couverture",
    "dritaret",
    "etancheite",
    "terraceEtancheite",
    "roof",
    "fauxPlafond",
  ]);
  const dynamicSelectedOptions = (selection?.selectedOptions ?? []).filter(
    (item) => item.categoryId && !coreCategoryIds.has(item.categoryId)
  );
  const optionLabel = (option?: StoredOption) => option?.label || option?.value;


  const t = {
    title: locale === "en" ? "Finalize Your Wooden House Project" : locale === "de" ? "Schließen Sie Ihr Holzhausprojekt ab" : locale === "nl" ? "Rond uw houtskeletbouwproject af" : "Finalisation de votre projet bois",
    step1: locale === "en" ? "Configuration" : locale === "de" ? "Konfiguration" : locale === "nl" ? "Configuratie" : "Configuration",
    step2: locale === "en" ? "Your Details" : locale === "de" ? "Ihre Daten" : locale === "nl" ? "Uw gegevens" : "Informations",
    step3: locale === "en" ? "Confirmation" : locale === "de" ? "Bestätigung" : locale === "nl" ? "Bevestiging" : "Validation",
    selectedCustoms: locale === "en" ? "Selected Customizations" : locale === "de" ? "Ausgewählte Anpassungen" : locale === "nl" ? "Geselecteerde aanpassingen" : "Personnalisations choisies",
    archSpecs: locale === "en" ? "Architectural Specifications" : locale === "de" ? "Architektonische Spezifikationen" : locale === "nl" ? "Architectonische specificaties" : "Spécifications Architecturales",
    personalInfo: locale === "en" ? "Personal Information" : locale === "de" ? "Persönliche Informationen" : locale === "nl" ? "Persoonlijke informatie" : "Informations personnelles",
    fullName: locale === "en" ? "Full Name" : locale === "de" ? "Vollständiger Name" : locale === "nl" ? "Volledige naam" : "Nom complet",
    email: locale === "en" ? "Email Address" : locale === "de" ? "E-Mail-Adresse" : locale === "nl" ? "E-mailadres" : "Adresse e-mail",
    phone: locale === "en" ? "Phone Number" : locale === "de" ? "Telefonnummer" : locale === "nl" ? "Telefoonnummer" : "Numéro de téléphone",
    phoneNotice: locale === "en"
      ? "Under French law, you can register on the Bloctel do-not-call list (bloctel.gouv.fr)."
      : locale === "de"
        ? "Nach französischem Recht können Sie sich in die Bloctel-Sperrliste eintragen (bloctel.gouv.fr)."
        : locale === "nl"
          ? "Onder de Franse wetgeving kunt u zich inschrijven op de Bloctel do-not-call-lijst (bloctel.gouv.fr)."
          : "Conformément à la loi, vous disposez du droit de vous inscrire gratuitement sur la liste Bloctel (bloctel.gouv.fr).",
    deliveryTitle: locale === "en" ? "Construction Site / Delivery Address" : locale === "de" ? "Bauort / Lieferadresse" : locale === "nl" ? "Bouwlocatie / Afleveradres" : "Lieu de construction / Livraison",
    address: locale === "en" ? "Street Address" : locale === "de" ? "Straße und Hausnummer" : locale === "nl" ? "Adres (straat)" : "Adresse (rue)",
    city: locale === "en" ? "City" : locale === "de" ? "Stadt" : locale === "nl" ? "Stad" : "Ville",
    zipCode: locale === "en" ? "Zip Code" : locale === "de" ? "Postleitzahl" : locale === "nl" ? "Postcode" : "Code postal",
    region: locale === "en" ? "Region / State" : locale === "de" ? "Region / Bundesland" : locale === "nl" ? "Regio / Provincie" : "Région / Département",
    country: locale === "en" ? "Country" : locale === "de" ? "Land" : locale === "nl" ? "Land" : "Pays",
    additionalNotes: locale === "en" ? "Additional Notes" : locale === "de" ? "Zusätzliche Notizen" : locale === "nl" ? "Aanvullende opmerkingen" : "Notes supplémentaires",
    notesPlaceholder: locale === "en" 
      ? "Tell us about your plot, accessibility, or special requests..." 
      : locale === "de" ? "Geben Sie hier Details zum Grundstück, Zugang oder andere spezifische Wünsche an..."
      : locale === "nl" ? "Geef hier details over de grond, toegankelijkheid of andere specifieke verzoeken op..."
      : "Précisez ici les détails du terrain, l'accès, ou toute autre demande spécifique...",
    shippingTitle: locale === "en" ? "Shipping & Logistics" : locale === "de" ? "Transport & Logistik" : locale === "nl" ? "Transport & Logistiek" : "Mode de transport & Logistique",
    shippingMethod: locale === "en" ? "Standard Secure Convoy" : locale === "de" ? "Gesicherter Standardtransport" : locale === "nl" ? "Standaard beveiligd transport" : "Transport standard sécurisé",
    shippingDesc: locale === "en"
      ? "Delivery by crane truck directly to your plot under secure conditions within 3 to 4 weeks"
      : locale === "de" ? "Lieferung per Kranwagen direkt auf Ihr Grundstück unter sicheren Bedingungen innerhalb von 3 bis 4 Wochen"
      : locale === "nl" ? "Levering met kraanwagen direct op uw grond onder veilige omstandigheden binnen 3 tot 4 weken"
      : "Livraison par camion grue directement sur votre terrain sous 3 à 4 semaines avec encadrement de sécurité",
    assemblyTitle: locale === "en" ? "Assembly by Ossa Bois" : locale === "de" ? "Montage durch Ossa Bois" : locale === "nl" ? "Montage door Ossa Bois" : "Montage par Ossa Bois",
    assemblyDesc: locale === "en"
      ? "Complete assembly of the timber frame structure on your foundations by our expert crew"
      : locale === "de" ? "Vollständiger Aufbau der Holzrahmenstruktur auf Ihrem Fundament durch unser Expertenteam"
      : locale === "nl" ? "Volledige montage van de houtskeletstructuur op uw fundering door ons expertteam"
      : "Montage complet de la structure en ossature bois sur vos fondations par nos équipes spécialisées",
    professionalAssemblyTitle: locale === "en" ? "Assembly by you or a third-party professional" : locale === "de" ? "Montage durch Sie oder einen externen Fachbetrieb" : locale === "nl" ? "Montage door uzelf of een externe professional" : "Montage par vous-même ou un professionnel tiers",
    professionalAssemblyDesc: locale === "en"
      ? "Assembly by Ossa Bois is not included; transport remains calculated separately"
      : locale === "de" ? "Die Montage durch Ossa Bois ist nicht enthalten; der Transport wird separat berechnet"
      : locale === "nl" ? "Montage door Ossa Bois is niet inbegrepen; het transport wordt apart berekend"
      : "Le montage par Ossa Bois n'est pas inclus ; le transport reste calculé séparément",
    pendingAssemblyTitle: locale === "en" ? "Assembly choice pending" : locale === "de" ? "Montagewahl ausstehend" : locale === "nl" ? "Montagekeuze ontbreekt" : "Choix du montage à confirmer",
    pendingAssemblyDesc: locale === "en" ? "Return to the configurator to select an assembly option" : locale === "de" ? "Kehren Sie zum Konfigurator zurück, um eine Montageoption auszuwählen" : locale === "nl" ? "Ga terug naar de configurator om een montageoptie te kiezen" : "Retournez au configurateur pour sélectionner une option de montage",
    notIncluded: locale === "en" ? "Not included" : locale === "de" ? "Nicht enthalten" : locale === "nl" ? "Niet inbegrepen" : "Non inclus",
    pending: locale === "en" ? "Pending" : locale === "de" ? "Ausstehend" : locale === "nl" ? "In afwachting" : "À confirmer",
    trucks: (count: number) => locale === "en" ? `${count} truck${count === 1 ? "" : "s"}` : locale === "de" ? `${count} Lkw` : locale === "nl" ? `${count} vrachtwagen${count === 1 ? "" : "s"}` : `${count} camion${count === 1 ? "" : "s"}`,
    agreeShippingText: locale === "en"
      ? "I accept the delivery conditions by special convoy. I certify that my plot is accessible for heavy crane trucks."
      : locale === "de" ? "Ich akzeptiere die Lieferbedingungen per Spezialtransport. Ich bestätige, dass mein Grundstück für schwere Kranwagen zugänglich ist."
      : locale === "nl" ? "Ik accepteer de leveringsvoorwaarden per speciaal transport. Ik verklaar dat mijn grond toegankelijk is voor zware kraanwagens."
      : "J'accepte les conditions de livraison par convoi exceptionnel. Je certifie que mon terrain est accessible aux camions grues de gros tonnage.",
    agreeTermsText: locale === "en"
      ? "I accept the general terms of sale and the payment terms that will be specified in the personalized quotation."
      : locale === "de" ? "Ich akzeptiere die Allgemeinen Geschäftsbedingungen und die Zahlungsbedingungen, die im persönlichen Angebot festgelegt werden."
      : locale === "nl" ? "Ik accepteer de algemene verkoopvoorwaarden en de betalingsvoorwaarden die in de persoonlijke offerte worden vermeld."
      : "J'accepte les conditions générales de vente et les modalités de paiement qui seront précisées dans le devis personnalisé.",
    agreeUrbanText: locale === "en"
      ? "I confirm the compliance of my project with local urban planning regulations (PLU) and accept the building permit steps."
      : locale === "de" ? "Ich bestätige die Übereinstimmung meines Projekts mit den lokalen Bauvorschriften (B-Plan) und nehme die erforderlichen Baugenehmigungsschritte zur Kenntnis."
      : locale === "nl" ? "Ik bevestig de conformiteit van mijn project met de lokale bestemmingsplannen (PLU) en neem kennis van de vereiste bouwvergunningstappen."
      : "Je confirme la conformité de mon projet avec les règles d'urbanisme locales (PLU) et prends connaissance des démarches de permis de construire requises.",
    agreePrivacyText: locale === "en"
      ? "I authorize Ossa Bois to process my personal data in order to conduct the technical and financial feasibility study of my project."
      : locale === "de" ? "Ich ermächtige Ossa Bois, meine personenbezogenen Daten zu verarbeiten, um die technische und finanzielle Machbarkeitsstudie meines Projekts durchzuführen."
      : locale === "nl" ? "Ik geef Ossa Bois toestemming om mijn persoonsgegevens te verwerken om de technische en financiële haalbaarheidsstudie van mijn project uit te voeren."
      : "J'autorise Ossa Bois à traiter mes données personnelles afin de réaliser l'étude de faisabilité technique et financière de mon projet.",
    agreementsErrorText: locale === "en"
      ? "Please accept all terms and conditions above to submit your request."
      : locale === "de" ? "Bitte akzeptieren Sie alle oben genannten Bedingungen, um Ihre Anfrage zu senden."
      : locale === "nl" ? "Accepteer alle bovenstaande voorwaarden om uw verzoek in te dienen."
      : "Veuillez accepter toutes les conditions ci-dessus pour envoyer votre demande.",
    summaryTitle: locale === "en" ? "Project Summary" : locale === "de" ? "Projektzusammenfassung" : locale === "nl" ? "Projectsamenvatting" : "Récapitulatif du projet",
    selectedModel: locale === "en" ? "Selected Model" : locale === "de" ? "Ausgewähltes Modell" : locale === "nl" ? "Geselecteerd model" : "Modèle choisi",
    basePriceLabel: locale === "en" ? "Configured house (excl. VAT)" : locale === "de" ? "Konfiguriertes Haus (netto)" : locale === "nl" ? "Geconfigureerd huis (excl. btw)" : "Maison configurée (HT)",
    shippingCost: locale === "en" ? "Transport Estimate" : locale === "de" ? "Transportkosten-Schätzung" : locale === "nl" ? "Geschatte transportkosten" : "Estimation transport",
    assemblyCostLabel: locale === "en" ? "Assembly & Installation" : locale === "de" ? "Montage & Installation" : locale === "nl" ? "Montage & Installatie" : "Montage & Installation",
    totalEst: locale === "en" ? "Total estimate excl. VAT" : locale === "de" ? "Gesamtschätzung netto" : locale === "nl" ? "Totale schatting excl. btw" : "Estimation totale HT",
    taxNotice: locale === "en"
      ? "All displayed amounts exclude VAT. Applicable VAT will be calculated in the personalized quotation."
      : locale === "de"
        ? "Alle angezeigten Beträge sind Nettopreise zzgl. MwSt. Die MwSt. wird im persönlichen Angebot berechnet."
        : locale === "nl"
          ? "Alle weergegeven bedragen zijn exclusief btw. De btw wordt berekend in de persoonlijke offerte."
          : "Tous les montants affichés sont hors taxes (HT). La TVA sera calculée dans le devis personnalisé.",
    submitButton: locale === "en" ? "Submit Project Request" : locale === "de" ? "Projektanfrage senden" : locale === "nl" ? "Projectaanvraag indienen" : "Envoyer ma demande de projet",
    submitLoading: locale === "en" ? "Processing Request..." : locale === "de" ? "Anfrage wird verarbeitet..." : locale === "nl" ? "Aanvraag wordt verwerkt..." : "Traitement en cours...",
    terms: locale === "en" 
      ? "By submitting your request, you agree to our general terms of service." 
      : locale === "de" ? "Mit dem Absenden Ihrer Anfrage stimmen Sie unseren Allgemeinen Geschäftsbedingungen zu."
      : locale === "nl" ? "Door uw verzoek in te dienen, gaat u akkoord met onze algemene voorwaarden."
      : "En voyant votre demande, vous acceptez nos conditions générales et notre politique de confidentialité.",
    emptyTitle: locale === "en" ? "Your Selection is Empty" : locale === "de" ? "Ihre Auswahl ist leer" : locale === "nl" ? "Uw selectie is leeg" : "Votre sélection est vide",
    emptyDesc: locale === "en" 
      ? "Please go back to our models and customize your dream home first." 
      : locale === "de" ? "Bitte kehren Sie zu unseren Modellen zurück und konfigurieren Sie zuerst Ihr Traumhaus."
      : locale === "nl" ? "Ga terug naar onze modellen en configureer eerst uw droomhuis."
      : "Veuillez d'abord configurer la maison de vos rêves dans notre catalogue.",
    discoverModels: locale === "en" ? "Discover Our Models" : locale === "de" ? "Unsere Modelle entdecken" : locale === "nl" ? "Ontdek onze modellen" : "Découvrir nos modèles",
    successTitle: locale === "en" ? "Project Request Submitted!" : locale === "de" ? "Anfrage erfolgreich versendet!" : locale === "nl" ? "Aanvraag succesvol ingediend!" : "Demande envoyée avec succès !",
    successDesc: (name: string) => locale === "en" 
      ? `Thank you, ${name}. Our technical team is reviewing your project details. A modular housing expert will contact you within 24 hours to discuss the next steps.`
      : locale === "de" ? `Vielen Dank, ${name}. Unser technisches Team prüft Ihre Projektdetails. Ein Experte für Modulbau wird sich innerhalb von 24 Stunden mit Ihnen in Verbindung setzen, um die nächsten Schritte zu besprechen.`
      : locale === "nl" ? `Dank u, ${name}. Ons technisch team beoordeelt uw projectgegevens. Een expert in modulaire bouw neemt binnen 24 uur contact met u op om de volgende stappen te bespreken.`
      : `Merci, ${name}. Notre bureau d'études analyse les détails de votre configuration. Un expert en construction bois vous recontactera sous 24h pour affiner votre projet.`,
    notificationWarning: locale === "en"
      ? "Your request was saved, but the confirmation email could not be sent. Please keep the project reference below."
      : locale === "de"
        ? "Ihre Anfrage wurde gespeichert, aber die Bestätigungs-E-Mail konnte nicht gesendet werden. Bitte bewahren Sie die Projektreferenz unten auf."
        : locale === "nl"
          ? "Uw aanvraag is opgeslagen, maar de bevestigingsmail kon niet worden verzonden. Bewaar de projectreferentie hieronder."
          : "Votre demande a bien été enregistrée, mais l'e-mail de confirmation n'a pas pu être envoyé. Conservez la référence ci-dessous.",
    orderRefLabel: locale === "en" ? "Project Reference" : locale === "de" ? "Projekt-Referenz" : locale === "nl" ? "Projectreferentie" : "Référence du projet",
    goHome: locale === "en" ? "Back to Homepage" : locale === "de" ? "Zurück zur Startseite" : locale === "nl" ? "Terug naar startpagina" : "Retour à l'accueil",
    trust1Title: locale === "en" ? "Personalized quotation" : locale === "de" ? "Persönliches Angebot" : locale === "nl" ? "Persoonlijke offerte" : "Devis personnalisé",
    trust1Desc: locale === "en" 
      ? "Displayed amounts exclude VAT. Applicable VAT, guarantees, and contractual terms are confirmed in your quotation."
      : locale === "de" ? "Die angezeigten Beträge sind Nettopreise zzgl. MwSt.; MwSt., Garantien und Vertragsbedingungen werden im Angebot bestätigt."
      : locale === "nl" ? "De weergegeven bedragen zijn exclusief btw; btw, garanties en contractvoorwaarden worden in uw offerte bevestigd."
      : "Les montants affichés sont hors taxes (HT) ; la TVA, les garanties et les conditions contractuelles sont confirmées dans votre devis.",
    trust2Title: locale === "en" ? "RE2020 Energy Standards" : locale === "de" ? "RE2020 Energiestandards" : locale === "nl" ? "RE2020 energiestandaarden" : "Normes Thermiques RE2020",
    trust2Desc: locale === "en" 
      ? "Engineered for superior energy savings and insulation." 
      : locale === "de" ? "Ausgelegt auf hervorragende Energieeinsparung und Isolierung."
      : locale === "nl" ? "Ontworpen voor superieure energiebesparing en isolatie."
      : "Conception bioclimatique à très haute performance énergétique.",
    trust3Title: locale === "en" ? "Ecological Timber" : locale === "de" ? "Ökologisches Holz" : locale === "nl" ? "Ecologisch hout" : "Bois Certifié PEFC",
    trust3Desc: locale === "en" 
      ? "100% sustainably sourced wood from local European forests." 
      : locale === "de" ? "100 % nachhaltig gewonnenes Holz aus europäischen Wäldern."
      : locale === "nl" ? "100% duurzaam verkregen hout uit Europese bossen."
      : "Provenance certifiée de forêts gérées durablement."
  };

  const assemblyCardTitle =
    installationMode === "ossa"
      ? t.assemblyTitle
      : installationMode === "professional"
        ? t.professionalAssemblyTitle
        : t.pendingAssemblyTitle;
  const assemblyCardDescription =
    installationMode === "ossa"
      ? t.assemblyDesc
      : installationMode === "professional"
        ? t.professionalAssemblyDesc
        : t.pendingAssemblyDesc;
  const assemblyPriceText =
    installationMode === "professional"
      ? t.notIncluded
      : installationMode === "ossa"
        ? formatTransportCost(assemblyCost)
        : t.pending;
  const transportLabel = truckCount ? `${t.shippingCost} (${t.trucks(truckCount)})` : t.shippingCost;

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // The configurator step is mandatory. This also protects legacy or manually
    // crafted session payloads before the server performs the same validation.
    if (!installationMode) return;
    
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

    const randomCode = globalThis.crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 12)
      .toUpperCase();
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
        locale
      })
    })
      .then((res) => res.json())
      .then((result) => {
        setIsSubmitting(false);
        if (result.success) {
          setNotificationsSent(result.notificationsSent !== false);
          setSuccess(true);
          sessionStorage.removeItem("house_selections");
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          alert(locale === "en" ? "Failed to send request. Please try again." : locale === "de" ? "Fehler beim Senden der Anfrage. Bitte versuchen Sie es erneut." : locale === "nl" ? "Verzenden van verzoek mislukt. Probeer het opnieuw." : "Échec de l'envoi de la demande. Veuillez réessayer.");
        }
      })
      .catch((err) => {
        console.error(err);
        setIsSubmitting(false);
        alert(locale === "en" ? "An error occurred. Please try again." : locale === "de" ? "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut." : locale === "nl" ? "Er is een fout opgetreden. Probeer het opnieuw." : "Une erreur est survenue. Veuillez réessayer.");
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
            {!notificationsSent ? (
              <p className="checkout-notification-warning" role="status">
                {t.notificationWarning}
              </p>
            ) : null}
            
            <div className="order-ref-card">
              <div className="order-ref-label">{t.orderRefLabel}</div>
              <div className="order-ref-val">{orderRef}</div>
            </div>

            <Link href={`/${locale}`} className="home-btn">
              {t.goHome}
            </Link>
          </div>
        ) : (
          <>
            {selection && !installationMode ? (
              <div className="empty-checkout">
                <div className="empty-checkout-icon" aria-hidden="true">🛠️</div>
                <h2>{t.pendingAssemblyTitle}</h2>
                <p>{t.pendingAssemblyDesc}</p>
                <Link
                  href={
                    selection.house?.id
                      ? `/${locale}/maisons/${selection.house.id}`
                      : `/${locale}/maisons`
                  }
                  className="discover-btn"
                >
                  {locale === "en"
                    ? "Return to the configurator"
                    : locale === "de"
                      ? "Zum Konfigurator zurückkehren"
                      : locale === "nl"
                        ? "Terug naar de configurator"
                        : "Retourner au configurateur"}
                </Link>
              </div>
            ) : selection ? (
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
                            <span className="phone-notice-legal">{t.phoneNotice}</span>
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
                                    {suggestion.label}
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
                              <option value="Allemagne">{isEn ? "Germany" : "Allemagne"}</option>
                              <option value="Belgique">{isEn ? "Belgium" : "Belgique"}</option>
                              <option value="Suisse">{isEn ? "Switzerland" : "Suisse"}</option>
                              <option value="Luxembourg">Luxembourg</option>
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
                      
                      <div className="transportation-options-wrapper" style={{ display: "grid", gap: "12px" }}>
                        {/* Static locked checked shipping option card */}
                        <div className="transportation-card checked static-card">
                          <input
                            className="transportation-checkbox"
                            type="checkbox"
                            checked={true}
                            readOnly
                            tabIndex={-1}
                            aria-hidden="true"
                          />
                          <span className="transportation-custom-checkbox" />
                          <div className="transportation-content">
                            <div className="transportation-info">
                              <span className="transportation-name">{t.shippingMethod}</span>
                              <span className="transportation-description">
                                {t.shippingDesc}
                                {truckCount ? ` · ${t.trucks(truckCount)}` : ""}
                              </span>
                            </div>
                            <span className="transportation-price">{formatTransportCost(transportCost)}</span>
                          </div>
                        </div>

                        {/* Assembly option chosen in the mandatory configurator step */}
                        <div className={`transportation-card static-card${installationMode ? " checked" : ""}`}>
                          <input
                            className="transportation-checkbox"
                            type="checkbox"
                            checked={Boolean(installationMode)}
                            readOnly
                            tabIndex={-1}
                            aria-hidden="true"
                          />
                          <span className="transportation-custom-checkbox" />
                          <div className="transportation-content">
                            <div className="transportation-info">
                              <span className="transportation-name">{assemblyCardTitle}</span>
                              <span className="transportation-description">{assemblyCardDescription}</span>
                            </div>
                            <span className="transportation-price">{assemblyPriceText}</span>
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
                            sizes="90px"
                            quality={90}
                          />
                        </div>
                        <div className="order-product-info">
                          <div className="order-product-name">{selection.house?.name || "Maison"}</div>
                          <div className="order-product-qty">1 · {selection.size?.value}</div>
                        </div>
                        <div className="order-product-price">{euroFormatter.format(configurationSubtotal)}</div>
                      </div>

                      {/* Displaying configured customizations */}
                      {hasCustomizations && (
                        <>
                          <div className="specs-table-title">{t.selectedCustoms}</div>
                          <div className="configured-options-list">
                            {selection.isolation?.value && (
                              <div className="config-option-item">
                                <span>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="config-item-svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 30v-30z" />
                                  </svg>
                                  {locale === "en" ? "Insulation" : locale === "de" ? "Isolierung" : locale === "nl" ? "Isolatie" : "Isolation"}
                                </span>
                                <span>{optionLabel(selection.isolation)}</span>
                              </div>
                            )}
                            {selection.outerIsolation?.value && (
                              <div className="config-option-item">
                                <span>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="config-item-svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 30v-30z" />
                                  </svg>
                                  {locale === "en" ? "Ext. Insulation" : locale === "de" ? "Außenisolierung" : locale === "nl" ? "Buitenisolatie" : "Isolation Ext."}
                                </span>
                                <span>{optionLabel(selection.outerIsolation)}</span>
                              </div>
                            )}
                            {selection.facade?.value && (
                              <div className="config-option-item">
                                <span>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="config-item-svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 7.5h.008v.008h-.008V7.5zm0 2.25h.008v.008h-.008V9.75zM3.75 21h.008v-.008H3.75V21zm0-3h.008v-.008H3.75V18zm0-3h.008v-.008H3.75V15zm0-3h.008v-.008H3.75V12zm0-3h.008v-.008H3.75V9zm0-3h.008v-.008H3.75V6zm0-3h.008v-.008H3.75V3z" />
                                  </svg>
                                  {locale === "en" ? "Facade" : locale === "de" ? "Fassade" : locale === "nl" ? "Gevel" : "Façade"}
                                </span>
                                <span>{optionLabel(selection.facade)}</span>
                              </div>
                            )}
                            {selection.toiture?.value && (
                              <div className="config-option-item">
                                <span>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="config-item-svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                  </svg>
                                  {locale === "en" ? "Roof Cover" : locale === "de" ? "Dacheindeckung" : locale === "nl" ? "Dakbedekking" : "Couverture"}
                                </span>
                                <span>{optionLabel(selection.toiture)}</span>
                              </div>
                            )}
                            {selection.dritaret?.value && (
                              <div className="config-option-item">
                                <span>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="config-item-svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v16.5m16.5-16.5v16.5m-16.5-16.5h16.5m-16.5 16.5h16.5M12 3.75v16.5M3.75 12h16.5" />
                                  </svg>
                                  {locale === "en" ? "Windows" : locale === "de" ? "Fenster" : locale === "nl" ? "Ramen" : "Menuiseries"}
                                </span>
                                <span>{optionLabel(selection.dritaret)}</span>
                              </div>
                            )}
                            {selection.etancheite?.value && (
                              <div className="config-option-item">
                                <span>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="config-item-svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                  </svg>
                                  {locale === "en" ? "Waterproofing" : locale === "de" ? "Abdichtung" : locale === "nl" ? "Waterdichting" : "Étanchéité"}
                                </span>
                                <span>{optionLabel(selection.etancheite)}</span>
                              </div>
                            )}
                            {selection.etancheiteTerrasse?.value && (
                              <div className="config-option-item">
                                <span>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="config-item-svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
                                  </svg>
                                  {locale === "en" ? "Attic Isolation" : locale === "de" ? "Attika-Isolierung" : locale === "nl" ? "Attiek-isolatie" : "Isolation de l'attique"}
                                </span>
                                <span>{optionLabel(selection.etancheiteTerrasse)}</span>
                              </div>
                            )}
                            {selection.strukturaPlloqes?.value && (
                              <div className="config-option-item">
                                <span>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="config-item-svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 30v-30z" />
                                  </svg>
                                  {locale === "en" ? "Roof Insulation" : locale === "de" ? "Dachisolierung" : locale === "nl" ? "Dakisolatie" : "Isolation de la toiture"}
                                </span>
                                <span>{optionLabel(selection.strukturaPlloqes)}</span>
                              </div>
                            )}
                            {selection.izolimiPlloqes?.value && (
                              <div className="config-option-item">
                                <span>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="config-item-svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
                                  </svg>
                                  {locale === "en" ? "False Ceiling" : locale === "de" ? "Zwischendecke" : locale === "nl" ? "Verlaagd plafond" : "Faux plafond"}
                                </span>
                                <span>{optionLabel(selection.izolimiPlloqes)}</span>
                              </div>
                            )}
                            {dynamicSelectedOptions.map((item, index) => (
                              <div className="config-option-item" key={`${item.categoryId}-${item.optionId}-${index}`}>
                                <span>{item.categoryLabel || item.categoryId}</span>
                                <span>{item.label || item.optionId}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Displaying architectural specifications if available */}
                      {selection.perdhesa && Object.keys(selection.perdhesa).length > 0 && (
                        <>
                          <div className="specs-table-title">{t.archSpecs}</div>
                          <div className="configured-options-list architectural-specs">
                            {Object.entries(selection.perdhesa)
                              .filter((entry) => entry[1] && Number(entry[1]) > 0)
                              .map(([key, value]) => {
                                const translation = PERDHESA_LABELS[key];
                                const label = translation ? (translation[locale as keyof typeof translation] || translation.fr) : key.replaceAll("_", " ");
                                return (
                                  <div className="config-option-item" key={key}>
                                    <span>
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="config-item-svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                      </svg>
                                      {label}
                                    </span>
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
                      <span className="order-price-value">{euroFormatter.format(configurationSubtotal)}</span>
                    </div>
                    <div className="order-price-row">
                      <span className="order-price-label">{transportLabel}</span>
                      <span className="order-price-value">{formatTransportCost(transportCost)}</span>
                    </div>
                    <div className="order-price-row">
                      <span className="order-price-label">{t.assemblyCostLabel}</span>
                      <span className="order-price-value">{assemblyPriceText}</span>
                    </div>
                    
                    <div className="order-divider" />
                    
                    <div className="order-price-row order-total-row">
                      <span className="order-price-label">{t.totalEst}</span>
                      <span className="order-price-value order-total-price">{euroFormatter.format(total)}</span>
                    </div>
                    <p className="order-tax-notice">{t.taxNotice}</p>
                  </div>

                  <div className="order-summary-footer">
                    <button 
                      className="place-order-button" 
                      type="submit" 
                      form="checkout-form"
                      disabled={isSubmitting || !installationMode}
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
                      <div className="agreements-error-message" role="alert">
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
                <Link href={`/${locale}/maisons`} className="discover-btn">
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
