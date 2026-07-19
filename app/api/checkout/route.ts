import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import { mapHouseDocToConfiguratorData } from "@/lib/house-mapper";
import { isLocale, type Locale } from "@/lib/i18n";
import {
  calculateCheckoutGrandTotal,
  CHECKOUT_CATEGORY_PAYLOAD_KEYS,
  getRoofAreaM2,
  isCheckoutTotalValid,
} from "@/lib/checkout-pricing";
import {
  checkRateLimitAsync,
  getClientIp,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { escapeHtml, getResendAdminEmail, getResendOrderFromEmail, sendResendMail } from "@/lib/resend-mail";
import { isValidEmail, sanitizeText } from "@/lib/form-utils";
import { uploadOrderScreenshotToMedia } from "@/lib/upload-order-screenshot";

const euroFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = await checkRateLimitAsync(`checkout:${ip}`, 6, 15 * 60 * 1000);
  if (!limited.allowed) {
    return rateLimitResponse(limited.retryAfterSec);
  }

  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: "Corps de requête invalide." },
        { status: 400 }
      );
    }
    // `clientTotal` is the price the browser CLAIMS. It is only used to detect a
    // mismatch; the authoritative `total` is set to the server-computed figure
    // below and is what gets persisted and emailed.
    const {
      selection,
      personalInfo,
      deliveryInfo,
      total: clientTotal,
      locale: rawLocale,
    } = body;
    if (rawLocale !== undefined && (typeof rawLocale !== "string" || !isLocale(rawLocale))) {
      return NextResponse.json(
        { success: false, error: "Langue non prise en charge." },
        { status: 400 }
      );
    }
    const locale: Locale = rawLocale ?? "fr";
    if (!selection || typeof selection !== "object" || Array.isArray(selection)) {
      return NextResponse.json(
        { success: false, error: "Configuration invalide." },
        { status: 400 }
      );
    }
    const selectionRecord = selection as Record<string, unknown>;

    // Sanitize + validate every client-provided value before it is persisted or
    // interpolated into transactional emails (prevents HTML/attribute injection).
    const orderRef = sanitizeText(body.orderRef, 64).replace(/[^A-Za-z0-9_-]/g, "");
    if (!orderRef) {
      return NextResponse.json(
        { success: false, error: "Référence de commande invalide." },
        { status: 400 }
      );
    }

    const clientName = sanitizeText(personalInfo?.fullName, 120, { singleLine: true });
    const clientEmail = sanitizeText(personalInfo?.email, 254, { singleLine: true });
    const clientPhone = sanitizeText(personalInfo?.phone, 40, { singleLine: true });

    if (!clientEmail || !isValidEmail(clientEmail)) {
      return NextResponse.json(
        { success: false, error: "Adresse e-mail invalide." },
        { status: 400 }
      );
    }

    const delivery = {
      streetAddress: sanitizeText(deliveryInfo?.streetAddress, 200),
      city: sanitizeText(deliveryInfo?.city, 100),
      zipCode: sanitizeText(deliveryInfo?.zipCode, 20),
      stateRegion: sanitizeText(deliveryInfo?.stateRegion, 100),
      country: sanitizeText(deliveryInfo?.country, 80),
      notes: sanitizeText(deliveryInfo?.notes, 4000),
    };

    if (
      !clientName ||
      !clientPhone ||
      !delivery.streetAddress ||
      !delivery.city ||
      !delivery.zipCode ||
      !delivery.stateRegion ||
      !delivery.country
    ) {
      return NextResponse.json(
        { success: false, error: "Informations client ou de livraison incomplètes." },
        { status: 400 }
      );
    }

    // Validate selection and resolve House Document ID
    const selectedHouse = selectionRecord.house;
    const houseSlug =
      selectedHouse && typeof selectedHouse === "object" && !Array.isArray(selectedHouse)
        ? (selectedHouse as Record<string, unknown>).id
        : undefined;
    if (!houseSlug) {
      return NextResponse.json(
        { success: false, error: "Missing house selection reference." },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });
    const housesResult = await payload.find({
      collection: 'houses',
      where: { slug: { equals: houseSlug } },
      limit: 1
    });

    if (housesResult.totalDocs === 0) {
      return NextResponse.json(
        { success: false, error: `Maison avec le slug '${houseSlug}' introuvable dans la base de données.` },
        { status: 400 }
      );
    }

    const houseDoc = housesResult.docs[0];

    // Load global options to propagate dynamic pricing and metadata
    let globalOptions = null;
    try {
      globalOptions = await payload.findGlobal({
        slug: 'house-options',
        depth: 2,
      });
    } catch (globalErr) {
      console.error("[API Checkout] Failed to fetch global options:", globalErr);
    }

    // Map house doc using configurator mapper
    const configData = mapHouseDocToConfiguratorData(houseDoc, globalOptions, undefined, locale);
    if (!configData) {
      return NextResponse.json(
        { success: false, error: "Failed to map configurator config." },
        { status: 500 }
      );
    }

    const pricing = calculateCheckoutGrandTotal(configData, selectionRecord);
    if ("error" in pricing) {
      return NextResponse.json(
        { success: false, error: pricing.error },
        { status: 400 }
      );
    }

    const {
      grandTotal: calculatedGrandTotal,
      selectedSizeId,
      installationMode,
      baseStructurePrice: serverBasePrice,
      optionsTotal: serverOptionsTotal,
      configurationSubtotal,
      truckCount,
      transportCost: serverTransportCost,
      assemblyCost: serverAssemblyCost,
    } = pricing;
    const selectedSize = configData.sizes.find(
      (s) => s.id === selectedSizeId || s.label === selectedSizeId
    )!;
    const roofArea = getRoofAreaM2(configData.perdhesa);
    const categoryIdToPayloadKey = CHECKOUT_CATEGORY_PAYLOAD_KEYS;

    if (!isCheckoutTotalValid(clientTotal, calculatedGrandTotal)) {
      console.warn(`[API Checkout] Price mismatch! Client: ${clientTotal}, Server calculated: ${calculatedGrandTotal}`);
      return NextResponse.json(
        { success: false, error: "Prix de commande non valide (incohérence de calcul)." },
        { status: 400 }
      );
    }

    // Authoritative total: from here on use the SERVER-computed price for
    // persistence and emails — never the client's claimed figure (which is
    // only used for the mismatch check above).
    const total = calculatedGrandTotal;

    // Construct an allowlisted, fully server-authored order snapshot. No client
    // dimensions, labels, images, prices, or arbitrary fields are persisted.
    const selectionForStorage: Record<string, unknown> = {
      house: {
        id: configData.id,
        name: configData.name,
        image: configData.finalImage || configData.defaultImage,
      },
      size: {
        value: selectedSizeId,
        label: selectedSize.label,
        price: String(serverBasePrice),
        image: selectedSize.image,
      },
      perdhesa: { ...configData.perdhesa },
      basePrice: serverBasePrice,
      baseStructurePrice: serverBasePrice,
      optionsTotal: serverOptionsTotal,
      configurationSubtotal,
      truckCount,
      transportCost: serverTransportCost,
      installationMode,
      assemblyCost: serverAssemblyCost,
      totalPrice: total,
      installation: {
        mode: installationMode,
        provider:
          installationMode === "ossa" ? "ossa_bois" : "client_or_third_party",
        performedByOssa: installationMode === "ossa",
        cost: serverAssemblyCost,
      },
    };
    const authoritativeSelectedOptions: Array<Record<string, unknown>> = [];

    // Keep the chosen option labels/images for the order summary, but replace
    // every client-supplied option price with the corresponding server price.
    // Unknown option values are removed instead of being documented as if they
    // had been accepted by the configurator.
    for (const category of configData.categories) {
      const payloadKey = categoryIdToPayloadKey[category.id] || category.id;
      const requestedOption = selectionRecord[payloadKey];
      if (!requestedOption || typeof requestedOption !== "object" || Array.isArray(requestedOption)) {
        continue;
      }

      const value = (requestedOption as Record<string, unknown>).value;
      const option = category.options.find(
        (candidate) => candidate.id === value || candidate.label === value
      );
      // Unknown explicit values were already rejected by the pricing validator.
      if (!option) continue;

      const authoritativeUnitPrice =
        selectedSizeId === "60x200"
          ? (option.price200 ?? option.price160)
          : option.price160;
      const multiplier =
        category.priceMode === "wall_m2"
          ? configData.perdhesa.mure_te_jashtme
          : category.priceMode === "roof_m2"
            ? roofArea
            : 1;
      selectionForStorage[payloadKey] = {
        id: option.id,
        value: option.label,
        label: option.label,
        price: String(authoritativeUnitPrice),
        image: option.layer,
      };
      authoritativeSelectedOptions.push({
        categoryId: category.id,
        categoryLabel: category.label,
        payloadKey,
        optionId: option.id,
        label: option.label,
        unitPrice: authoritativeUnitPrice,
        multiplier,
        totalPrice: authoritativeUnitPrice * multiplier,
        priceMode: category.priceMode,
      });
    }
    selectionForStorage.selectedOptions = authoritativeSelectedOptions;

    // Persist order in the database
    const orderDoc = await payload.create({
      collection: 'orders',
      data: {
        orderRef: orderRef,
        house: houseDoc.id,
        customerName: clientName,
        customerEmail: clientEmail,
        customerPhone: clientPhone || "",
        totalPrice: total,
        transportCost: serverTransportCost,
        streetAddress: delivery.streetAddress,
        city: delivery.city,
        zipCode: delivery.zipCode,
        stateRegion: delivery.stateRegion,
        country: delivery.country,
        clientNotes: delivery.notes,
        selections: selectionForStorage,
        status: 'pending',
      }
    });

    console.log(`[API Checkout] Order persisted in database with ID: ${orderDoc.id}`);

    const configuredSiteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      "https://ossaboisfrance.com";
    const siteOrigin = new URL(configuredSiteUrl).origin;
    let houseImageUrl = "";

    const base64Image = selectionRecord.currentImage;
    if (base64Image && typeof base64Image === "string") {
      try {
        const uploaded = await uploadOrderScreenshotToMedia(
          payload,
          base64Image,
          orderRef
        );
        if (uploaded) {
          houseImageUrl = uploaded;
          console.log(`[API Checkout] Screenshot stored in media: ${uploaded}`);
        }
      } catch (saveErr) {
        console.error("[API Checkout] Failed to upload selection image to media:", saveErr);
      }
    }

    if (!houseImageUrl) {
      const defaultImage = `${siteOrigin}/images/houses/ambre/10 ambre.jpg`;
      const rawFallback = configData.finalImage || configData.defaultImage;
      const fallbackPath = typeof rawFallback === "string" ? rawFallback : "";

      if (!fallbackPath) {
        houseImageUrl = defaultImage;
      } else if (fallbackPath.startsWith("http")) {
        houseImageUrl = fallbackPath;
      } else if (fallbackPath.startsWith("/")) {
        houseImageUrl = `${siteOrigin}${fallbackPath}`;
      } else {
        houseImageUrl = defaultImage;
      }
    }

    // Multi-Language translation dictionaries for client emails
    const clientEmailTranslations: Record<string, Record<string, string>> = {
      fr: {
        subject: "Votre projet de construction Ossa Bois - Référence {ref}",
        title: "Votre projet de maison en ossature bois",
        greeting: "Bonjour {name},",
        intro: "Nous vous remercions chaleureusement d'avoir configuré votre future maison avec notre configurateur en ligne. Votre demande a bien été enregistrée sous la référence unique <strong>{ref}</strong>. Notre bureau d'études examine actuellement la faisabilité technique de votre projet.",
        dimensionsHeader: "Dimensions & Caractéristiques Structurelles",
        neto: "Surface Habitable (Neto)",
        bruto: "Surface au sol (Bruto)",
        walls: "Murs Extérieurs",
        roof: "Surface Toiture",
        componentHeader: "Composant",
        choiceHeader: "Choix sélectionné",
        priceHeader: "Tarif estimé",
        baseStructure: "Structure & Ossature Bois",
        baseStructureDesc: "Modèle {model} ({size})",
        transport: "Logistique & Transport",
        transportDesc: "Livraison sur site : {trucks} camion(s) × 3 500 €",
        assembly: "Montage",
        assemblyOssaDesc: "Montage réalisé par Ossa Bois",
        assemblyProfessionalDesc: "Montage réalisé par le client ou une entreprise tierce (non pris en charge par Ossa Bois)",
        totalEstimation: "Estimation globale du projet configuré",
        nextStepsHeader: "Prochaines étapes de votre projet",
        step1Title: "Étape 1 : Bureau d'études",
        step1Desc: "Notre équipe technique analyse votre terrain et l'accès au chantier sous 24 à 48 heures.",
        step2Title: "Étape 2 : Entretien conseil",
        step2Desc: "Un conseiller technique Ossa Bois prend contact avec vous par téléphone au <strong>{phone}</strong> pour valider les finitions.",
        step3Title: "Étape 3 : Devis définitif",
        step3Desc: "Établissement du devis personnalisé avec les conditions contractuelles applicables.",
        footerText: "L'équipe Ossa Bois France reste à votre entière disposition pour donner vie à vos projets."
      },
      en: {
        subject: "Your Ossa Bois construction project - Reference {ref}",
        title: "Your timber frame house project",
        greeting: "Hello {name},",
        intro: "Thank you for configuring your future home with our online configurator. Your request has been successfully registered under the unique reference <strong>{ref}</strong>. Our engineering office is currently reviewing the technical feasibility of your project.",
        dimensionsHeader: "Dimensions & Structural Specifications",
        neto: "Living Area (Neto)",
        bruto: "Footprint Area (Bruto)",
        walls: "Exterior Walls",
        roof: "Roof Area",
        componentHeader: "Component",
        choiceHeader: "Selected choice",
        priceHeader: "Estimated price",
        baseStructure: "Timber Frame Structure",
        baseStructureDesc: "Model {model} ({size})",
        transport: "Logistics & Shipping",
        transportDesc: "On-site delivery: {trucks} truck(s) × €3,500",
        assembly: "Assembly",
        assemblyOssaDesc: "Assembly performed by Ossa Bois",
        assemblyProfessionalDesc: "Assembly performed by the client or a third-party company (not provided by Ossa Bois)",
        totalEstimation: "Configured project estimate",
        nextStepsHeader: "Next steps of your project",
        step1Title: "Step 1: Engineering Review",
        step1Desc: "Our technical team analyzes your land and access configuration within 24 to 48 hours.",
        step2Title: "Step 2: Expert Consult",
        step2Desc: "An Ossa Bois technical advisor will contact you by phone at <strong>{phone}</strong> to confirm your finishes.",
        step3Title: "Step 3: Final Quote",
        step3Desc: "Preparation of your personalized quotation with the applicable contractual terms.",
        footerText: "The Ossa Bois France team remains at your complete disposal to bring your projects to life."
      },
      de: {
        subject: "Ihr Ossa Bois Bauprojekt - Referenz {ref}",
        title: "Ihr Holzrahmenhaus-Projekt",
        greeting: "Hallo {name},",
        intro: "Vielen Dank, dass Sie Ihr zukünftiges Haus mit unserem Online-Konfigurator gestaltet haben. Ihre Anfrage wurde erfolgreich unter der eindeutigen Referenz <strong>{ref}</strong> registriert. Unser Planungsbüro prüft derzeit die technische Machbarkeit Ihres Projekts.",
        dimensionsHeader: "Abmessungen & Konstruktionsdaten",
        neto: "Wohnfläche (Netto)",
        bruto: "Grundfläche (Brutto)",
        walls: "Außenwände",
        roof: "Dachfläche",
        componentHeader: "Komponente",
        choiceHeader: "Ausgewählte Option",
        priceHeader: "Geschätzter Preis",
        baseStructure: "Holzrahmenstruktur & Tragwerk",
        baseStructureDesc: "Modell {model} ({size})",
        transport: "Logistik & Transport",
        transportDesc: "Lieferung zur Baustelle: {trucks} Lkw × 3.500 €",
        assembly: "Montage",
        assemblyOssaDesc: "Montage durch Ossa Bois",
        assemblyProfessionalDesc: "Montage durch den Kunden oder ein Drittunternehmen (nicht durch Ossa Bois)",
        totalEstimation: "Schätzung des konfigurierten Projekts",
        nextStepsHeader: "Nächste Schritte Ihres Projekts",
        step1Title: "Schritt 1: Technische Prüfung",
        step1Desc: "Unser technisches Team analysiert Ihr Grundstück und die Logistik innerhalb von 24 bis 48 Stunden.",
        step2Title: "Schritt 2: Beratungsgespräch",
        step2Desc: "Ein technischer Berater von Ossa Bois kontaktiert Sie telefonisch unter <strong>{phone}</strong>, um Details abzustimmen.",
        step3Title: "Schritt 3: Endgültiges Angebot",
        step3Desc: "Erstellung Ihres persönlichen Angebots mit den geltenden Vertragsbedingungen.",
        footerText: "Das Team von Ossa Bois France steht Ihnen jederzeit gerne zur Verfügung, um Ihre Träume zu verwirklichen."
      },
      nl: {
        subject: "Uw Ossa Bois bouwproject - Referentie {ref}",
        title: "Uw houtskeletbouw project",
        greeting: "Hallo {name},",
        intro: "Hartelijk dank voor het configureren van uw toekomstige woning met onze online configurator. Uw aanvraag is succesvol geregistreerd onder de unieke referentie <strong>{ref}</strong>. Ons studiebureau beoordeelt momenteel de technische haalbaarheid van uw project.",
        dimensionsHeader: "Afmetingen & Structurele Kenmerken",
        neto: "Woonoppervlakte (Neto)",
        bruto: "Grondoppervlakte (Bruto)",
        walls: "Buitenmuren",
        roof: "Dakoppervlakte",
        componentHeader: "Component",
        choiceHeader: "Geselecteerde optie",
        priceHeader: "Geschatte prijs",
        baseStructure: "Houtskelet & Structuur",
        baseStructureDesc: "Model {model} ({size})",
        transport: "Logistiek & Transport",
        transportDesc: "Levering op de werf: {trucks} vrachtwagen(s) × € 3.500",
        assembly: "Montage",
        assemblyOssaDesc: "Montage uitgevoerd door Ossa Bois",
        assemblyProfessionalDesc: "Montage uitgevoerd door de klant of een extern bedrijf (niet door Ossa Bois)",
        totalEstimation: "Raming van het geconfigureerde project",
        nextStepsHeader: "Volgende stappen van uw project",
        step1Title: "Stap 1: Technische Analyse",
        step1Desc: "Ons technisch team analyseert uw terrein en de bereikbaarheid binnen 24 tot 48 uur.",
        step2Title: "Stap 2: Adviesgesprek",
        step2Desc: "Een technisch adviseur van Ossa Bois neemt telefonisch contact met u op via <strong>{phone}</strong> om de afwerking te bespreken.",
        step3Title: "Stap 3: Definitieve Offerte",
        step3Desc: "Opstellen van uw persoonlijke offerte met de toepasselijke contractvoorwaarden.",
        footerText: "Het team van Ossa Bois France staat volledig tot uw beschikking om uw project te realiseren."
      }
    };

    // Resolve client locale context (fallbacks to French if not defined/supported)
    const clientLocaleKey = locale;
    const l = clientEmailTranslations[clientLocaleKey];

    // Helper function to build the options row details list for client or admin email
    const getDetailedOptions = (cfgData: typeof configData, lang: string) => {
      const list: Array<{
        categoryLabel: string;
        optionLabel: string;
        unitPrice: number;
        multiplier: number;
        priceMode: string;
        totalPrice: number;
        formattedCalculation: string;
      }> = [];

      for (const category of cfgData.categories) {
        const payloadKey = categoryIdToPayloadKey[category.id] || category.id;
        const selectedOptionPayload = selectionRecord[payloadKey] as
          | Record<string, unknown>
          | undefined;
        if (!selectedOptionPayload || !selectedOptionPayload.value) continue;

        // Find the selected option in the original client-locale config first,
        // so we can resolve its stable ID even if we are looking up configDataFr for Admin.
        const clientCategory = configData.categories.find(c => c.id === category.id);
        if (!clientCategory) continue;
        const clientOption = clientCategory.options.find(
          (o: any) => o.label === selectedOptionPayload.value || o.id === selectedOptionPayload.value
        );
        if (!clientOption) continue;

        // Find the same option inside current cfgData iteration (e.g. configDataFr) using option ID
        const targetCategory = cfgData.categories.find((c: any) => c.id === category.id);
        if (!targetCategory) continue;
        const targetOption = targetCategory.options.find((o: any) => o.id === clientOption.id);
        if (!targetOption) continue;

        const rawPrice = selectedSizeId === "60x200" ? (targetOption.price200 ?? targetOption.price160) : targetOption.price160;
        
        let multiplier = 1;
        let multiplierUnit = "";
        
        if (targetCategory.priceMode === "wall_m2") {
          multiplier = cfgData.perdhesa.mure_te_jashtme || 0;
          multiplierUnit = lang === "fr" ? " de murs" : lang === "en" ? " of walls" : lang === "de" ? " Wände" : " van muren";
        } else if (targetCategory.priceMode === "roof_m2") {
          multiplier = roofArea;
          multiplierUnit = lang === "fr" ? " de toiture" : lang === "en" ? " of roof" : lang === "de" ? " Dach" : " van dak";
        }

        const itemTotal = rawPrice * multiplier;

        let formattedCalculation = "";
        if (targetCategory.priceMode === "wall_m2" || targetCategory.priceMode === "roof_m2") {
          formattedCalculation = `${multiplier} m²${multiplierUnit} × ${euroFormatter.format(rawPrice)}/m²`;
        } else {
          formattedCalculation = lang === "fr" ? "Tarif forfaitaire" : lang === "en" ? "Flat rate" : lang === "de" ? "Pauschalpreis" : "Vaste prijs";
        }

        list.push({
          categoryLabel: targetCategory.label,
          optionLabel: targetOption.label,
          unitPrice: rawPrice,
          multiplier: multiplier,
          priceMode: targetCategory.priceMode || "fixed",
          totalPrice: itemTotal,
          formattedCalculation: formattedCalculation
        });
      }
      return list;
    };

    // Map house doc using configurator mapper (French locale for Admin)
    const configDataFr = locale === "fr"
      ? configData
      : mapHouseDocToConfiguratorData(houseDoc, globalOptions, undefined, "fr");

    if (!configDataFr) {
      return NextResponse.json(
        { success: false, error: "Failed to map configurator config in French." },
        { status: 500 }
      );
    }

    const clientOptionsList = getDetailedOptions(configData, clientLocaleKey);
    const adminOptionsList = getDetailedOptions(configDataFr, "fr");

    const buildOptionsHtml = (list: typeof clientOptionsList) => {
      return list.map(opt => `
        <tr style="border-bottom: 1px solid #F1F5F9;">
          <td style="padding: 14px 16px; font-size: 13.5px; font-weight: 600; color: #1E293B; vertical-align: top;">
            ${escapeHtml(opt.categoryLabel)}
          </td>
          <td style="padding: 14px 16px; font-size: 13px; color: #475569; vertical-align: top;">
            <div style="font-weight: 700; color: #1E293B; margin-bottom: 2px;">${escapeHtml(opt.optionLabel)}</div>
            <div style="font-size: 12px; color: #64748B;">${escapeHtml(opt.formattedCalculation)}</div>
          </td>
          <td align="right" style="padding: 14px 16px; font-size: 13.5px; font-weight: 700; color: #1E293B; vertical-align: top; width: 110px;">
            ${euroFormatter.format(opt.totalPrice)}
          </td>
        </tr>
      `).join("");
    };

    const clientOptionsRowsHtml = buildOptionsHtml(clientOptionsList);
    const adminOptionsRowsHtml = buildOptionsHtml(adminOptionsList);

    const formattedClientName = clientName.trim();
    const formattedClientPhone = clientPhone ? clientPhone.trim() : "";

    // HTML-escaped values for safe interpolation into email markup/attributes.
    const safeClientName = escapeHtml(formattedClientName);
    const safeClientEmail = escapeHtml(clientEmail);
    const safeClientPhone = escapeHtml(formattedClientPhone);
    const phoneHref = formattedClientPhone
      ? `tel:${encodeURIComponent(formattedClientPhone)}`
      : "#";
    const houseNameClean = sanitizeText(configData.name, 120);
    const sizeValueClean = sanitizeText(selectedSize.label || selectedSizeId, 40);
    const safeHouseName = escapeHtml(houseNameClean);
    const safeSizeValue = escapeHtml(sizeValueClean);
    const safeHouseImageUrl = escapeHtml(houseImageUrl);
    const safeDelivery = {
      streetAddress: escapeHtml(delivery.streetAddress),
      city: escapeHtml(delivery.city),
      zipCode: escapeHtml(delivery.zipCode),
      stateRegion: escapeHtml(delivery.stateRegion),
      country: escapeHtml(delivery.country),
      notes: escapeHtml(delivery.notes),
    };
    const adminAssemblyDescription =
      installationMode === "ossa"
        ? "Montage réalisé par Ossa Bois"
        : "Montage par le client ou une entreprise tierce — non pris en charge par Ossa Bois";

    // 1. Compile Admin Notification Email (info@ossaboisfrance.com) - STRICTLY IN FRENCH
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Administration - Nouveau Projet Ossa Bois</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background-color: #F1F5F9;
            color: #1E293B;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          table {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
          }
          img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
          }
        </style>
      </head>
      <body style="font-family: system-ui, -apple-system, sans-serif; background-color: #F1F5F9; color: #1E293B; margin: 0; padding: 20px 10px; -webkit-font-smoothing: antialiased;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #E2E8F0; margin: 0 auto;">
          
          <!-- Admin Red Warning Bar -->
          <tr>
            <td style="background-color: #DC2626; color: #FFFFFF; text-align: center; padding: 12px 24px; font-weight: 700; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase;">
              ADMINISTRATION &bull; NOUVELLE COMMANDE CONFIGURATEUR
            </td>
          </tr>

          <!-- Banner Header -->
          <tr>
            <td align="center" style="padding: 32px 24px; background-color: #FAFBFB; border-bottom: 1px solid #E2E8F0;">
              <span style="font-size: 22px; font-weight: 800; color: #5E6F4F; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 6px;">OSSA BOIS FRANCE</span>
              <span style="font-size: 15px; font-weight: 700; color: #1E293B; display: block; margin-bottom: 12px;">Fiche de Synthèse Projet Client</span>
              <div style="display: inline-block; padding: 6px 14px; background-color: #F1F5F9; border-radius: 9999px; color: #475569; font-size: 12px; font-weight: 600; letter-spacing: 0.5px;">Référence : ${orderRef}</div>
            </td>
          </tr>

          <!-- Action Center (Quick Links) -->
          <tr>
            <td style="padding: 24px 24px; background-color: #F8FAFC; border-bottom: 1px solid #E2E8F0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-size: 12px; font-weight: 700; color: #64748B; padding-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                    Actions rapides de contact :
                  </td>
                </tr>
                <tr>
                  <td>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="48%" align="center" style="background-color: #5E6F4F; border-radius: 6px;">
                          <a href="mailto:${safeClientEmail}?subject=Votre projet de construction Ossa Bois - Référence ${orderRef}" style="display: block; padding: 10px 4px; color: #FFFFFF; font-weight: 700; font-size: 12.5px; text-decoration: none; letter-spacing: 0.5px; text-align: center;">
                            📧 RÉPONDRE PAR EMAIL
                          </a>
                        </td>
                        <td width="4%"></td>
                        <td width="48%" align="center" style="background-color: #1E293B; border-radius: 6px;">
                          <a href="${phoneHref}" style="display: block; padding: 10px 4px; color: #FFFFFF; font-weight: 700; font-size: 12.5px; text-decoration: none; letter-spacing: 0.5px; text-align: center;">
                            📞 APPELER LE CLIENT
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Customer & Project Matrix -->
          <tr>
            <td style="padding: 24px 24px 16px 24px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px;">
                <tr>
                  <td style="border-bottom: 1px solid #E2E8F0; padding-bottom: 10px;">
                    <h3 style="font-size: 14px; font-weight: 800; color: #1E293B; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">Coordonnées & Terrain</h3>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 14px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13.5px; line-height: 1.6;">
                      <tr>
                        <td style="font-weight: 600; color: #64748B; width: 130px; vertical-align: top; padding-bottom: 6px;">Nom complet :</td>
                        <td style="font-weight: 700; color: #1E293B; vertical-align: top; padding-bottom: 6px;">${safeClientName}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #64748B; vertical-align: top; padding-bottom: 6px;">Adresse e-mail :</td>
                        <td style="font-weight: 700; color: #1E293B; vertical-align: top; padding-bottom: 6px;"><a href="mailto:${safeClientEmail}" style="color: #2563EB; text-decoration: none;">${safeClientEmail}</a></td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #64748B; vertical-align: top; padding-bottom: 6px;">Téléphone :</td>
                        <td style="font-weight: 700; color: #1E293B; vertical-align: top; padding-bottom: 6px;">${safeClientPhone || "Non communiqué"}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #64748B; vertical-align: top; padding-bottom: 6px;">Adresse chantier :</td>
                        <td style="font-weight: 700; color: #1E293B; vertical-align: top; padding-bottom: 6px;">
                          ${safeDelivery.streetAddress || "-"}<br/>
                          ${safeDelivery.zipCode || ""} ${safeDelivery.city || ""}<br/>
                          ${safeDelivery.stateRegion || "-"}, ${safeDelivery.country || "France"}
                        </td>
                      </tr>
                      ${delivery.notes ? `
                      <tr>
                        <td colspan="2" style="padding-top: 12px;">
                          <div style="background-color: #F8FAFC; border-radius: 6px; padding: 12px; border: 1px dashed #CBD5E1; font-style: italic; color: #475569; font-size: 13px;">
                            <strong>Notes du client :</strong> "${safeDelivery.notes}"
                          </div>
                        </td>
                      </tr>` : ""}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Surfaces block -->
          <tr>
            <td style="padding: 0 24px 16px 24px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAFBFB; border-radius: 8px; border: 1px solid #E2E8F0; padding: 16px;">
                <tr>
                  <td width="50%" style="vertical-align: top;">
                    <span style="font-size: 11px; color: #64748B; display: block; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Surface Habitable (Neto)</span>
                    <strong style="font-size: 15px; color: #1E293B;">${configDataFr.perdhesa.neto} m²</strong>
                  </td>
                  <td width="50%" style="vertical-align: top; padding-left: 16px; border-left: 1px solid #E2E8F0;">
                    <span style="font-size: 11px; color: #64748B; display: block; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Surface au sol (Bruto)</span>
                    <strong style="font-size: 15px; color: #1E293B;">${configDataFr.perdhesa.bruto} m²</strong>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" height="12"></td>
                </tr>
                <tr>
                  <td width="50%" style="vertical-align: top; border-top: 1px solid #E2E8F0; padding-top: 10px;">
                    <span style="font-size: 11px; color: #64748B; display: block; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Murs Extérieurs</span>
                    <strong style="font-size: 15px; color: #1E293B;">${configDataFr.perdhesa.mure_te_jashtme} m²</strong>
                  </td>
                  <td width="50%" style="vertical-align: top; padding-left: 16px; border-left: 1px solid #E2E8F0; border-top: 1px solid #E2E8F0; padding-top: 10px;">
                    <span style="font-size: 11px; color: #64748B; display: block; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Surface Toiture</span>
                    <strong style="font-size: 15px; color: #1E293B;">${roofArea} m²</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Dynamic Config Table -->
          <tr>
            <td style="padding: 0 24px 24px 24px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #F8FAFC; border-bottom: 1px solid #E2E8F0;">
                    <th align="left" style="padding: 12px 14px; font-size: 12.5px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Composant</th>
                    <th align="left" style="padding: 12px 14px; font-size: 12.5px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Choix technique (FR)</th>
                    <th align="right" style="padding: 12px 14px; font-size: 12.5px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; width: 110px;">Tarif</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #E2E8F0;">
                    <td style="padding: 12px 14px; font-size: 13px; font-weight: 600; color: #1E293B; vertical-align: top;">Base Structure</td>
                    <td style="padding: 12px 14px; font-size: 12.5px; color: #475569; vertical-align: top;">
                      <div style="font-weight: 700; color: #1E293B;">Modèle ${safeHouseName}</div>
                      <div style="font-size: 11.5px; color: #64748B;">Dimensions au sol : ${safeSizeValue}</div>
                    </td>
                    <td align="right" style="padding: 12px 14px; font-size: 13px; font-weight: 700; color: #1E293B; vertical-align: top;">
                      ${euroFormatter.format(serverBasePrice)}
                    </td>
                  </tr>
                  ${adminOptionsRowsHtml}
                  <tr style="border-bottom: 1px dashed #E2E8F0; background-color: #F8FAFC;">
                    <td style="padding: 12px 14px; font-size: 13px; font-weight: 600; color: #1E293B; vertical-align: top;">Transport</td>
                    <td style="padding: 12px 14px; font-size: 12.5px; color: #475569; vertical-align: top;">Livraison sur site : ${truckCount} camion(s) × 3 500 €</td>
                    <td align="right" style="padding: 12px 14px; font-size: 13px; font-weight: 700; color: #1E293B; vertical-align: top;">
                      ${euroFormatter.format(serverTransportCost)}
                    </td>
                  </tr>
                  <tr style="border-bottom: 1px dashed #E2E8F0; background-color: #F8FAFC;">
                    <td style="padding: 12px 14px; font-size: 13px; font-weight: 600; color: #1E293B; vertical-align: top;">Montage</td>
                    <td style="padding: 12px 14px; font-size: 12.5px; color: #475569; vertical-align: top;">${adminAssemblyDescription}</td>
                    <td align="right" style="padding: 12px 14px; font-size: 13px; font-weight: 700; color: #1E293B; vertical-align: top;">
                      ${euroFormatter.format(serverAssemblyCost)}
                    </td>
                  </tr>
                  <tr style="background-color: #FAFBFB;">
                    <td colspan="2" style="padding: 14px 14px; font-size: 13px; font-weight: 800; color: #1E293B; text-transform: uppercase;">Total validé serveur</td>
                    <td align="right" style="padding: 14px 14px; font-size: 18px; font-weight: 800; color: #DC2626;">
                      ${euroFormatter.format(total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAFBFB; padding: 20px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8;">
              Système de notification automatique configurateur &bull; Ossa Bois France.
            </td>
          </tr>

        </table>
      </body>
      </html>
    `;

    // 2. Compile Client Confirmation Email - TRANSLATED DYNAMICALLY
    const clientEmailSubject = l.subject.replace("{ref}", orderRef);
    const formattedGreeting = l.greeting.replace("{name}", safeClientName);
    const formattedIntro = l.intro.replace("{ref}", orderRef);
    const formattedBaseStructureDesc = l.baseStructureDesc.replace("{model}", safeHouseName).replace("{size}", safeSizeValue);
    const formattedTransportDesc = l.transportDesc.replace(
      "{trucks}",
      String(truckCount)
    );
    const formattedAssemblyDesc =
      installationMode === "ossa"
        ? l.assemblyOssaDesc
        : l.assemblyProfessionalDesc;
    const formattedStep2Desc = l.step2Desc.replace("{phone}", safeClientPhone || "...");

    const clientEmailHtml = `
      <!DOCTYPE html>
      <html lang="${clientLocaleKey}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${clientEmailSubject}</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background-color: #FAF9F6;
            color: #1E293B;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          table {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
          }
          img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
          }
        </style>
      </head>
      <body style="font-family: system-ui, -apple-system, sans-serif; background-color: #FAF9F6; color: #1E293B; margin: 0; padding: 20px 10px; -webkit-font-smoothing: antialiased;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 30px rgba(94, 111, 79, 0.08); border: 1px solid #EBE9E2; margin: 0 auto;">
          <!-- Brand Header Accent line -->
          <tr>
            <td height="5" style="background: linear-gradient(90deg, #5E6F4F 0%, #C5A880 50%, #5E6F4F 100%);"></td>
          </tr>
          
          <!-- Logo & Brand Header -->
          <tr>
            <td align="center" style="padding: 32px 24px; background-color: #FAF9F6; border-bottom: 1px solid #F1ECE3;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <span style="font-size: 24px; font-weight: 800; color: #5E6F4F; letter-spacing: 3px; text-transform: uppercase; display: block; margin: 0 0 2px 0;">OSSA BOIS</span>
                    <span style="font-size: 10px; font-weight: 500; color: #C5A880; letter-spacing: 1.5px; text-transform: uppercase; display: block; margin-bottom: 16px;">FRANCE &bull; ECO-STRUCTURES</span>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <div style="display: inline-block; padding: 6px 14px; background-color: #5E6F4F; border-radius: 9999px; color: #FFFFFF; font-size: 12px; font-weight: 600; letter-spacing: 0.5px;">${clientEmailSubject.split(" - ")[1] || orderRef}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Rendering Image -->
          <tr>
            <td style="padding: 24px 24px 16px 24px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="border-radius: 8px; overflow: hidden; border: 1px solid #EBE9E2;">
                    <img src="${safeHouseImageUrl}" alt="${safeHouseName || "Modèle"}" width="100%" style="width: 100%; height: auto; display: block; object-fit: cover;" />
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 20px;">
                    <h1 style="font-size: 20px; font-weight: 700; color: #1E293B; margin: 0 0 10px 0; letter-spacing: -0.3px; line-height: 1.2;">${l.title}</h1>
                    <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0;">
                      ${formattedGreeting}<br/><br/>
                      ${formattedIntro}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Technical metrics Block (Neto, Bruto, walls, roof) -->
          <tr>
            <td style="padding: 8px 24px 16px 24px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF9F6; border-radius: 8px; border: 1px solid #EBE9E2; padding: 16px;">
                <tr>
                  <td colspan="2" style="padding-bottom: 12px; border-bottom: 1px solid #EBE9E2;">
                    <h3 style="font-size: 13.5px; font-weight: 800; color: #5E6F4F; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">${l.dimensionsHeader}</h3>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px; width: 50%; vertical-align: top;">
                    <span style="font-size: 11px; color: #64748B; display: block; text-transform: uppercase; font-weight: 600;">${l.neto}</span>
                    <span style="font-size: 16px; font-weight: 700; color: #1E293B;">${configData.perdhesa.neto} m²</span>
                  </td>
                  <td style="padding-top: 12px; width: 50%; vertical-align: top; padding-left: 16px; border-left: 1px solid #EBE9E2;">
                    <span style="font-size: 11px; color: #64748B; display: block; text-transform: uppercase; font-weight: 600;">${l.bruto}</span>
                    <span style="font-size: 16px; font-weight: 700; color: #1E293B;">${configData.perdhesa.bruto} m²</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px; border-top: 1px solid #EBE9E2; width: 50%; vertical-align: top;">
                    <span style="font-size: 11px; color: #64748B; display: block; text-transform: uppercase; font-weight: 600;">${l.walls}</span>
                    <span style="font-size: 16px; font-weight: 700; color: #1E293B;">${configData.perdhesa.mure_te_jashtme} m²</span>
                  </td>
                  <td style="padding-top: 12px; border-top: 1px solid #EBE9E2; width: 50%; vertical-align: top; padding-left: 16px; border-left: 1px solid #EBE9E2;">
                    <span style="font-size: 11px; color: #64748B; display: block; text-transform: uppercase; font-weight: 600;">${l.roof}</span>
                    <span style="font-size: 16px; font-weight: 700; color: #1E293B;">${roofArea} m²</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Dynamic itemized pricing breakdown -->
          <tr>
            <td style="padding: 8px 24px 16px 24px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #FAFBFB; border-bottom: 1px solid #E5E7EB;">
                    <th align="left" style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">${l.componentHeader}</th>
                    <th align="left" style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">${l.choiceHeader}</th>
                    <th align="right" style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; width: 110px;">${l.priceHeader}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #F1F5F9;">
                    <td style="padding: 12px 14px; font-size: 13.5px; font-weight: 600; color: #1E293B; vertical-align: top;">
                      ${l.baseStructure}
                    </td>
                    <td style="padding: 12px 14px; font-size: 12.5px; color: #475569; vertical-align: top;">
                      <div style="font-weight: 700; color: #1E293B; margin-bottom: 2px;">${formattedBaseStructureDesc.split(" (")[0]}</div>
                      <div style="font-size: 11.5px; color: #64748B;">${formattedBaseStructureDesc.includes(" (") ? `(${formattedBaseStructureDesc.split(" (")[1]}` : ""}</div>
                    </td>
                    <td align="right" style="padding: 12px 14px; font-size: 13.5px; font-weight: 700; color: #1E293B; vertical-align: top;">
                      ${euroFormatter.format(serverBasePrice)}
                    </td>
                  </tr>
                  ${clientOptionsRowsHtml}
                  <tr style="border-bottom: 1px dashed #E5E7EB; background-color: #FAFBFB;">
                    <td style="padding: 12px 14px; font-size: 13.5px; font-weight: 600; color: #1E293B; vertical-align: top;">
                      ${l.transport}
                    </td>
                    <td style="padding: 12px 14px; font-size: 12.5px; color: #475569; vertical-align: top;">
                      ${formattedTransportDesc}
                    </td>
                    <td align="right" style="padding: 12px 14px; font-size: 13.5px; font-weight: 700; color: #1E293B; vertical-align: top;">
                      ${euroFormatter.format(serverTransportCost)}
                    </td>
                  </tr>
                  <tr style="border-bottom: 1px dashed #E5E7EB; background-color: #FAFBFB;">
                    <td style="padding: 12px 14px; font-size: 13.5px; font-weight: 600; color: #1E293B; vertical-align: top;">
                      ${l.assembly}
                    </td>
                    <td style="padding: 12px 14px; font-size: 12.5px; color: #475569; vertical-align: top;">
                      ${formattedAssemblyDesc}
                    </td>
                    <td align="right" style="padding: 12px 14px; font-size: 13.5px; font-weight: 700; color: #1E293B; vertical-align: top;">
                      ${euroFormatter.format(serverAssemblyCost)}
                    </td>
                  </tr>
                  <tr style="background-color: #FAF9F6;">
                    <td colspan="2" style="padding: 14px 14px; font-size: 13px; font-weight: 800; color: #1E293B; text-transform: uppercase;">
                      ${l.totalEstimation}
                    </td>
                    <td align="right" style="padding: 14px 14px; font-size: 18px; font-weight: 800; color: #5E6F4F;">
                      ${euroFormatter.format(total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Next Steps Roadmap -->
          <tr>
            <td style="padding: 16px 24px 28px 24px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <h3 style="font-size: 14px; font-weight: 800; color: #1E293B; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">${l.nextStepsHeader}</h3>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; line-height: 1.5; color: #475569;">
                      <tr>
                        <td style="vertical-align: top; font-weight: 700; color: #5E6F4F; width: 140px; padding-bottom: 10px;">${l.step1Title}</td>
                        <td style="padding-bottom: 10px;">${l.step1Desc}</td>
                      </tr>
                      <tr>
                        <td style="vertical-align: top; font-weight: 700; color: #5E6F4F; padding-bottom: 10px;">${l.step2Title}</td>
                        <td style="padding-bottom: 10px;">${formattedStep2Desc}</td>
                      </tr>
                      <tr>
                        <td style="vertical-align: top; font-weight: 700; color: #5E6F4F;">${l.step3Title}</td>
                        <td>${l.step3Desc}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAFBFB; padding: 32px 24px; text-align: center; font-size: 11.5px; color: #94A3B8; border-top: 1px solid #F1ECE3;">
              <div style="font-weight: 700; color: #5E6F4F; margin-bottom: 6px; font-size: 13px; letter-spacing: 0.5px; text-transform: uppercase;">Ossa Bois France</div>
              <div style="margin-bottom: 10px; font-weight: 500;">50 rue Chanzy, 28000 Chartres, France</div>
              <div style="margin-bottom: 10px;">
                Contact : <a href="mailto:info@ossaboisfrance.com" style="color: #5E6F4F; text-decoration: none; font-weight: 600;">info@ossaboisfrance.com</a> &bull; Site : <a href="https://ossaboisfrance.com" style="color: #5E6F4F; text-decoration: none; font-weight: 600;">ossaboisfrance.com</a>
              </div>
              <div style="font-style: italic; color: #CBD5E1; margin-top: 12px;">${l.footerText}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const toAdminEmail = getResendAdminEmail();
    const orderFromEmail = getResendOrderFromEmail();

    let adminEmailSent = false;
    let clientEmailSent = false;

    if (toAdminEmail) {
      const adminEmailResult = await sendResendMail({
        to: toAdminEmail,
        from: orderFromEmail,
        replyTo: clientEmail || undefined,
        subject: `[Nouveau Projet] Configuration de Maison ${houseNameClean} - Ref ${orderRef}`,
        html: adminEmailHtml,
        idempotencyKey: `checkout-admin/${orderRef}`,
      });
      adminEmailSent = adminEmailResult.ok;
      if (!adminEmailResult.ok) {
        console.error(`[API Checkout] Admin email failed for order ${orderRef}.`);
      }
    } else if (process.env.NODE_ENV === "production") {
      console.error("[API Checkout] RESEND_ADMIN_EMAIL missing in production.");
    }

    if (clientEmail) {
      const clientEmailResult = await sendResendMail({
        to: clientEmail,
        from: orderFromEmail,
        replyTo: toAdminEmail || undefined,
        subject: clientEmailSubject,
        html: clientEmailHtml,
        idempotencyKey: `checkout-client/${orderRef}`,
      });
      clientEmailSent = clientEmailResult.ok;
      if (!clientEmailResult.ok) {
        console.error(`[API Checkout] Client email failed for order ${orderRef}.`);
      }
    }

    if (!process.env.RESEND_API_KEY) {
      // Do NOT log customer PII (name/email/phone) — reference the order by ref
      // only. On Vercel these lines go to the platform log stream / Sentry.
      console.warn(
        `[API Checkout] RESEND_API_KEY missing — order ${orderRef} saved, emails NOT sent (total ${euroFormatter.format(total)}).`
      );
    } else if (adminEmailSent && clientEmailSent) {
      console.log(`[API Checkout] Emails processed for order ${orderRef}.`);
    }

    const notificationsSent = adminEmailSent && clientEmailSent;

    return NextResponse.json({
      success: true,
      orderRef,
      notificationsSent,
      message: notificationsSent
        ? "Order saved and notifications sent."
        : "Order saved, but one or more notifications could not be sent."
    });
  } catch (error: any) {
    // Log the detail server-side; return a generic message so internal details
    // (DB/driver/library internals) are never reflected to the client.
    console.error("[API Checkout Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process checkout request." },
      { status: 500 }
    );
  }
}
