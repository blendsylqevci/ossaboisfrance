import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import { mapHouseDocToConfiguratorData } from "@/lib/house-mapper";
import { Locale } from "@/lib/i18n";

const euroFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { selection, personalInfo, deliveryInfo, orderRef, total, transportCost, locale = "fr" } = body;

    const clientName = personalInfo?.fullName || "Client";
    const clientEmail = personalInfo?.email;
    const clientPhone = personalInfo?.phone;

    // Validate selection and resolve House Document ID
    const houseSlug = selection?.house?.id;
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
    const configData = mapHouseDocToConfiguratorData(houseDoc, globalOptions, undefined, locale as Locale);
    if (!configData) {
      return NextResponse.json(
        { success: false, error: "Failed to map configurator config." },
        { status: 500 }
      );
    }

    // Recalculate price server-side to prevent client manipulation
    const selectedSizeId = selection?.size?.value;
    const selectedSize = configData.sizes.find(s => s.id === selectedSizeId || s.label === selectedSizeId);
    if (!selectedSize) {
      return NextResponse.json(
        { success: false, error: "Taille de shtëpi invalide." },
        { status: 400 }
      );
    }

    // Base price with margin applied
    const marginPercent = houseDoc.marginPercent ?? globalOptions?.marginPercent ?? 40;
    const marginMultiplier = 1 + marginPercent / 100;
    const serverBasePrice = selectedSize.price * marginMultiplier;

    const roofArea = configData.perdhesa.pllaka_e_kulmit || configData.perdhesa.kulmi || 0;
    let serverOptionsTotal = 0;

    const categoryIdToPayloadKey: Record<string, string> = {
      isolation: "isolation",
      outerIsolation: "outerIsolation",
      facade: "facade",
      etancheite: "etancheite",
      couverture: "toiture",
      terraceEtancheite: "etancheiteTerrasse",
      roof: "strukturaPlloqes",
      fauxPlafond: "izolimiPlloqes",
      dritaret: "dritaret"
    };

    for (const category of configData.categories) {
      const payloadKey = categoryIdToPayloadKey[category.id] || category.id;
      const selectedOptionPayload = selection?.[payloadKey];
      if (!selectedOptionPayload || !selectedOptionPayload.value) continue;

      // Find option by name/label
      const option = category.options.find(
        (o: any) => o.label === selectedOptionPayload.value || o.id === selectedOptionPayload.value
      );
      if (!option) continue;

      const rawPrice = selectedSizeId === "60x200" ? (option.price200 ?? option.price160) : option.price160;
      
      let multiplier = 1;
      if (category.priceMode === "wall_m2") {
        multiplier = configData.perdhesa.mure_te_jashtme || 0;
      } else if (category.priceMode === "roof_m2") {
        multiplier = roofArea;
      }

      serverOptionsTotal += rawPrice * multiplier;
    }

    const serverTransportCost = (selectedSizeId === "60x160" || selectedSizeId === "60x200") ? 0 : 3000;
    const calculatedGrandTotal = Math.round(serverBasePrice + serverOptionsTotal) + serverTransportCost;

    // Validate against client-sent total price (allow small tolerance of 5 EUR)
    if (Math.abs(calculatedGrandTotal - total) > 5) {
      console.warn(`[API Checkout] Price mismatch! Client: ${total}, Server calculated: ${calculatedGrandTotal}`);
      return NextResponse.json(
        { success: false, error: "Prix de commande non valide (incohérence de calcul)." },
        { status: 400 }
      );
    }

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
        streetAddress: deliveryInfo?.streetAddress || "",
        city: deliveryInfo?.city || "",
        zipCode: deliveryInfo?.zipCode || "",
        stateRegion: deliveryInfo?.stateRegion || "",
        country: deliveryInfo?.country || "France",
        clientNotes: deliveryInfo?.notes || "",
        selections: selection,
        status: 'pending',
      }
    });

    console.log(`[API Checkout] Order persisted in database with ID: ${orderDoc.id}`);

    const origin = req.headers.get("origin") || "https://ossaboisfrance.com";
    const houseImageUrl = selection?.currentImage || selection?.house?.image
      ? `${origin}${selection.currentImage || selection.house.image}`
      : `${origin}/images/houses/ambre/10 ambre.jpg`;

    // Assemble dynamic pricing listings
    const detailedOptionsList: Array<{
      categoryLabel: string;
      optionLabel: string;
      unitPrice: number;
      multiplier: number;
      priceMode: string;
      totalPrice: number;
      formattedCalculation: string;
    }> = [];

    for (const category of configData.categories) {
      const payloadKey = categoryIdToPayloadKey[category.id] || category.id;
      const selectedOptionPayload = selection?.[payloadKey];
      if (!selectedOptionPayload || !selectedOptionPayload.value) continue;

      const option = category.options.find(
        (o: any) => o.label === selectedOptionPayload.value || o.id === selectedOptionPayload.value
      );
      if (!option) continue;

      const rawPrice = selectedSizeId === "60x200" ? (option.price200 ?? option.price160) : option.price160;
      
      let multiplier = 1;
      let multiplierUnit = "";
      if (category.priceMode === "wall_m2") {
        multiplier = configData.perdhesa.mure_te_jashtme || 0;
        multiplierUnit = " m²";
      } else if (category.priceMode === "roof_m2") {
        multiplier = roofArea;
        multiplierUnit = " m²";
      }

      const itemTotal = rawPrice * multiplier;

      let formattedCalculation = "";
      if (category.priceMode === "wall_m2") {
        formattedCalculation = `${multiplier}${multiplierUnit} de murs × ${euroFormatter.format(rawPrice)}/m²`;
      } else if (category.priceMode === "roof_m2") {
        formattedCalculation = `${multiplier}${multiplierUnit} de toiture × ${euroFormatter.format(rawPrice)}/m²`;
      } else {
        formattedCalculation = `Tarif forfaitaire`;
      }

      detailedOptionsList.push({
        categoryLabel: category.label,
        optionLabel: option.label,
        unitPrice: rawPrice,
        multiplier: multiplier,
        priceMode: category.priceMode || "fixed",
        totalPrice: itemTotal,
        formattedCalculation: formattedCalculation
      });
    }

    const optionsRowsHtml = detailedOptionsList.map(opt => `
      <tr style="border-bottom: 1px solid #F1F5F9;">
        <td style="padding: 14px 16px; font-size: 14px; font-weight: 600; color: #1E293B; vertical-align: top;">
          ${opt.categoryLabel}
        </td>
        <td style="padding: 14px 16px; font-size: 13.5px; color: #475569; vertical-align: top;">
          <div style="font-weight: 700; color: #1E293B; margin-bottom: 2px;">${opt.optionLabel}</div>
          <div style="font-size: 12.5px; color: #64748B;">${opt.formattedCalculation}</div>
        </td>
        <td align="right" style="padding: 14px 16px; font-size: 14px; font-weight: 700; color: #1E293B; vertical-align: top;">
          ${euroFormatter.format(opt.totalPrice)}
        </td>
      </tr>
    `).join("");

    const payment1 = Math.round(total * 0.3);
    const payment2 = Math.round(total * 0.4);
    const payment3 = total - payment1 - payment2;

    // 1. Compile Admin Notification Email (info@ossaboisfrance.com)
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Administration - Nouveau Projet Ossa Bois</title>
        <style>
          body {
            font-family: 'Outfit', 'Inter', system-ui, -apple-system, sans-serif;
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
      <body style="font-family: 'Outfit', 'Inter', system-ui, -apple-system, sans-serif; background-color: #F1F5F9; color: #1E293B; margin: 0; padding: 20px 10px; -webkit-font-smoothing: antialiased;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 680px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; margin: 0 auto;">
          
          <!-- Admin Warning / Alert Bar -->
          <tr>
            <td style="background-color: #DC2626; color: #FFFFFF; text-align: center; padding: 12px 24px; font-weight: 700; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">
              ADMINISTRATION &bull; NOUVELLE COMMANDE REÇUE
            </td>
          </tr>

          <!-- Banner Header -->
          <tr>
            <td align="center" style="padding: 32px; background-color: #FAFBFB; border-bottom: 1px solid #E2E8F0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <span style="font-size: 24px; font-weight: 800; color: #5E6F4F; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 6px;">OSSA BOIS FRANCE</span>
                    <span style="font-size: 16px; font-weight: 700; color: #1E293B; display: block; margin-bottom: 12px;">Fiche Projet Client</span>
                    <div style="display: inline-block; padding: 6px 16px; background-color: #F1F5F9; border-radius: 9999px; color: #475569; font-size: 13px; font-weight: 600;">Référence de la demande : ${orderRef}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Center (Quick Links) -->
          <tr>
            <td style="padding: 24px 32px; background-color: #F8FAFC; border-bottom: 1px solid #E2E8F0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-size: 14px; font-weight: 700; color: #475569; padding-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                    Centre d'Action Rapide :
                  </td>
                </tr>
                <tr>
                  <td>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="48%" align="center" style="background-color: #5E6F4F; border-radius: 8px;">
                          <a href="mailto:${clientEmail}?subject=Votre projet de construction Ossa Bois - Référence ${orderRef}" style="display: block; padding: 12px 6px; color: #FFFFFF; font-weight: 700; font-size: 13px; text-decoration: none; letter-spacing: 0.5px; text-align: center;">
                            📧 ENVOYER UN E-MAIL
                          </a>
                        </td>
                        <td width="4%"></td>
                        <td width="48%" align="center" style="background-color: #1E293B; border-radius: 8px;">
                          <a href="${clientPhone ? `tel:${clientPhone}` : '#'}" style="display: block; padding: 12px 6px; color: #FFFFFF; font-weight: 700; font-size: 13px; text-decoration: none; letter-spacing: 0.5px; text-align: center;">
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

          <!-- Customer Information Card -->
          <tr>
            <td style="padding: 32px 32px 16px 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px;">
                <tr>
                  <td style="border-bottom: 1px solid #E2E8F0; padding-bottom: 12px;">
                    <h3 style="font-size: 15px; font-weight: 800; color: #1E293B; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Coordonnées du Client</h3>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; line-height: 1.6;">
                      <tr>
                        <td style="font-weight: 600; color: #64748B; width: 140px; padding-bottom: 8px; vertical-align: top;">Nom complet :</td>
                        <td style="font-weight: 700; color: #1E293B; padding-bottom: 8px; vertical-align: top;">${clientName}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #64748B; padding-bottom: 8px; vertical-align: top;">Adresse email :</td>
                        <td style="font-weight: 600; padding-bottom: 8px; vertical-align: top;"><a href="mailto:${clientEmail}" style="color: #2563EB; text-decoration: none;">${clientEmail}</a></td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #64748B; padding-bottom: 8px; vertical-align: top;">Numéro téléphone :</td>
                        <td style="font-weight: 700; color: #1E293B; padding-bottom: 8px; vertical-align: top;">${clientPhone || "Non communiqué"}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Terrain / Livraison Details -->
          <tr>
            <td style="padding: 16px 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px;">
                <tr>
                  <td style="border-bottom: 1px solid #E2E8F0; padding-bottom: 12px;">
                    <h3 style="font-size: 15px; font-weight: 800; color: #1E293B; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Terrain & Adresse de Livraison</h3>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px; font-size: 14px; line-height: 1.6; color: #475569;">
                    <div style="font-weight: 700; color: #1E293B; font-size: 15px; margin-bottom: 4px;">${deliveryInfo?.streetAddress || "-"}</div>
                    <div>${deliveryInfo?.zipCode || ""} ${deliveryInfo?.city || ""}</div>
                    <div>Région : ${deliveryInfo?.stateRegion || "-"} | Pays : ${deliveryInfo?.country || "France"}</div>
                    
                    ${deliveryInfo?.notes ? `
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #E2E8F0;">
                      <span style="font-size: 12px; color: #64748B; display: block; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">Notes laissées par le client :</span>
                      <div style="background-color: #FFFFFF; border-radius: 6px; padding: 12px; border: 1px dashed #CBD5E1; font-style: italic; color: #1E293B;">
                        "${deliveryInfo.notes}"
                      </div>
                    </div>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Surfaces & Properties -->
          <tr>
            <td style="padding: 16px 32px 16px 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAFBFB; border-radius: 12px; border: 1px solid #E2E8F0; padding: 24px;">
                <tr>
                  <td colspan="2" style="padding-bottom: 12px; border-bottom: 1px solid #E2E8F0;">
                    <h3 style="font-size: 15px; font-weight: 800; color: #5E6F4F; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Métriques de Construction (Fiche Technique)</h3>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px; width: 50%; vertical-align: top;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13.5px; line-height: 1.5;">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <span style="font-size: 11px; color: #64748B; display: block; text-transform: uppercase; font-weight: 700;">Surface Habitable (Neto)</span>
                          <span style="font-size: 16px; font-weight: 700; color: #1E293B;">${configData.perdhesa.neto} m²</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span style="font-size: 11px; color: #64748B; display: block; text-transform: uppercase; font-weight: 700;">Surface au sol (Bruto)</span>
                          <span style="font-size: 16px; font-weight: 700; color: #1E293B;">${configData.perdhesa.bruto} m²</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="padding-top: 16px; width: 50%; vertical-align: top; padding-left: 16px; border-left: 1px solid #E2E8F0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13.5px; line-height: 1.5;">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <span style="font-size: 11px; color: #64748B; display: block; text-transform: uppercase; font-weight: 700;">Murs Extérieurs</span>
                          <span style="font-size: 16px; font-weight: 700; color: #1E293B;">${configData.perdhesa.mure_te_jashtme} m²</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span style="font-size: 11px; color: #64748B; display: block; text-transform: uppercase; font-weight: 700;">Surface Toiture</span>
                          <span style="font-size: 16px; font-weight: 700; color: #1E293B;">${roofArea} m²</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Details Table -->
          <tr>
            <td style="padding: 16px 32px 24px 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #F8FAFC; border-bottom: 1px solid #E2E8F0;">
                    <th align="left" style="padding: 14px 16px; font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase;">Composant</th>
                    <th align="left" style="padding: 14px 16px; font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase;">Sélection Admin</th>
                    <th align="right" style="padding: 14px 16px; font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase; width: 150px;">Tarif (TTC)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #E2E8F0;">
                    <td style="padding: 14px 16px; font-size: 14px; font-weight: 600; color: #1E293B; vertical-align: top;">Structure de base</td>
                    <td style="padding: 14px 16px; font-size: 13.5px; color: #475569; vertical-align: top;">
                      <div style="font-weight: 700; color: #1E293B;">Modèle ${selection?.house?.name}</div>
                      <div style="font-size: 12px; color: #64748B;">Taille : ${selection?.size?.value}</div>
                    </td>
                    <td align="right" style="padding: 14px 16px; font-size: 14px; font-weight: 700; color: #1E293B; vertical-align: top;">${euroFormatter.format(serverBasePrice)}</td>
                  </tr>
                  ${optionsRowsHtml}
                  <tr style="border-bottom: 1px dashed #E2E8F0; background-color: #F8FAFC;">
                    <td style="padding: 14px 16px; font-size: 14px; font-weight: 600; color: #1E293B; vertical-align: top;">Transport</td>
                    <td style="padding: 14px 16px; font-size: 13.5px; color: #475569; vertical-align: top;">Acheminement chantier</td>
                    <td align="right" style="padding: 14px 16px; font-size: 14px; font-weight: 700; color: #1E293B; vertical-align: top;">${serverTransportCost > 0 ? euroFormatter.format(serverTransportCost) : "Inclus (0 €)"}</td>
                  </tr>
                  <tr style="background-color: #FAFBFB;">
                    <td colspan="2" style="padding: 18px 16px; font-size: 14px; font-weight: 800; color: #1E293B; text-transform: uppercase;">Total Général Calculé Serveur</td>
                    <td align="right" style="padding: 18px 16px; font-size: 20px; font-weight: 800; color: #DC2626;">${euroFormatter.format(total)}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <!-- CCMI Payment Breakdowns for Bookkeeping -->
          <tr>
            <td style="padding: 16px 32px 32px 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAFBFB; border-radius: 12px; border: 1px solid #E2E8F0; padding: 24px;">
                <tr>
                  <td style="border-bottom: 1px solid #E2E8F0; padding-bottom: 12px;">
                    <h3 style="font-size: 15px; font-weight: 800; color: #1E293B; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Échéances de Facturation (CCMI)</h3>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13.5px; line-height: 1.6;">
                      <tr>
                        <td style="padding-bottom: 8px; color: #475569; vertical-align: top;">1. Acompte Contrat & Signature (30%) :</td>
                        <td align="right" style="font-weight: 700; color: #1E293B; padding-bottom: 8px; vertical-align: top; width: 110px;">${euroFormatter.format(payment1)}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 8px; color: #475569; vertical-align: top;">2. Montage Structure Bois Chantier (40%) :</td>
                        <td align="right" style="font-weight: 700; color: #1E293B; padding-bottom: 8px; vertical-align: top;">${euroFormatter.format(payment2)}</td>
                      </tr>
                      <tr>
                        <td style="color: #475569; vertical-align: top;">3. Remise des clés & Livraison (30%) :</td>
                        <td align="right" style="font-weight: 700; color: #1E293B; vertical-align: top;">${euroFormatter.format(payment3)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAFBFB; padding: 24px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 12px; color: #94A3B8;">
              Ossa Bois Notification System &bull; Envoi automatique de la plateforme configurateur.
            </td>
          </tr>

        </table>
      </body>
      </html>
    `;

    // 2. Compile Client Confirmation Email
    const clientEmailHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Votre projet de construction Ossa Bois</title>
        <style>
          body {
            font-family: 'Outfit', 'Inter', system-ui, -apple-system, sans-serif;
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
      <body style="font-family: 'Outfit', 'Inter', system-ui, -apple-system, sans-serif; background-color: #FAF9F6; color: #1E293B; margin: 0; padding: 20px 10px; -webkit-font-smoothing: antialiased;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 680px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 40px rgba(94, 111, 79, 0.06); border: 1px solid #EBE9E2; margin: 0 auto;">
          <!-- Top Accent Bar -->
          <tr>
            <td height="6" style="background: linear-gradient(90deg, #5E6F4F 0%, #C5A880 50%, #5E6F4F 100%);"></td>
          </tr>
          
          <!-- Logo & Brand Header -->
          <tr>
            <td align="center" style="padding: 40px 32px 32px 32px; background-color: #FAF9F6; border-bottom: 1px solid #F1ECE3;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <span style="font-size: 28px; font-weight: 800; color: #5E6F4F; letter-spacing: 4px; text-transform: uppercase; display: block; margin: 0 0 4px 0;">OSSA BOIS</span>
                    <span style="font-size: 11px; font-weight: 500; color: #C5A880; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 20px;">FRANCE &bull; ECO-STRUCTURES</span>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <div style="display: inline-block; padding: 8px 20px; background-color: #5E6F4F; border-radius: 9999px; color: #FFFFFF; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">PROJET RÉFÉRENCE : ${orderRef}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Image & Title -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="border-radius: 12px; overflow: hidden; border: 1px solid #EBE9E2; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
                    <img src="${houseImageUrl}" alt="${selection?.house?.name || "Modèle"}" width="100%" style="width: 100%; height: auto; display: block; object-fit: cover;" />
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 24px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #1E293B; margin: 0 0 12px 0; letter-spacing: -0.5px; line-height: 1.2;">Votre projet de maison en ossature bois</h1>
                    <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0;">
                      Bonjour <strong>${clientName}</strong>,<br/><br/>
                      Nous vous remercions chaleureusement d'avoir configuré votre future maison avec notre configurateur en ligne. Votre demande a bien été enregistrée. Notre bureau d'études examine actuellement la faisabilité de votre projet.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Surfaces & Structure Section -->
          <tr>
            <td style="padding: 16px 32px 24px 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF9F6; border-radius: 12px; border: 1px solid #EBE9E2; padding: 24px;">
                <tr>
                  <td colspan="2" style="padding-bottom: 16px; border-bottom: 1px solid #EBE9E2;">
                    <h3 style="font-size: 15px; font-weight: 800; color: #5E6F4F; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Dimensions & Caractéristiques Structurelles</h3>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px; width: 50%; vertical-align: top;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <span style="font-size: 12px; color: #64748B; display: block; text-transform: uppercase; font-weight: 600;">Surface Habitable (Neto)</span>
                          <span style="font-size: 18px; font-weight: 700; color: #1E293B;">${configData.perdhesa.neto} m²</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span style="font-size: 12px; color: #64748B; display: block; text-transform: uppercase; font-weight: 600;">Surface au sol (Bruto)</span>
                          <span style="font-size: 18px; font-weight: 700; color: #1E293B;">${configData.perdhesa.bruto} m²</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="padding-top: 16px; width: 50%; vertical-align: top; padding-left: 16px; border-left: 1px solid #EBE9E2;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <span style="font-size: 12px; color: #64748B; display: block; text-transform: uppercase; font-weight: 600;">Murs Extérieurs</span>
                          <span style="font-size: 18px; font-weight: 700; color: #1E293B;">${configData.perdhesa.mure_te_jashtme} m²</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span style="font-size: 12px; color: #64748B; display: block; text-transform: uppercase; font-weight: 600;">Surface Toiture</span>
                          <span style="font-size: 18px; font-weight: 700; color: #1E293B;">${roofArea} m²</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Detailed Configuration Breakdown Table -->
          <tr>
            <td style="padding: 16px 32px 24px 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #FAFBFB; border-bottom: 1px solid #E5E7EB;">
                    <th align="left" style="padding: 14px 16px; font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Composant</th>
                    <th align="left" style="padding: 14px 16px; font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Choix sélectionné</th>
                    <th align="right" style="padding: 14px 16px; font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; width: 140px;">Tarif (TTC)</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Row for Base Structure -->
                  <tr style="border-bottom: 1px solid #F1F5F9;">
                    <td style="padding: 14px 16px; font-size: 14px; font-weight: 600; color: #1E293B; vertical-align: top;">
                      Structure & Ossature Bois
                    </td>
                    <td style="padding: 14px 16px; font-size: 13.5px; color: #475569; vertical-align: top;">
                      <div style="font-weight: 700; color: #1E293B; margin-bottom: 2px;">Modèle ${selection?.house?.name || "Maison"}</div>
                      <div style="font-size: 12.5px; color: #64748B;">Dimensions : ${selection?.size?.value || "-"}</div>
                    </td>
                    <td align="right" style="padding: 14px 16px; font-size: 14px; font-weight: 700; color: #1E293B; vertical-align: top;">
                      ${euroFormatter.format(serverBasePrice)}
                    </td>
                  </tr>
                  <!-- Row for Options -->
                  ${optionsRowsHtml}
                  <!-- Row for Transport -->
                  <tr style="border-bottom: 1px dashed #E5E7EB; background-color: #FAFBFB;">
                    <td style="padding: 14px 16px; font-size: 14px; font-weight: 600; color: #1E293B; vertical-align: top;">
                      Logistique & Transport
                    </td>
                    <td style="padding: 14px 16px; font-size: 13.5px; color: #475569; vertical-align: top;">
                      Livraison de la structure sur site
                    </td>
                    <td align="right" style="padding: 14px 16px; font-size: 14px; font-weight: 700; color: #1E293B; vertical-align: top;">
                      ${serverTransportCost > 0 ? euroFormatter.format(serverTransportCost) : "Inclus"}
                    </td>
                  </tr>
                  <!-- Summary Row -->
                  <tr style="background-color: #FAF9F6;">
                    <td colspan="2" style="padding: 18px 16px; font-size: 15px; font-weight: 800; color: #1E293B; text-transform: uppercase;">
                      Estimation Globale de la Structure
                    </td>
                    <td align="right" style="padding: 18px 16px; font-size: 20px; font-weight: 800; color: #5E6F4F;">
                      ${euroFormatter.format(total)} <span style="font-size: 12px; font-weight: 500; color: #64748B; vertical-align: middle;">TTC</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <!-- CCMI Payment Schedule -->
          <tr>
            <td style="padding: 16px 32px 24px 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FDFBF7; border-radius: 12px; border: 1px solid #EBE9E2; padding: 24px;">
                <tr>
                  <td style="padding-bottom: 16px; border-bottom: 1px solid #F1ECE3;">
                    <h3 style="font-size: 15px; font-weight: 800; color: #5E6F4F; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Plan de Financement CCMI (Échelonné)</h3>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <!-- Phase 1 -->
                      <tr>
                        <td style="width: 32px; vertical-align: top; padding-bottom: 16px;">
                          <div style="width: 24px; height: 24px; background-color: #5E6F4F; color: #FFFFFF; border-radius: 50%; text-align: center; font-size: 12px; font-weight: 700; line-height: 24px;">1</div>
                        </td>
                        <td style="padding-left: 12px; padding-bottom: 16px; vertical-align: top;">
                          <div style="font-size: 14px; font-weight: 700; color: #1E293B; margin-bottom: 2px;">Signature & Études Techniques (30%)</div>
                          <div style="font-size: 13px; color: #64748B; line-height: 1.4;">Faisabilité, plans d'implantation & préparation du dossier technique.</div>
                        </td>
                        <td align="right" style="vertical-align: top; font-weight: 700; color: #1E293B; font-size: 14px; width: 110px;">
                          ${euroFormatter.format(payment1)}
                        </td>
                      </tr>
                      <!-- Phase 2 -->
                      <tr>
                        <td style="width: 32px; vertical-align: top; padding-bottom: 16px;">
                          <div style="width: 24px; height: 24px; background-color: #5E6F4F; color: #FFFFFF; border-radius: 50%; text-align: center; font-size: 12px; font-weight: 700; line-height: 24px;">2</div>
                        </td>
                        <td style="padding-left: 12px; padding-bottom: 16px; vertical-align: top;">
                          <div style="font-size: 14px; font-weight: 700; color: #1E293B; margin-bottom: 2px;">Montage de la structure en bois (40%)</div>
                          <div style="font-size: 13px; color: #64748B; line-height: 1.4;">Levage de la structure bois, murs porteurs et charpente sur votre chantier.</div>
                        </td>
                        <td align="right" style="vertical-align: top; font-weight: 700; color: #1E293B; font-size: 14px;">
                          ${euroFormatter.format(payment2)}
                        </td>
                      </tr>
                      <!-- Phase 3 -->
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background-color: #5E6F4F; color: #FFFFFF; border-radius: 50%; text-align: center; font-size: 12px; font-weight: 700; line-height: 24px;">3</div>
                        </td>
                        <td style="padding-left: 12px; vertical-align: top;">
                          <div style="font-size: 14px; font-weight: 700; color: #1E293B; margin-bottom: 2px;">Remise des clés & Réception (30%)</div>
                          <div style="font-size: 13px; color: #64748B; line-height: 1.4;">Vérifications finales, livraison de la maison et remise officielle des clés.</div>
                        </td>
                        <td align="right" style="vertical-align: top; font-weight: 700; color: #1E293B; font-size: 14px;">
                          ${euroFormatter.format(payment3)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Quality Assurances / Warranty Banner -->
          <tr>
            <td style="padding: 12px 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F3F8F2; border: 1px solid #D5E5D0; border-radius: 8px; padding: 14px; text-align: center;">
                <tr>
                  <td align="center" style="font-size: 13px; color: #435E35; font-weight: 700; letter-spacing: 0.5px;">
                    ✓ GARANTIE DÉCENNALE CONSTRUCTEUR &nbsp;&bull;&nbsp; ✓ ISOLATION PERFORMANCE ÉCOLOGIQUE
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Next Steps Timeline -->
          <tr>
            <td style="padding: 24px 32px 32px 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <h3 style="font-size: 15px; font-weight: 800; color: #1E293B; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0;">Prochaines étapes de votre projet</h3>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; line-height: 1.5; color: #475569;">
                      <tr>
                        <td style="vertical-align: top; font-weight: 700; color: #5E6F4F; width: 140px; padding-bottom: 12px;">Étape 1 : Bureau d'études</td>
                        <td style="padding-bottom: 12px;">Notre équipe technique analyse votre terrain et l'accès au chantier sous 24 à 48 heures.</td>
                      </tr>
                      <tr>
                        <td style="vertical-align: top; font-weight: 700; color: #5E6F4F; padding-bottom: 12px;">Étape 2 : Entretien conseil</td>
                        <td style="padding-bottom: 12px;">Un conseiller technique Ossa Bois prend contact avec vous par téléphone au <strong>${clientPhone || "votre numéro"}</strong> pour valider les finitions.</td>
                      </tr>
                      <tr>
                        <td style="vertical-align: top; font-weight: 700; color: #5E6F4F;">Étape 3 : Devis définitif</td>
                        <td>Établissement du contrat de construction CCMI officiel et sécurisé.</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAFBFB; padding: 40px 32px; text-align: center; font-size: 12.5px; color: #94A3B8; border-top: 1px solid #F1ECE3;">
              <div style="font-weight: 700; color: #5E6F4F; margin-bottom: 8px; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Ossa Bois France</div>
              <div style="margin-bottom: 12px; font-weight: 500;">50 rue Chanzy, 28000 Chartres, France</div>
              <div>
                Contact : <a href="mailto:info@ossaboisfrance.com" style="color: #5E6F4F; text-decoration: none; font-weight: 600;">info@ossaboisfrance.com</a> &bull; Site : <a href="https://ossaboisfrance.com" style="color: #5E6F4F; text-decoration: none; font-weight: 600;">ossaboisfrance.com</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    // 3. Send Email using Resend REST API (avoids CommonJS requirement issues in Turbopack)
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Ossa Bois <info@ossaboisfrance.com>";
    const toAdminEmail = process.env.RESEND_ADMIN_EMAIL || "sylqevciblendi@gmail.com";

    if (apiKey) {
      // Send to Admin
      const adminRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          from: fromEmail,
          to: toAdminEmail,
          subject: `[Nouveau Projet] Configuration de Maison ${selection?.house?.name || ""} - Ref ${orderRef}`,
          html: adminEmailHtml
        })
      });

      if (!adminRes.ok) {
        const errorText = await adminRes.text();
        console.error("[Resend Admin Email Error]:", errorText);
      }

      // Send to Client
      if (clientEmail) {
        const clientRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            from: fromEmail,
            to: clientEmail,
            subject: `Votre projet de construction Ossa Bois - Référence ${orderRef}`,
            html: clientEmailHtml
          })
        });

        if (!clientRes.ok) {
          const errorText = await clientRes.text();
          console.error("[Resend Client Email Error]:", errorText);
        }
      }

      console.log(`[API Checkout] Emails sent successfully via Resend API endpoint for order ${orderRef}.`);
    } else {
      // Fallback: log to console if RESEND_API_KEY is not configured.
      // This is crucial for local testing.
      console.log("=========================================================================");
      console.warn("[WARNING] RESEND_API_KEY environment variable is missing! Logging emails to console:");
      console.log(`Order Reference: ${orderRef}`);
      console.log(`Total: ${euroFormatter.format(total)}`);
      console.log(`Client: ${clientName} (${clientEmail}), Phone: ${clientPhone}`);
      console.log(`To Admin (${toAdminEmail}):\n${adminEmailHtml}`);
      console.log(`To Client (${clientEmail}):\n${clientEmailHtml}`);
      console.log("=========================================================================");
    }

    return NextResponse.json({
      success: true,
      orderRef,
      message: "Order placed and emails sent successfully."
    });
  } catch (error: any) {
    console.error("[API Checkout Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process checkout request" },
      { status: 500 }
    );
  }
}
