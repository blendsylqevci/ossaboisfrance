import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getPayload, type Payload } from "payload";
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
import {
  escapeHtml,
  getResendAdminEmail,
  getResendOrderFromEmail,
  getResendReplyToEmail,
  sendResendMail,
} from "@/lib/resend-mail";
import { isValidEmail, sanitizeText } from "@/lib/form-utils";
import { uploadOrderScreenshotToMedia } from "@/lib/upload-order-screenshot";
import {
  isAcceptedCheckoutAgreementSnapshot,
  isCheckoutOrderReference,
  validateCheckoutAgreements,
  type AcceptedCheckoutAgreements,
} from "@/lib/checkout-legal";
import { generateOrderPdf } from "@/lib/order-pdf";
import { buildCheckoutAdminEmail, getOrderRequestContext } from "@/lib/checkout-admin-email";
import {
  checkoutEmailHtmlToText,
  CHECKOUT_PDF_CALLOUT_MARKER,
  finalizeCheckoutClientEmailHtml,
} from "@/lib/checkout-client-email";

const euroFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export const runtime = "nodejs";

type ExistingOrderRecord = {
  id?: unknown;
  selections?: unknown;
};

function submissionFingerprint(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex");
}

function storedSubmissionFingerprint(order: ExistingOrderRecord): string | null {
  if (!order.selections || typeof order.selections !== "object" || Array.isArray(order.selections)) {
    return null;
  }
  const value = (order.selections as Record<string, unknown>).submissionFingerprint;
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value) ? value : null;
}

function storedAgreements(
  order: ExistingOrderRecord,
  locale: Locale
): AcceptedCheckoutAgreements | null {
  if (!order.selections || typeof order.selections !== "object" || Array.isArray(order.selections)) {
    return null;
  }
  const value = (order.selections as Record<string, unknown>).agreements;
  return isAcceptedCheckoutAgreementSnapshot(value, locale) ? value : null;
}

async function findOrderByReference(
  payload: Payload,
  orderRef: string
): Promise<ExistingOrderRecord | null> {
  const result = await payload.find({
    collection: "orders",
    where: { orderRef: { equals: orderRef } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  });
  return (result.docs[0] as ExistingOrderRecord | undefined) ?? null;
}

function idempotencyConflictResponse(): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: "Cette référence appartient déjà à une autre demande.",
    },
    { status: 409 }
  );
}

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
      agreements: rawAgreements,
    } = body;
    if (rawLocale !== undefined && (typeof rawLocale !== "string" || !isLocale(rawLocale))) {
      return NextResponse.json(
        { success: false, error: "Langue non prise en charge." },
        { status: 400 }
      );
    }
    const locale: Locale = rawLocale ?? "fr";
    const acceptedAgreements = validateCheckoutAgreements(rawAgreements, locale);
    if (!acceptedAgreements) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Les confirmations obligatoires doivent être acceptées avant l'envoi.",
        },
        { status: 400 }
      );
    }
    if (!selection || typeof selection !== "object" || Array.isArray(selection)) {
      return NextResponse.json(
        { success: false, error: "Configuration invalide." },
        { status: 400 }
      );
    }
    const selectionRecord = selection as Record<string, unknown>;

    // Sanitize + validate every client-provided value before it is persisted or
    // interpolated into transactional emails (prevents HTML/attribute injection).
    const orderRef =
      typeof body.orderRef === "string" ? body.orderRef.trim() : "";
    if (!isCheckoutOrderReference(orderRef)) {
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
      priceBasis,
      vatIncluded,
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
      priceBasis,
      vatIncluded,
      agreements: acceptedAgreements,
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

    const fingerprint = submissionFingerprint({
      locale,
      customer: {
        name: clientName,
        email: clientEmail.toLowerCase(),
        phone: clientPhone,
      },
      delivery,
      selection: {
        ...selectionForStorage,
        agreements: {
          shipping: acceptedAgreements.shipping,
          terms: acceptedAgreements.terms,
          urban: acceptedAgreements.urban,
          privacy: acceptedAgreements.privacy,
          version: acceptedAgreements.version,
          locale: acceptedAgreements.locale,
          textHash: acceptedAgreements.textHash,
          text: acceptedAgreements.text,
        },
      },
    });
    selectionForStorage.submissionFingerprint = fingerprint;

    let replayed = false;
    let orderDoc: ExistingOrderRecord;
    let agreementsForNotifications = acceptedAgreements;
    const existingOrder = await findOrderByReference(payload, orderRef);
    if (existingOrder) {
      if (storedSubmissionFingerprint(existingOrder) !== fingerprint) {
        return idempotencyConflictResponse();
      }
      const originalAgreements = storedAgreements(existingOrder, locale);
      if (!originalAgreements) {
        throw new Error("Stored checkout agreement snapshot is invalid.");
      }
      replayed = true;
      orderDoc = existingOrder;
      agreementsForNotifications = originalAgreements;
    } else {
      try {
        orderDoc = await payload.create({
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
      } catch (createError) {
        // Close the check-then-create race using the collection's unique orderRef.
        // A matching concurrent request reuses the same notification keys; an
        // unrelated create failure retains the normal error path.
        const concurrentOrder = await findOrderByReference(payload, orderRef);
        if (!concurrentOrder) throw createError;
        if (storedSubmissionFingerprint(concurrentOrder) !== fingerprint) {
          return idempotencyConflictResponse();
        }
        const originalAgreements = storedAgreements(concurrentOrder, locale);
        if (!originalAgreements) {
          throw new Error("Stored checkout agreement snapshot is invalid.");
        }
        replayed = true;
        orderDoc = concurrentOrder;
        agreementsForNotifications = originalAgreements;
      }
    }

    console.log(
      `[API Checkout] Order ${replayed ? "replayed" : "persisted"} with ID: ${String(orderDoc.id ?? "unknown")}`
    );

    const configuredSiteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      "https://ossaboisfrance.com";
    const siteOrigin = new URL(configuredSiteUrl).origin;
    let houseImageUrl = "";

    const base64Image = selectionRecord.currentImage;
    if (!replayed && base64Image && typeof base64Image === "string") {
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
      const defaultImage = `${siteOrigin}/images/houses/7 ambre.jpg`;
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
        preheader: "Votre demande Ossa Bois {ref} est bien enregistrée. Retrouvez votre configuration, l'estimation HT et les prochaines étapes.",
        greeting: "Bonjour {name},",
        intro: "Nous vous remercions chaleureusement d'avoir configuré votre future maison avec notre configurateur en ligne. Votre demande a bien été enregistrée sous la référence unique <strong>{ref}</strong>. Notre bureau d'études examine actuellement la faisabilité technique de votre projet.",
        dimensionsHeader: "Dimensions & Caractéristiques Structurelles",
        neto: "Surface Habitable (Neto)",
        bruto: "Surface au sol (Bruto)",
        walls: "Murs Extérieurs",
        roof: "Surface Toiture",
        componentHeader: "Composant",
        choiceHeader: "Choix sélectionné",
        priceHeader: "Tarif estimé HT",
        baseStructure: "Structure & Ossature Bois",
        baseStructureDesc: "Modèle {model} ({size})",
        transport: "Logistique & Transport",
        transportDesc: "Livraison sur site : {trucks} camion(s) × 3 500 € HT",
        assembly: "Montage",
        assemblyOssaDesc: "Montage réalisé par Ossa Bois",
        assemblyProfessionalDesc: "Montage réalisé par le client ou une entreprise tierce (non pris en charge par Ossa Bois)",
        totalEstimation: "Estimation globale du projet configuré (HT)",
        taxNotice: "Tous les montants affichés sont hors taxes (HT). La TVA n'est pas incluse et sera calculée dans le devis personnalisé.",
        requestSummary: "Récapitulatif de la demande",
        referenceLabel: "Référence projet",
        modelLabel: "Modèle et structure",
        deliveryLabel: "Adresse du projet",
        contactLabel: "Vos coordonnées",
        attachedPdf: "Votre récapitulatif PDF détaillé est joint à cet e-mail pour consultation et archivage.",
        replyPrompt: "Une question ou une précision à apporter ? Répondez directement à cet e-mail : votre message sera transmis à notre équipe projet.",
        replyCta: "Répondre à l'équipe projet",
        websiteCta: "Découvrir Ossa Bois",
        legalTitle: "Information importante",
        legalNotice: "Cette estimation automatique est non contractuelle et ne constitue ni un devis définitif, ni une facture, ni une acceptation du projet. Les prix, surfaces, délais, transport, montage, garanties, TVA applicable et conditions restent soumis à l'étude technique et au devis signé par les parties.",
        consentNotice: "Les confirmations de livraison, d'urbanisme, de conditions de vente et de traitement des données acceptées lors de l'envoi sont enregistrées avec votre demande et reproduites dans le récapitulatif PDF lorsqu'il est disponible.",
        nextStepsHeader: "Prochaines étapes de votre projet",
        step1Title: "Étape 1 : Bureau d'études",
        step1Desc: "Notre équipe technique lance l'étude de votre terrain et de l'accès au chantier. Un conseiller vous recontactera dans les meilleurs délais ouvrés.",
        step2Title: "Étape 2 : Entretien conseil",
        step2Desc: "Votre conseiller Ossa Bois vous accompagne pour valider les finitions. Vous pouvez joindre notre équipe au {phone}.",
        step3Title: "Étape 3 : Devis définitif",
        step3Desc: "Établissement du devis personnalisé avec les conditions contractuelles applicables.",
        footerText: "L'équipe Ossa Bois France reste à votre entière disposition pour donner vie à vos projets."
      },
      en: {
        subject: "Your Ossa Bois construction project - Reference {ref}",
        title: "Your timber frame house project",
        preheader: "Your Ossa Bois request {ref} has been recorded. Review your configuration, estimate excluding VAT and next steps.",
        greeting: "Hello {name},",
        intro: "Thank you for configuring your future home with our online configurator. Your request has been successfully registered under the unique reference <strong>{ref}</strong>. Our engineering office is currently reviewing the technical feasibility of your project.",
        dimensionsHeader: "Dimensions & Structural Specifications",
        neto: "Living Area (Neto)",
        bruto: "Footprint Area (Bruto)",
        walls: "Exterior Walls",
        roof: "Roof Area",
        componentHeader: "Component",
        choiceHeader: "Selected choice",
        priceHeader: "Estimated price excl. VAT",
        baseStructure: "Timber Frame Structure",
        baseStructureDesc: "Model {model} ({size})",
        transport: "Logistics & Shipping",
        transportDesc: "On-site delivery: {trucks} truck(s) × €3,500 excl. VAT",
        assembly: "Assembly",
        assemblyOssaDesc: "Assembly performed by Ossa Bois",
        assemblyProfessionalDesc: "Assembly performed by the client or a third-party company (not provided by Ossa Bois)",
        totalEstimation: "Configured project estimate excl. VAT",
        taxNotice: "All displayed amounts exclude VAT. Applicable VAT is not included and will be calculated in your personalized quotation.",
        requestSummary: "Request summary",
        referenceLabel: "Project reference",
        modelLabel: "Model and structure",
        deliveryLabel: "Project address",
        contactLabel: "Your contact details",
        attachedPdf: "Your detailed PDF summary is attached to this email for review and safekeeping.",
        replyPrompt: "Have a question or an important detail to add? Reply directly to this email and your message will reach our project team.",
        replyCta: "Reply to the project team",
        websiteCta: "Discover Ossa Bois",
        legalTitle: "Important information",
        legalNotice: "This automated estimate is non-binding and is not a final quotation, invoice or project acceptance. Prices, areas, lead times, transport, assembly, warranties, applicable VAT and terms remain subject to technical review and a quotation signed by both parties.",
        consentNotice: "The delivery, planning, sales-terms and data-processing confirmations accepted on submission are recorded with your request and reproduced in the PDF summary when available.",
        nextStepsHeader: "Next steps of your project",
        step1Title: "Step 1: Engineering Review",
        step1Desc: "Our technical team begins reviewing your site and access conditions. An advisor will contact you as soon as practicable during business days.",
        step2Title: "Step 2: Expert Consult",
        step2Desc: "Your Ossa Bois advisor will help you confirm the finishes. You can reach our team at {phone}.",
        step3Title: "Step 3: Final Quote",
        step3Desc: "Preparation of your personalized quotation with the applicable contractual terms.",
        footerText: "The Ossa Bois France team remains at your complete disposal to bring your projects to life."
      },
      de: {
        subject: "Ihr Ossa Bois Bauprojekt - Referenz {ref}",
        title: "Ihr Holzrahmenhaus-Projekt",
        preheader: "Ihre Ossa Bois Anfrage {ref} wurde erfasst. Hier finden Sie Konfiguration, Nettoschätzung und nächste Schritte.",
        greeting: "Hallo {name},",
        intro: "Vielen Dank, dass Sie Ihr zukünftiges Haus mit unserem Online-Konfigurator gestaltet haben. Ihre Anfrage wurde erfolgreich unter der eindeutigen Referenz <strong>{ref}</strong> registriert. Unser Planungsbüro prüft derzeit die technische Machbarkeit Ihres Projekts.",
        dimensionsHeader: "Abmessungen & Konstruktionsdaten",
        neto: "Wohnfläche (Netto)",
        bruto: "Grundfläche (Brutto)",
        walls: "Außenwände",
        roof: "Dachfläche",
        componentHeader: "Komponente",
        choiceHeader: "Ausgewählte Option",
        priceHeader: "Geschätzter Preis zzgl. MwSt.",
        baseStructure: "Holzrahmenstruktur & Tragwerk",
        baseStructureDesc: "Modell {model} ({size})",
        transport: "Logistik & Transport",
        transportDesc: "Lieferung zur Baustelle: {trucks} Lkw × 3.500 € zzgl. MwSt.",
        assembly: "Montage",
        assemblyOssaDesc: "Montage durch Ossa Bois",
        assemblyProfessionalDesc: "Montage durch den Kunden oder ein Drittunternehmen (nicht durch Ossa Bois)",
        totalEstimation: "Schätzung des konfigurierten Projekts (zzgl. MwSt.)",
        taxNotice: "Alle angezeigten Beträge sind Nettopreise zzgl. MwSt. Die MwSt. ist nicht enthalten und wird im persönlichen Angebot berechnet.",
        requestSummary: "Zusammenfassung der Anfrage",
        referenceLabel: "Projektreferenz",
        modelLabel: "Modell und Konstruktion",
        deliveryLabel: "Projektadresse",
        contactLabel: "Ihre Kontaktdaten",
        attachedPdf: "Ihre ausführliche PDF-Zusammenfassung ist dieser E-Mail zur Prüfung und Ablage beigefügt.",
        replyPrompt: "Haben Sie eine Frage oder möchten Sie etwas ergänzen? Antworten Sie direkt auf diese E-Mail; Ihre Nachricht erreicht unser Projektteam.",
        replyCta: "Dem Projektteam antworten",
        websiteCta: "Ossa Bois entdecken",
        legalTitle: "Wichtige Information",
        legalNotice: "Diese automatische Schätzung ist unverbindlich und stellt weder ein endgültiges Angebot noch eine Rechnung oder Projektannahme dar. Preise, Flächen, Fristen, Transport, Montage, Garantien, anwendbare MwSt. und Bedingungen bleiben der technischen Prüfung und einem von beiden Parteien unterzeichneten Angebot vorbehalten.",
        consentNotice: "Die bei der Übermittlung bestätigten Angaben zu Lieferung, Baurecht, Verkaufsbedingungen und Datenverarbeitung werden mit Ihrer Anfrage gespeichert und, sofern verfügbar, in der PDF-Zusammenfassung wiedergegeben.",
        nextStepsHeader: "Nächste Schritte Ihres Projekts",
        step1Title: "Schritt 1: Technische Prüfung",
        step1Desc: "Unser technisches Team beginnt mit der Prüfung Ihres Grundstücks und der Baustellenzufahrt. Ein Berater meldet sich schnellstmöglich an einem Werktag bei Ihnen.",
        step2Title: "Schritt 2: Beratungsgespräch",
        step2Desc: "Ihr Ossa Bois Berater begleitet Sie bei der Auswahl der Ausführung. Sie erreichen unser Team unter {phone}.",
        step3Title: "Schritt 3: Endgültiges Angebot",
        step3Desc: "Erstellung Ihres persönlichen Angebots mit den geltenden Vertragsbedingungen.",
        footerText: "Das Team von Ossa Bois France steht Ihnen jederzeit gerne zur Verfügung, um Ihre Träume zu verwirklichen."
      },
      nl: {
        subject: "Uw Ossa Bois bouwproject - Referentie {ref}",
        title: "Uw houtskeletbouw project",
        preheader: "Uw Ossa Bois-aanvraag {ref} is geregistreerd. Bekijk uw configuratie, raming excl. btw en de volgende stappen.",
        greeting: "Hallo {name},",
        intro: "Hartelijk dank voor het configureren van uw toekomstige woning met onze online configurator. Uw aanvraag is succesvol geregistreerd onder de unieke referentie <strong>{ref}</strong>. Ons studiebureau beoordeelt momenteel de technische haalbaarheid van uw project.",
        dimensionsHeader: "Afmetingen & Structurele Kenmerken",
        neto: "Woonoppervlakte (Neto)",
        bruto: "Grondoppervlakte (Bruto)",
        walls: "Buitenmuren",
        roof: "Dakoppervlakte",
        componentHeader: "Component",
        choiceHeader: "Geselecteerde optie",
        priceHeader: "Geschatte prijs excl. btw",
        baseStructure: "Houtskelet & Structuur",
        baseStructureDesc: "Model {model} ({size})",
        transport: "Logistiek & Transport",
        transportDesc: "Levering op de werf: {trucks} vrachtwagen(s) × € 3.500 excl. btw",
        assembly: "Montage",
        assemblyOssaDesc: "Montage uitgevoerd door Ossa Bois",
        assemblyProfessionalDesc: "Montage uitgevoerd door de klant of een extern bedrijf (niet door Ossa Bois)",
        totalEstimation: "Raming van het geconfigureerde project excl. btw",
        taxNotice: "Alle weergegeven bedragen zijn exclusief btw. De btw is niet inbegrepen en wordt berekend in uw persoonlijke offerte.",
        requestSummary: "Samenvatting van de aanvraag",
        referenceLabel: "Projectreferentie",
        modelLabel: "Model en constructie",
        deliveryLabel: "Projectadres",
        contactLabel: "Uw contactgegevens",
        attachedPdf: "Uw gedetailleerde PDF-overzicht is bij deze e-mail gevoegd om te bekijken en te bewaren.",
        replyPrompt: "Hebt u een vraag of wilt u iets aanvullen? Beantwoord deze e-mail rechtstreeks; uw bericht komt bij ons projectteam terecht.",
        replyCta: "Antwoord aan het projectteam",
        websiteCta: "Ontdek Ossa Bois",
        legalTitle: "Belangrijke informatie",
        legalNotice: "Deze automatische raming is vrijblijvend en vormt geen definitieve offerte, factuur of projectaanvaarding. Prijzen, oppervlakten, termijnen, transport, montage, garanties, toepasselijke btw en voorwaarden blijven onderworpen aan technische beoordeling en een door beide partijen ondertekende offerte.",
        consentNotice: "De bij verzending aanvaarde bevestigingen over levering, ruimtelijke ordening, verkoopvoorwaarden en gegevensverwerking worden bij uw aanvraag bewaard en, indien beschikbaar, opgenomen in het PDF-overzicht.",
        nextStepsHeader: "Volgende stappen van uw project",
        step1Title: "Stap 1: Technische Analyse",
        step1Desc: "Ons technisch team start de beoordeling van uw terrein en de bereikbaarheid. Een adviseur neemt zo spoedig mogelijk op een werkdag contact met u op.",
        step2Title: "Stap 2: Adviesgesprek",
        step2Desc: "Uw Ossa Bois adviseur helpt u de afwerking te bevestigen. U kunt ons team bereiken op {phone}.",
        step3Title: "Stap 3: Definitieve Offerte",
        step3Desc: "Opstellen van uw persoonlijke offerte met de toepasselijke contractvoorwaarden.",
        footerText: "Het team van Ossa Bois France staat volledig tot uw beschikking om uw project te realiseren."
      }
    };

    // Resolve client locale context (fallbacks to French if not defined/supported)
    const clientLocaleKey = locale;
    const l = clientEmailTranslations[clientLocaleKey];
    const clientMoneyFormatter = new Intl.NumberFormat(
      locale === "fr" ? "fr-FR" : locale === "de" ? "de-DE" : locale === "nl" ? "nl-NL" : "en-GB",
      { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }
    );

    // Helper function to build the options row details list for client or admin email
    const getDetailedOptions = (cfgData: typeof configData, lang: string) => {
      const optionMoneyFormatter =
        lang === clientLocaleKey ? clientMoneyFormatter : euroFormatter;
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
        const priceBasisSuffix =
          lang === "fr"
            ? " HT"
            : lang === "en"
              ? " excl. VAT"
              : lang === "de"
                ? " zzgl. MwSt."
                : " excl. btw";
        if (targetCategory.priceMode === "wall_m2" || targetCategory.priceMode === "roof_m2") {
          formattedCalculation = `${multiplier} m²${multiplierUnit} × ${optionMoneyFormatter.format(rawPrice)}${priceBasisSuffix}/m²`;
        } else {
          formattedCalculation = lang === "fr" ? "Tarif forfaitaire HT" : lang === "en" ? "Flat rate excl. VAT" : lang === "de" ? "Pauschalpreis zzgl. MwSt." : "Vaste prijs excl. btw";
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

    const buildOptionsHtml = (
      list: Array<(typeof clientOptionsList)[number] & { formattedTotal: string }>,
      showCalculation = true
    ) => {
      return list.map(opt => `
        <tr style="border-bottom: 1px solid #F1F5F9;">
          <td style="padding: 14px 16px; font-size: 13.5px; font-weight: 600; color: #1E293B; vertical-align: top;">
            ${escapeHtml(opt.categoryLabel)}
          </td>
          <td style="padding: 14px 16px; font-size: 13px; color: #475569; vertical-align: top;">
            <div style="font-weight: 700; color: #1E293B; margin-bottom: 2px;">${escapeHtml(opt.optionLabel)}</div>
            ${showCalculation ? `<div style="font-size: 12px; color: #64748B;">${escapeHtml(opt.formattedCalculation)}</div>` : ""}
          </td>
          <td align="right" style="padding: 14px 16px; font-size: 13.5px; font-weight: 700; color: #1E293B; vertical-align: top; width: 110px;">
            ${escapeHtml(opt.formattedTotal)}
          </td>
        </tr>
      `).join("");
    };

    const clientOptionsRowsHtml = buildOptionsHtml(
      clientOptionsList.map((option) => ({
        ...option,
        formattedTotal: clientMoneyFormatter.format(option.totalPrice),
      })),
      false
    );

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

    // Internal metadata is deliberately excluded from the client email, PDF and order database.
    const adminNotificationData = {
      reference: orderRef,
      submittedAt: agreementsForNotifications.acceptedAt,
      locale,
      customer: { name: formattedClientName, email: clientEmail, phone: formattedClientPhone },
      delivery,
      house: { name: houseNameClean, structure: sizeValueClean },
      surfaces: { net: configDataFr.perdhesa.neto, gross: configDataFr.perdhesa.bruto, walls: configDataFr.perdhesa.mure_te_jashtme, roof: roofArea },
      options: adminOptionsList,
      pricing: { base: serverBasePrice, options: serverOptionsTotal, subtotal: configurationSubtotal, trucks: truckCount, transport: serverTransportCost, assembly: serverAssemblyCost, total },
      assemblyDescription: adminAssemblyDescription,
      agreementVersion: agreementsForNotifications.version,
      request: getOrderRequestContext(req.headers),
    };

    // 2. Compile Client Confirmation Email - TRANSLATED DYNAMICALLY
    const clientEmailSubject = l.subject.replace("{ref}", orderRef);
    const formattedPreheader = l.preheader.replace("{ref}", orderRef);
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
    const formattedStep2Desc = l.step2Desc.replace("{phone}", '<a href="tel:+38343737000" style="color:#435139;font-weight:700;text-decoration:underline;white-space:nowrap;">+38343737000</a>');

    let clientEmailHtml = `
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
          .email-shell { width: 100% !important; max-width: 680px !important; }
          .email-pad { padding-left: 32px !important; padding-right: 32px !important; }
          .detail-table { table-layout: fixed; }
          .detail-table td, .detail-table th { overflow-wrap: anywhere; }
          .step-title { font-family: Georgia, 'Times New Roman', serif; }
          @media only screen and (max-width: 620px) {
            .email-pad { padding-left: 16px !important; padding-right: 16px !important; }
            .mobile-block { display: block !important; width: 100% !important; box-sizing: border-box !important; }
            .mobile-border { border-left: 0 !important; border-top: 1px solid #EBE9E2 !important; padding-left: 0 !important; }
            .mobile-hide { display: none !important; }
            .mobile-center { text-align: center !important; }
            .detail-table td, .detail-table th { padding: 10px 7px !important; font-size: 11px !important; }
            .detail-table td:last-child, .detail-table th:last-child { width: 82px !important; }
            .hero-title { font-size: 28px !important; }
          }
        </style>
      </head>
      <body style="font-family: Arial, Helvetica, sans-serif; background-color: #F0EEE8; color: #253126; margin: 0; padding: 32px 10px; -webkit-font-smoothing: antialiased;">
        <div style="display:none;font-size:1px;color:#FAF9F6;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${formattedPreheader}&#847; &zwnj; &nbsp; &#847; &zwnj; &nbsp;</div>
        <table role="presentation" class="email-shell" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:680px;background-color:#FFFFFF;border-radius:4px;overflow:hidden;border:1px solid #DEDCCF;margin:0 auto;">
          <!-- Brand Header Accent line -->
          <tr>
            <td height="4" bgcolor="#BAA47C" style="background-color:#BAA47C;"></td>
          </tr>
          
          <!-- Logo & Brand Header -->
          <tr>
            <td class="email-pad" align="left" bgcolor="#303F32" style="padding:32px;background-color:#303F32;border-bottom:1px solid #485440;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left">
                    <span style="font-family:Georgia,'Times New Roman',serif;font-size:29px;font-weight:400;color:#FFFFFF;letter-spacing:3px;display:block;margin:0 0 9px;">OSSA BOIS</span>
                    <span style="font-size:9px;font-weight:600;color:#D7C6A7;letter-spacing:2px;text-transform:uppercase;display:block;">FRANCE &bull; CONSTRUCTION BOIS</span>
                  </td>
                </tr>
                <tr>
                  <td align="left" style="padding-top:24px;">
                    <div style="border-top:1px solid #66715A;padding-top:16px;color:#E6E8DD;font-size:10px;letter-spacing:1px;text-transform:uppercase;">${l.referenceLabel} &nbsp; / &nbsp; ${orderRef}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Rendering Image -->
          <tr>
            <td class="email-pad" style="padding:32px 32px 24px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="overflow:hidden;background-color:#F0EEE8;">
                    <img src="${safeHouseImageUrl}" alt="${safeHouseName || "Modèle"}" width="100%" style="width: 100%; height: auto; display: block; object-fit: cover;" />
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 20px;">
                    <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#6C795D;margin:4px 0 12px;">${safeHouseName} &nbsp; / &nbsp; ${safeSizeValue}</div>
                    <h1 class="hero-title" style="font-family:Georgia,'Times New Roman',serif;font-size:34px;font-weight:400;color:#303F32;margin:0 0 20px;letter-spacing:-0.5px;line-height:1.18;">${l.title}</h1>
                    <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0;">
                      ${formattedGreeting}<br/><br/>
                      ${formattedIntro}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- At-a-glance transaction summary -->
          <tr>
            <td class="email-pad" style="padding: 8px 24px 16px 24px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#EEF2EA;border:1px solid #DDE5D8;border-radius:8px;">
                <tr>
                  <td colspan="2" style="padding:14px 16px 10px;font-size:12px;font-weight:800;color:#435139;text-transform:uppercase;letter-spacing:.7px;">${l.requestSummary}</td>
                </tr>
                <tr>
                  <td class="mobile-block" width="50%" style="padding:4px 16px 14px;vertical-align:top;">
                    <div style="font-size:10px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:.5px;">${l.referenceLabel}</div>
                    <div style="font-size:14px;font-weight:800;color:#1E293B;margin-top:4px;">${orderRef}</div>
                  </td>
                  <td class="mobile-block mobile-border" width="50%" style="padding:4px 16px 14px;vertical-align:top;border-left:1px solid #D5DFD0;">
                    <div style="font-size:10px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:.5px;">${l.modelLabel}</div>
                    <div style="font-size:13px;font-weight:700;color:#1E293B;margin-top:4px;">${safeHouseName}<br><span style="font-weight:500;color:#475569;">${safeSizeValue}</span></div>
                  </td>
                </tr>
                <tr>
                  <td class="mobile-block" width="50%" style="padding:12px 16px 16px;vertical-align:top;border-top:1px solid #D5DFD0;">
                    <div style="font-size:10px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:.5px;">${l.deliveryLabel}</div>
                    <div style="font-size:12.5px;line-height:1.5;color:#1E293B;margin-top:4px;">${safeDelivery.streetAddress}<br>${safeDelivery.zipCode} ${safeDelivery.city}<br>${safeDelivery.stateRegion}, ${safeDelivery.country}</div>
                  </td>
                  <td class="mobile-block mobile-border" width="50%" style="padding:12px 16px 16px;vertical-align:top;border-top:1px solid #D5DFD0;border-left:1px solid #D5DFD0;">
                    <div style="font-size:10px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:.5px;">${l.contactLabel}</div>
                    <div style="font-size:12.5px;line-height:1.6;color:#1E293B;margin-top:4px;"><a href="mailto:${safeClientEmail}" style="color:#435139;text-decoration:underline;">${safeClientEmail}</a><br><a href="${phoneHref}" style="color:#435139;text-decoration:underline;">${safeClientPhone}</a></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Technical metrics Block (Neto, Bruto, walls, roof) -->
          <tr>
            <td class="email-pad" style="padding: 8px 24px 16px 24px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#FFFFFF;border-top:1px solid #DEDCCF;border-bottom:1px solid #DEDCCF;">
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
            <td class="email-pad" style="padding: 8px 24px 16px 24px;">
              <table class="detail-table" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed;border:1px solid #DEDCCF;overflow:hidden;">
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
                      ${clientMoneyFormatter.format(serverBasePrice)}
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
                      ${clientMoneyFormatter.format(serverTransportCost)}
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
                      ${clientMoneyFormatter.format(serverAssemblyCost)}
                    </td>
                  </tr>
                  <tr style="background-color: #FAF9F6;">
                    <td colspan="2" style="padding: 14px 14px; font-size: 13px; font-weight: 800; color: #1E293B; text-transform: uppercase;">
                      ${l.totalEstimation}
                    </td>
                    <td align="right" style="padding: 14px 14px; font-size: 18px; font-weight: 800; color: #5E6F4F;">
                      ${clientMoneyFormatter.format(total)}
                    </td>
                  </tr>
                  <tr style="background-color: #FAF9F6;">
                    <td colspan="3" style="padding: 0 14px 14px; font-size: 11.5px; color: #64748B; text-align: right;">
                      ${l.taxNotice}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Inserted only after PDF generation succeeds. -->
          ${CHECKOUT_PDF_CALLOUT_MARKER}

          <!-- Next Steps Roadmap -->
          <tr>
            <td class="email-pad" style="padding: 16px 24px 22px 24px;">
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
                        <td style="padding:18px 20px;background-color:#F7F6F1;border-left:3px solid #BAA47C;">
                          <div class="step-title" style="font-family:Georgia,'Times New Roman',serif;font-size:19px;color:#303F32;margin-bottom:8px;">${l.step1Title}</div>
                          <div style="font-size:13px;line-height:1.7;color:#566151;">${l.step1Desc}</div>
                        </td>
                      </tr>
                      <tr><td height="10" style="font-size:1px;line-height:1px;">&nbsp;</td></tr>
                      <tr>
                        <td style="padding:18px 20px;background-color:#F7F6F1;border-left:3px solid #BAA47C;">
                          <div class="step-title" style="font-family:Georgia,'Times New Roman',serif;font-size:19px;color:#303F32;margin-bottom:8px;">${l.step2Title}</div>
                          <div style="font-size:13px;line-height:1.7;color:#566151;">${formattedStep2Desc}</div>
                        </td>
                      </tr>
                      <tr><td height="10" style="font-size:1px;line-height:1px;">&nbsp;</td></tr>
                      <tr>
                        <td style="padding:18px 20px;background-color:#F7F6F1;border-left:3px solid #BAA47C;">
                          <div class="step-title" style="font-family:Georgia,'Times New Roman',serif;font-size:19px;color:#303F32;margin-bottom:8px;">${l.step3Title}</div>
                          <div style="font-size:13px;line-height:1.7;color:#566151;">${l.step3Desc}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Reply CTA and legal clarity -->
          <tr>
            <td class="email-pad" style="padding:0 24px 28px 24px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding:20px;background-color:#FAF9F6;border:1px solid #EBE9E2;border-radius:8px;">
                    <div style="font-size:13px;line-height:1.6;color:#475569;margin:0 auto 16px;max-width:500px;">${l.replyPrompt}</div>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center"><tr>
                      <td bgcolor="#5E6F4F" style="border-radius:5px;"><a href="mailto:info@ossaboisfrance.com?subject=${encodeURIComponent(clientEmailSubject)}" style="display:inline-block;padding:12px 18px;font-size:13px;font-weight:800;color:#FFFFFF;text-decoration:none;border-radius:5px;">${l.replyCta}</a></td>
                      <td width="10" class="mobile-hide">&nbsp;</td>
                      <td class="mobile-hide" style="border:1px solid #5E6F4F;border-radius:5px;"><a href="https://ossaboisfrance.com/${clientLocaleKey}" style="display:inline-block;padding:11px 18px;font-size:13px;font-weight:800;color:#435139;text-decoration:none;border-radius:5px;">${l.websiteCta}</a></td>
                    </tr></table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:18px;font-size:10.5px;line-height:1.55;color:#64748B;">
                    <strong style="color:#475569;">${l.legalTitle}</strong><br>${l.legalNotice}<br><br>${l.consentNotice}
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
    const replyToEmail =
      getResendReplyToEmail() || toAdminEmail || "info@ossaboisfrance.com";

    let clientPdfAttachment:
      | { filename: string; content: string }
      | undefined;
    try {
      const pdfBuffer = await generateOrderPdf({
        locale,
        orderRef,
        submittedAt: agreementsForNotifications.acceptedAt,
        customer: {
          name: formattedClientName,
          email: clientEmail,
          phone: formattedClientPhone,
        },
        delivery,
        house: {
          name: houseNameClean,
          imageUrl: houseImageUrl,
          structureSize: sizeValueClean,
        },
        surfaces: {
          net: configData.perdhesa.neto,
          gross: configData.perdhesa.bruto,
          exteriorWalls: configData.perdhesa.mure_te_jashtme,
          roof: roofArea,
        },
        options: clientOptionsList.map((option) => ({
          categoryLabel: option.categoryLabel,
          optionLabel: option.optionLabel,
          calculation: option.formattedCalculation,
          totalPrice: option.totalPrice,
        })),
        pricing: {
          baseStructure: serverBasePrice,
          optionsTotal: serverOptionsTotal,
          configurationSubtotal,
          truckCount,
          transport: serverTransportCost,
          installationMode,
          assembly: serverAssemblyCost,
          grandTotal: total,
        },
        agreements: agreementsForNotifications,
        contactEmail: replyToEmail,
      });

      clientPdfAttachment = {
        filename: `Ossa-Bois-${orderRef}.pdf`,
        content: pdfBuffer.toString("base64"),
      };
    } catch (pdfError) {
      const reason =
        pdfError instanceof Error ? pdfError.message : "unknown PDF error";
      console.error(
        `[API Checkout] PDF generation failed for order ${orderRef}: ${reason}`
      );
    }

    clientEmailHtml = finalizeCheckoutClientEmailHtml(clientEmailHtml, {
      pdfAttached: Boolean(clientPdfAttachment),
      attachmentCopy: l.attachedPdf,
    });
    const clientEmailText = checkoutEmailHtmlToText(clientEmailHtml);

    let adminEmailSent = false;
    let clientEmailSent = false;

    if (toAdminEmail) {
      const adminEmailHtml = buildCheckoutAdminEmail({
        ...adminNotificationData,
        pdfAttached: Boolean(clientPdfAttachment),
      });
      const adminEmailResult = await sendResendMail({
        to: toAdminEmail,
        from: orderFromEmail,
        replyTo: clientEmail || undefined,
        subject: `[Nouveau Projet] Configuration de Maison ${houseNameClean} - Ref ${orderRef}`,
        html: adminEmailHtml,
        text: checkoutEmailHtmlToText(adminEmailHtml),
        attachments: clientPdfAttachment ? [clientPdfAttachment] : undefined,
        idempotencyKey: `checkout-admin/${orderRef}`,
        event: "checkout-admin",
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
        replyTo: replyToEmail,
        subject: clientEmailSubject,
        html: clientEmailHtml,
        text: clientEmailText,
        attachments: clientPdfAttachment ? [clientPdfAttachment] : undefined,
        idempotencyKey: `checkout-client/${orderRef}`,
        event: "checkout-client",
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
    const pdfAttached = clientEmailSent && Boolean(clientPdfAttachment);

    return NextResponse.json({
      success: true,
      replayed,
      orderRef,
      adminNotificationSent: adminEmailSent,
      clientConfirmationSent: clientEmailSent,
      pdfAttached,
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
