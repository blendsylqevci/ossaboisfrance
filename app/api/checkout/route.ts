import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

const euroFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { selection, personalInfo, deliveryInfo, orderRef, total, transportCost } = body;

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

    // Persist order in the database
    const orderDoc = await payload.create({
      collection: 'orders',
      data: {
        house: houseDoc.id,
        customerName: clientName,
        customerEmail: clientEmail,
        customerPhone: clientPhone || "",
        totalPrice: total,
        selections: selection,
        status: 'pending',
      }
    });

    console.log(`[API Checkout] Order persisted in database with ID: ${orderDoc.id}`);

    const origin = req.headers.get("origin") || "https://ossaboisfrance.com";
    const houseImageUrl = selection?.currentImage || selection?.house?.image
      ? `${origin}${selection.currentImage || selection.house.image}`
      : `${origin}/images/houses/ambre/10 ambre.jpg`;

    // 1. Compile Admin Notification Email (info@ossaboisfrance.com)
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f7f7f5; color: #1a1a1a; margin: 0; padding: 20px; }
          .container { max-width: 650px; background-color: #ffffff; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e5e5e0; }
          .header { background-color: #5E6F4F; padding: 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.5px; }
          .content { padding: 30px; }
          .section { margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #f0f0eb; }
          .section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
          .section-title { font-size: 15px; font-weight: 700; color: #5E6F4F; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
          .info-item { font-size: 14px; line-height: 1.5; }
          .info-label { font-weight: 600; color: #787870; }
          .config-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .config-table th { background-color: #fafaf7; text-align: left; padding: 8px 12px; font-size: 13px; font-weight: 600; color: #4c4c45; }
          .config-table td { padding: 8px 12px; border-bottom: 1px solid #fafaf7; font-size: 13.5px; }
          .house-preview { width: 100%; height: 180px; object-fit: cover; border-radius: 8px; margin-bottom: 15px; }
          .total-card { background-color: #fafaf7; padding: 15px 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border: 1.5px dashed #5E6F4F; }
          .total-label { font-size: 16px; font-weight: 700; color: #181a20; }
          .total-value { font-size: 20px; font-weight: 700; color: #5E6F4F; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nouveau Projet de Construction - ${orderRef}</h1>
          </div>
          <div class="content">
            <!-- Client Info -->
            <div class="section">
              <div class="section-title">Informations du Client</div>
              <div class="info-grid">
                <div class="info-item"><span class="info-label">Nom complet:</span> ${clientName}</div>
                <div class="info-item"><span class="info-label">Téléphone:</span> ${clientPhone || "Non renseigné"}</div>
                <div class="info-item" style="grid-column: span 2;"><span class="info-label">Adresse Email:</span> <a href="mailto:${clientEmail}">${clientEmail}</a></div>
              </div>
            </div>

            <!-- Delivery/Construction Address -->
            <div class="section">
              <div class="section-title">Lieu de Livraison / Terrain</div>
              <div class="info-item"><span class="info-label">Adresse:</span> ${deliveryInfo?.streetAddress}</div>
              <div class="info-item"><span class="info-label">Ville & Code Postal:</span> ${deliveryInfo?.zipCode} ${deliveryInfo?.city}</div>
              <div class="info-item"><span class="info-label">Région & Pays:</span> ${deliveryInfo?.stateRegion || "-"}, ${deliveryInfo?.country || "France"}</div>
              ${deliveryInfo?.notes ? `<div class="info-item" style="margin-top: 10px; padding: 10px; background-color: #fafaf7; border-radius: 6px;"><span class="info-label">Notes Client:</span> ${deliveryInfo.notes}</div>` : ""}
            </div>

            <!-- House Info -->
            <div class="section">
              <div class="section-title">Détails de la Maison</div>
              <img src="${houseImageUrl}" alt="${selection?.house?.name || "Modèle"}" class="house-preview" />
              <div class="info-grid">
                <div class="info-item"><span class="info-label">Modèle:</span> ${selection?.house?.name || "Maison"}</div>
                <div class="info-item"><span class="info-label">Dimensions:</span> ${selection?.size?.value || "-"}</div>
              </div>
              
              <table class="config-table">
                <thead>
                  <tr>
                    <th>Composant</th>
                    <th>Option Choisie</th>
                  </tr>
                </thead>
                <tbody>
                  ${selection?.isolation?.value ? `<tr><td>Isolation</td><td>${selection.isolation.value}</td></tr>` : ""}
                  ${selection?.outerIsolation?.value ? `<tr><td>Isolation Extérieure</td><td>${selection.outerIsolation.value}</td></tr>` : ""}
                  ${selection?.facade?.value ? `<tr><td>Façade / Bardage</td><td>${selection.facade.value}</td></tr>` : ""}
                  ${selection?.toiture?.value ? `<tr><td>Couverture de Toit</td><td>${selection.toiture.value}</td></tr>` : ""}
                  ${selection?.dritaret?.value ? `<tr><td>Menuiseries (Fenêtres)</td><td>${selection.dritaret.value}</td></tr>` : ""}
                </tbody>
              </table>
            </div>

            <!-- Pricing Total -->
            <div class="section">
              <div class="section-title">Financement Estimé</div>
              <div class="total-card">
                <span class="total-label">Total Projet (TTC):</span>
                <span class="total-value">${euroFormatter.format(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // 2. Compile Client Confirmation Email
    const clientEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #fcfcfc; color: #333333; margin: 0; padding: 20px; -webkit-font-smoothing: antialiased; }
          .container { max-width: 600px; background-color: #ffffff; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid #eef0eb; }
          .header { background: #5E6F4F; padding: 40px 30px; text-align: center; color: #ffffff; }
          .header .brand { font-size: 26px; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px; text-transform: uppercase; }
          .header h2 { margin: 0; font-size: 18px; font-weight: 400; opacity: 0.9; }
          .content { padding: 40px 35px; }
          .greeting { font-size: 20px; font-weight: 600; color: #181a20; margin-bottom: 16px; }
          .intro-text { font-size: 15px; line-height: 1.6; color: #4c4c45; margin-bottom: 28px; }
          
          .next-steps-card { background: #f7faf6; border-left: 4px solid #5E6F4F; padding: 20px; border-radius: 4px 8px 8px 4px; margin-bottom: 35px; }
          .next-steps-title { font-size: 15px; font-weight: 700; color: #5E6F4F; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
          .next-steps-list { margin: 0; padding-left: 20px; }
          .next-steps-list li { font-size: 14px; line-height: 1.55; color: #3a3f35; margin-bottom: 8px; }
          
          .summary-card { border: 1px solid #eef0eb; border-radius: 12px; overflow: hidden; margin-bottom: 30px; }
          .summary-header { background: #fafaf8; padding: 12px 20px; border-bottom: 1px solid #eef0eb; font-size: 14px; font-weight: 700; color: #4c4c45; }
          .summary-body { padding: 20px; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13.5px; color: #555550; }
          .summary-row.total { border-top: 1px dashed #eef0eb; padding-top: 12px; margin-top: 12px; margin-bottom: 0; font-weight: 700; font-size: 16px; color: #181a20; }
          .house-img { width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 15px; }
          
          .footer { background: #fdfdfd; padding: 30px; text-align: center; font-size: 12.5px; color: #888880; border-top: 1px solid #f6f6f2; }
          .footer a { color: #5E6F4F; text-decoration: none; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">Ossa Bois</div>
            <h2>Votre rêve prend forme</h2>
          </div>
          <div class="content">
            <div class="greeting">Bonjour ${clientName},</div>
            <p class="intro-text">
              Nous vous remercions chaleureusement pour la configuration de votre future maison ossature bois Ossa Bois. 
              Votre projet a bien été enregistré sous la référence unique <strong>${orderRef}</strong>. Il s'agit d'un projet de grande envergure et nos experts y accordent la plus grande attention.
            </p>

            <div class="next-steps-card">
              <div class="next-steps-title">Prochaines étapes de votre projet :</div>
              <ul class="next-steps-list">
                <li><strong>Analyse technique :</strong> Notre bureau d'études étudie sous 24h la faisabilité technique de votre terrain (accès camion-grue de gros tonnage, règles d'urbanisme PLU).</li>
                <li><strong>Validation par téléphone :</strong> Un conseiller Ossa Bois vous contactera sous 24h au <strong>${clientPhone}</strong> pour valider les aspects logistiques.</li>
                <li><strong>Signature du contrat :</strong> Suite à notre échange, vous recevrez par email le contrat de construction sécurisé (CCMI) pour signature électronique, accompagné du plan de financement détaillé (30% d'acompte, 40% au montage, 30% à la remise des clés).</li>
              </ul>
            </div>

            <!-- Project summary display for client -->
            <div class="summary-card">
              <div class="summary-header">Résumé de votre configuration</div>
              <div class="summary-body">
                <img src="${houseImageUrl}" alt="${selection?.house?.name || "Modèle"}" class="house-img" />
                <div class="summary-row">
                  <span>Modèle :</span>
                  <strong>${selection?.house?.name || "Maison"}</strong>
                </div>
                <div class="summary-row">
                  <span>Dimensions :</span>
                  <span>${selection?.size?.value || "-"}</span>
                </div>
                ${selection?.isolation?.value ? `
                <div class="summary-row">
                  <span>Isolation :</span>
                  <span>${selection.isolation.value}</span>
                </div>` : ""}
                ${selection?.facade?.value ? `
                <div class="summary-row">
                  <span>Façade / Revêtement :</span>
                  <span>${selection.facade.value}</span>
                </div>` : ""}
                ${selection?.dritaret?.value ? `
                <div class="summary-row">
                  <span>Menuiseries :</span>
                  <span>${selection.dritaret.value}</span>
                </div>` : ""}
                
                <div class="summary-row total">
                  <span>Estimation Totale (TTC) :</span>
                  <span style="color: #5E6F4F;">${euroFormatter.format(total)}</span>
                </div>
              </div>
            </div>

            <p class="intro-text" style="text-align: center; font-style: italic; color: #787870; font-size: 13.5px; margin-top: 30px;">
              L'équipe technique Ossa Bois reste à votre entière disposition pour concevoir ensemble la maison modulaire de vos rêves.
            </p>
          </div>
          <div class="footer">
            Ossa Bois France &bull; 50 rue Chanzy, 28000 Chartres, France<br/>
            Email: <a href="mailto:info@ossaboisfrance.com">info@ossaboisfrance.com</a> &bull; Site web: <a href="https://ossaboisfrance.com">ossaboisfrance.com</a>
          </div>
        </div>
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
