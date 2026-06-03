"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Locale } from "@/lib/i18n";

type B2BPageClientProps = {
  locale: Locale;
  dict: any;
};

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

const faqsDefault = [
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

export function B2BPageClient({ locale, dict }: B2BPageClientProps) {
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

    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("locale", locale);

    try {
      const res = await fetch("/api/b2b", {
        method: "POST",
        body: data,
      });

      const json = (await res.json()) as { success?: boolean; error?: string };

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Request failed");
      }

      setSubmitStatus("success");
      setFileName(null);
      form.reset();
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const t = dict?.b2b || {};
  const tAbout = dict?.about || {};

  // Localized texts based on locale
  const trans = {
    heroKicker: locale === "en" ? "Partners & Professionals" : locale === "de" ? "Partner & Fachleute" : locale === "nl" ? "Partners & Professionals" : "Partenaires & Professionnels",
    heroTitle: locale === "en" ? "Work With Us" : locale === "de" ? "Arbeiten Sie mit uns" : locale === "nl" ? "Werk met ons samen" : "Travailler avec nous",
    heroDesc: locale === "en" 
      ? "Associate our production plant with your expertise for exceptional wood projects. A partnership of trust, responsive and economically advantageous."
      : locale === "de" ? "Verbinden Sie unsere Produktionsstätte mit Ihrer Expertise für außergewöhnliche Holzprojekte. Eine vertrauensvolle, reaktionsschnelle und wirtschaftlich vorteilhafte Partnerschaft."
      : locale === "nl" ? "Combineer onze productiefaciliteit met uw expertise voor uitzonderlijke houtprojecten. Een partnerschap van vertrouwen, snel reagerend en economisch voordelig."
      : "Associez notre usine de production à votre expertise pour des projets bois d'exception. Un partenariat de confiance, réactif et économiquement avantageux.",
    stat1Label: locale === "en" ? "Active professional partners in France" : locale === "de" ? "Aktive professionelle Partner in Frankreich" : locale === "nl" ? "Actieve professionele partners in Frankrijk" : "Partenaires professionnels actifs en France",
    stat2Label: locale === "en" ? "Average years of uninterrupted collaboration" : locale === "de" ? "Jahre durchschnittliche ununterbrochene Zusammenarbeit" : locale === "nl" ? "Jaren gemiddelde ononderbroken samenwerking" : "De collaboration moyenne sans interruption",
    formInquiryType: locale === "en" ? "Project Type / Collaboration" : locale === "de" ? "Projekttyp / Zusammenarbeit" : locale === "nl" ? "Projecttype / Samenwerking" : "Type de projet / collaboration",
    formInquiryOptions: [
      { value: "", label: locale === "en" ? "Select an option" : locale === "de" ? "Option auswählen" : locale === "nl" ? "Selecteer een optie" : "Sélectionnez une option" },
      { value: "cnc", label: locale === "en" ? "CNC Cutting & Timber Structure" : locale === "de" ? "CNC-Zuschnitt & Holzrahmen" : locale === "nl" ? "CNC-zagen & Houtskelet" : "Découpe CNC & Charpente" },
      { value: "architecture", label: locale === "en" ? "Engineering & Architecture (Plans/Permits)" : locale === "de" ? "Planungsbüro & Architektur (Pläne/Genehmigung)" : locale === "nl" ? "Ingenieursbureau & Architectuur (Plannen/Vergunningen)" : "Bureau d'études & Architecture (Plans/Permis)" },
      { value: "kit", label: locale === "en" ? "Kit Manufacturing (Walls, Insulation, Windows)" : locale === "de" ? "Bausatz-Herstellung (Wände, Isolierung, Fenster)" : locale === "nl" ? "Bouwpakket-fabricage (Wanden, Isolatie, Ramen)" : "Fabrication de Kit (Murs, Isolation, Fenêtres)" },
      { value: "montage", label: locale === "en" ? "Full Construction & Assembly" : locale === "de" ? "Kompletter Bau & Montage" : locale === "nl" ? "Volledige bouw & montage" : "Construction & Montage complet" },
      { value: "autre", label: locale === "en" ? "Other type of project" : locale === "de" ? "Anderer Projekttyp" : locale === "nl" ? "Ander projecttype" : "Autre type de projet" }
    ],
    firstName: locale === "en" ? "First Name" : locale === "de" ? "Vorname" : locale === "nl" ? "Voornaam" : "Prénom",
    lastName: locale === "en" ? "Last Name" : locale === "de" ? "Nachname" : locale === "nl" ? "Achternaam" : "Nom de famille",
    email: locale === "en" ? "Professional Email" : locale === "de" ? "Professionelle E-Mail" : locale === "nl" ? "Zakelijk e-mailadres" : "Email professionnel",
    phone: locale === "en" ? "Phone Number" : locale === "de" ? "Telefonnummer" : locale === "nl" ? "Telefoonnummer" : "Numéro de téléphone",
    message: locale === "en" ? "Message" : locale === "de" ? "Nachricht" : locale === "nl" ? "Bericht" : "Message",
    messagePlaceholder: locale === "en" 
      ? "Detail your needs (dimensions, existing plans, expected delivery times...)"
      : locale === "de" ? "Detaillieren Sie Ihre Bedürfnisse (Maße, bestehende Pläne, erwartete Lieferzeiten...)"
      : locale === "nl" ? "Beschrijf uw behoeften (afmetingen, bestaande plannen, verwachte levertijden...)"
      : "Détaillez vos besoins (dimensions, plans déjà existants, délais de livraison attendus...)",
    fileUploadLabel: locale === "en" ? "Import File (Plans, PDF, CAD, ZIP...)" : locale === "de" ? "Datei importieren (Pläne, PDF, CAD, ZIP...)" : locale === "nl" ? "Bestand importeren (Plannen, PDF, CAD, ZIP...)" : "Import File (Plans, PDF, CAD, ZIP...)",
    fileUploadPlaceholder: locale === "en" 
      ? "Drop your files here or click to select" 
      : locale === "de" ? "Dateien hier ablegen oder zum Auswählen klicken" 
      : locale === "nl" ? "Sleep bestanden hierheen of klik om te kiezen" 
      : "Déposer vos fichiers ici ou cliquer pour choisir",
    submitButton: locale === "en" ? "Submit Project" : locale === "de" ? "Projekt einreichen" : locale === "nl" ? "Project indienen" : "Soumettre le projet",
    submittingText: locale === "en" ? "Submitting..." : locale === "de" ? "Wird gesendet..." : locale === "nl" ? "Verzenden..." : "Envoi en cours...",
    whyTitle: locale === "en" ? "Why choose Ossa Bois France?" : locale === "de" ? "Warum Ossa Bois France wählen?" : locale === "nl" ? "Waarom kiezen voor Ossa Bois France?" : "Pourquoi choisir Ossa Bois France ?",
    whyCards: [
      {
        title: locale === "en" ? "Integrated Engineering Office" : locale === "de" ? "Integriertes Planungsbüro" : locale === "nl" ? "Geïntegreerd Ingenieursbureau" : "Bureau d'Études Intégré",
        desc: locale === "en" 
          ? "Advanced technical optimization of your assembly and cutting plans by our engineers."
          : locale === "de" ? "Fortgeschrittene technische Optimierung Ihrer Montage- und Zuschnittpläne durch unsere Ingenieure."
          : locale === "nl" ? "Geavanceerde technische optimalisatie van uw montage- en zaagplannen door onze ingenieurs."
          : "Optimisation technique poussée de vos plans de pose et de découpe par nos ingénieurs."
      },
      {
        title: locale === "en" ? "High Precision CNC Machining" : locale === "de" ? "Hochpräzise CNC-Bearbeitung" : locale === "nl" ? "Hoge Precisie CNC-Bewerking" : "Usinage CNC Haute Précision",
        desc: locale === "en" 
          ? "Robotized cutting guaranteeing millimeter precision for every timber frame element."
          : locale === "de" ? "Robotergestützter Zuschnitt garantiert millimetergenaue Präzision für jedes Holzrahmenelement."
          : locale === "nl" ? "Gerobotiseerd zagen garandeert millimeterprecisie voor elk houtskeletelement."
          : "Découpe robotisée garantissant une précision millimétrique de chaque élément d'ossature."
      },
      {
        title: locale === "en" ? "Guarantees & Insurances" : locale === "de" ? "Garantien & Versicherungen" : locale === "nl" ? "Garanties & Verzekeringen" : "Garanties & Assurances",
        desc: locale === "en" 
          ? "All our kits and prefabricated structures benefit from French decennial structural insurance."
          : locale === "de" ? "Alle unsere Bausätze und vorgefertigten Strukturen profitieren von der französischen zehnjährigen Strukturversicherung."
          : locale === "nl" ? "Al onze bouwpakketten en geprefabriceerde structuren profiteren van de Franse tienjarige structuurverzekering."
          : "Tous nos kits et structures préfabriquées bénéficient de l'assurance décennale française."
      },
      {
        title: locale === "en" ? "Certified Supply" : locale === "de" ? "Zertifizierte Holzlieferung" : locale === "nl" ? "Gecertificeerde houtlevering" : "Approvisionnement Certifié",
        desc: locale === "en" 
          ? "Exclusive use of PEFC certified wood sourced from sustainably managed forests."
          : locale === "de" ? "Ausschließliche Verwendung von PEFC-zertifiziertem Holz aus nachhaltig bewirtschafteten Wäldern."
          : locale === "nl" ? "Exclusief gebruik van PEFC-gecertificeerd hout uit duurzaam beheerde bossen."
          : "Utilisation exclusive de bois certifié PEFC issu de forêts gérées durablement."
      }
    ],
    processTitle: locale === "en" ? "Our collaboration process" : locale === "de" ? "Unser Kooperationsprozess" : locale === "nl" ? "Ons samenwerkingsproces" : "Notre processus de collaboration",
    processDesc: locale === "en"
      ? "A structured and rigorous industrial workflow to guarantee precision, delivery compliance, and the strength of your constructions."
      : locale === "de" ? "Ein strukturierter und strenger industrieller Arbeitsablauf, um Präzision, Liefertreue und Stabilität Ihres Baus zu garantieren."
      : locale === "nl" ? "Een gestructureerde en strikte industriële workflow om precisie, tijdige levering en stevigheid van uw constructies te garanderen."
      : "Un flux de travail industriel structuré et rigoureux pour garantir la précision, le respect des délais et la solidité de vos constructions.",
    processSteps: [
      {
        num: "01",
        title: locale === "en" ? "Planning & Study" : locale === "de" ? "Planung & Analyse" : locale === "nl" ? "Planning & Studie" : "Planification & Étude",
        desc: locale === "en" ? "Technical analysis of your CAD files by our integrated design office to optimize the structure." : locale === "de" ? "Technische Analyse Ihrer CAD-Dateien durch unser integriertes Planungsbüro zur Optimierung der Struktur." : locale === "nl" ? "Technische analyse van uw CAD-bestanden door ons geïntegreerde ontwerpbureau om de structuur te optimaliseren." : "Analyse technique de vos fichiers DAO/CAD par notre bureau d'études intégré pour optimiser la structure."
      },
      {
        num: "02",
        title: locale === "en" ? "CNC Cutting" : locale === "de" ? "CNC-Zuschnitt" : locale === "nl" ? "CNC-zagen" : "Taille & Découpe CNC",
        desc: locale === "en" ? "High precision robotized cutting on our numeric machining center for a perfect fit." : locale === "de" ? "Hochpräziser robotergestützter Zuschnitt auf unserem numerischen Bearbeitungszentrum für perfekten Sitz." : locale === "nl" ? "Uiterst nauwkeurige gerobotiseerde bewerking op ons numerieke bewerkingscentrum voor een perfecte pasvorm." : "Usinage robotisé de haute précision sur notre centre de taille numérique pour un ajustement parfait."
      },
      {
        num: "03",
        title: locale === "en" ? "Factory Assembly" : locale === "de" ? "Montage im Werk" : locale === "nl" ? "Assemblage in fabriek" : "Assemblage en Usine",
        desc: locale === "en" ? "Prefabrication of walls with integrated RE2020 insulation and optional external joinery." : locale === "de" ? "Vorfertigung der Wände mit integrierter RE2020-Isolierung und optionalem Einbau von Außenfenstern." : locale === "nl" ? "Prefabricage van wanden met geïntegreerde RE2020-isolatie en optionele montage van buitenramen." : "Préfabrication des murs avec isolation RE2020 intégrée et pose facultative des menuiseries extérieures."
      },
      {
        num: "04",
        title: locale === "en" ? "Logistics & Delivery" : locale === "de" ? "Logistik & Lieferung" : locale === "nl" ? "Logistiek & Levering" : "Logistique & Livraison",
        desc: locale === "en" ? "Direct delivery of numbered kits to your site anywhere, accompanied by assembly plans." : locale === "de" ? "Direkte Lieferung nummerierter Bausätze zu Ihrer Baustelle überall, inklusive Montageplänen." : locale === "nl" ? "Directe levering van genummerde pakketten op uw bouwlocatie overal, inclusief montageplannen." : "Livraison directe des kits numérotés sur votre chantier partout en France, accompagnés des plans de montage."
      }
    ],
    trustKicker: locale === "en" ? "A human and lasting relationship" : locale === "de" ? "Eine menschliche und dauerhafte Beziehung" : locale === "nl" ? "Een menselijke en duurzame relatie" : "Une relation humaine et durable",
    trustTitle: locale === "en" ? "A culture of loyalty and hospitality" : locale === "de" ? "Eine Kultur der Loyalität und Gastfreundschaft" : locale === "nl" ? "Een cultuur van loyaliteit en gastvrijheid" : "Une culture de la fidélité et de l'accueil",
    trustDesc1: locale === "en"
      ? "At Ossa Bois France, we are not simple wood suppliers. We are local, warm partners, ready to welcome you to discuss your projects or visit our plant."
      : locale === "de" ? "Bei Ossa Bois France sind wir keine einfachen Holzanbieter. Wir sind partnerschaftlich, herzlich und immer bereit, Sie zu begrüßen, um über Ihre Projekte zu sprechen oder unser Werk zu besichtigen."
      : locale === "nl" ? "Bij Ossa Bois France zijn we geen eenvoudige houtleveranciers. We zijn persoonlijke, warme partners, klaar om u te verwelkomen om uw projecten te bespreken of onze fabriek te bezoeken."
      : "Chez Ossa Bois France, nous ne sommes pas de simples fournisseurs de bois. Nous sommes des partenaires de proximité, chaleureux, à l'écoute et toujours prêts à vous accueillir pour échanger autour de vos projets ou visiter notre usine.",
    trustDesc2: locale === "en"
      ? "We believe in transparent, simple, and responsive communication. This human approach combined with the economic profitability of our solutions is our strength: 100% of our key professional partners have been working with us for over 8 years without changing manufacturers."
      : locale === "de" ? "Wir glauben an transparente, einfache und schnelle Kommunikation. Dieser menschliche Ansatz, gepaart mit der Wirtschaftlichkeit unserer Lösungen, ist unsere Stärke: 100 % unserer wichtigsten Partner arbeiten seit über 8 Jahren mit uns zusammen, ohne den Hersteller zu wechseln."
      : locale === "nl" ? "Wij geloven in transparante, eenvoudige en snelle communicatie. Deze menselijke benadering, gecombineerd met het economische voordeel van onze oplossingen, is onze kracht: al onze vaste zakelijke partners werken al meer dan 8 jaar met ons samen zonder van fabrikant te veranderen."
      : "Nous croyons en une communication transparente, simple et réactive. C'est cette approche humaine alliée à la rentabilité économique de nos solutions qui fait notre force : la totalité de nos partenaires professionnels collaborent avec nous depuis plus de 8 ans sans jamais changer de fabricant.",
    trustStat1: locale === "en" ? "Years of average collaboration with partners" : locale === "de" ? "Jahre durchschnittliche Zusammenarbeit mit Partnern" : locale === "nl" ? "Jaren gemiddelde samenwerking met partners" : "Années de collaboration moyenne avec nos partenaires",
    trustStat2: locale === "en" ? "Retention rate of key partners" : locale === "de" ? "Kundenbindungsrate der wichtigsten Partner" : locale === "nl" ? "Retentiepercentage van onze vaste partners" : "De taux de rétention de nos partenaires clés",
    faqTitle: locale === "en" ? "Questions & Answers on timber framing" : locale === "de" ? "Fragen & Antworten zu Holzrahmenbau" : locale === "nl" ? "Vragen & Antwoorden over houtskeletbouw" : "Questions-réponses sur l’ossature bois",
    faqDesc: locale === "en"
      ? "Every house built by Ossa Bois France benefits from all constructor guarantees required by law, including ten-year insurance."
      : locale === "de" ? "Jedes von Ossa Bois France gebaute Haus profitiert von allen gesetzlich vorgeschriebenen Baugarantien, einschließlich zehnjähriger Versicherung."
      : locale === "nl" ? "Elk huis gebouwd door Ossa Bois France profiteert van alle wettelijke bouwgaranties, inclusief tienjarige verzekering."
      : "Chaque maison construite par Ossa Bois France bénéficie de toutes les garanties constructeurs requises par la loi, y compris l'assurance décennale."
  };

  // FAQs mapping
  const faqs = (tAbout.faqs || faqsDefault).map((f: any, idx: number) => ({
    id: `faq-${idx + 1}`,
    question: f.question,
    answer: f.answer
  }));

  return (
    <section className="b2b-page">
      {/* ─── TYPOGRAPHIC HERO SECTION (NO BACKGROUND IMAGE) ─── */}
      <div className="b2b-hero-clean">
        <div className="container">
          <div className="b2b-hero-grid-layout">
            <div className="b2b-hero-text-col">
              <span className="b2b-hero-kicker">{trans.heroKicker}</span>
              <h1>{t.title || trans.heroTitle}</h1>
              <p className="hero-description">
                {t.introText || trans.heroDesc}
              </p>
            </div>
            <div className="b2b-hero-stats-col">
              <div className="b2b-hero-stat-item">
                <span className="hero-stat-num">
                  <AnimatedNumber target={50} suffix="+" />
                </span>
                <span className="hero-stat-lbl">{trans.stat1Label}</span>
              </div>
              <div className="b2b-hero-stats-divider" />
              <div className="b2b-hero-stat-item">
                <span className="hero-stat-num">
                  <AnimatedNumber target={8} suffix="+ ans" />
                </span>
                <span className="hero-stat-lbl">{trans.stat2Label}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FORM SECTION ─── */}
      <div className="b2b-form-section" id="b2b-form-section">
        <div className="container">
          <div className="b2b-form-layout">
            {/* Left side: Form */}
            <div className="b2b-form-col">
              <h2>{t.formTitle || "Demander une étude"}</h2>
              <p className="b2b-form-subtitle">
                {t.formSubtitle || "Sélectionnez le type de collaboration et transmettez-nous vos plans de projet pour analyse par nos ingénieurs."}
              </p>
              
              {submitStatus === "success" && (
                <div className="form-alert success">
                  <p>✓ {t.success || "Votre demande a été transmise avec succès. Notre bureau d'études l'étudie dans les meilleurs délais."}</p>
                </div>
              )}
              {submitStatus === "error" && (
                <div className="form-alert error">
                  <p>✗ {locale === "en" ? "An error occurred. Please try again." : locale === "de" ? "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut." : locale === "nl" ? "Er is een fout opgetreden. Probeer het opnieuw." : "Une erreur est survenue lors de l'envoi. Veuillez réessayer."}</p>
                </div>
              )}

              <form className="contact-form b2b-form" id="b2b-forma" onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
                />
                <div className="form-group">
                  <label htmlFor="b2b-inquiry">{trans.formInquiryType}</label>
                  <select id="b2b-inquiry" name="inquiryType" required>
                    {trans.formInquiryOptions.map((opt, i) => (
                      <option key={i} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="b2b-firstname">{trans.firstName}</label>
                    <input id="b2b-firstname" type="text" name="firstname" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="b2b-lastname">{trans.lastName}</label>
                    <input id="b2b-lastname" type="text" name="lastname" required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="b2b-email">{t.email || trans.email}</label>
                    <input id="b2b-email" type="email" name="email" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="b2b-phone">{t.phone || trans.phone}</label>
                    <input id="b2b-phone" type="tel" name="phone" required />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="b2b-message">{trans.message}</label>
                  <textarea 
                    id="b2b-message" 
                    name="message" 
                    rows={5} 
                    placeholder={trans.messagePlaceholder} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>{t.uploadLabel || trans.fileUploadLabel}</label>
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
                        {fileName ? fileName : (t.uploadPlaceholder || trans.fileUploadPlaceholder)}
                      </span>
                    </div>
                  </div>
                </div>

                <button className="button button-loading-container" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="btn-spinner"></span>
                      {t.loading || trans.submittingText}
                    </>
                  ) : (
                    (t.submit || trans.submitButton)
                  )}
                </button>
              </form>
            </div>

            {/* Right side: Commitments & Assurances card */}
            <div className="b2b-info-col">
              <div className="b2b-commitments-card">
                <h3>{t.advantagesTitle || trans.whyTitle}</h3>
                
                {trans.whyCards.map((card, i) => (
                  <div className="b2b-commitment-item" key={i}>
                    <svg className="commitment-check" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <div>
                      <h4>{card.title}</h4>
                      <p>{card.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── PROCESS timeline SECTION ─── */}
      <div className="b2b-process-section">
        <div className="container">
          <div className="b2b-process-header">
            <h2>{trans.processTitle}</h2>
            <p>{trans.processDesc}</p>
          </div>

          <div className="b2b-process-grid">
            {trans.processSteps.map((step, idx) => (
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
              <span className="b2b-trust-kicker">{trans.trustKicker}</span>
              <h2>{trans.trustTitle}</h2>
              <p>{trans.trustDesc1}</p>
              <p>{trans.trustDesc2}</p>
            </div>
            <div className="b2b-trust-stats">
              <div className="b2b-stat-box">
                <span className="stat-number">
                  <AnimatedNumber target={8} suffix="+" />
                </span>
                <span className="stat-label">{trans.trustStat1}</span>
              </div>
              <div className="b2b-stat-box">
                <span className="stat-number">
                  <AnimatedNumber target={100} suffix="%" />
                </span>
                <span className="stat-label">{trans.trustStat2}</span>
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
              <h2>{trans.faqTitle}</h2>
              <p>{trans.faqDesc}</p>
            </div>

            <div className="faq-accordion-col">
              <div className="accordion-wrapper">
                {faqs.map((faq: any) => {
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
