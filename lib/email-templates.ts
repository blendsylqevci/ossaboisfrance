import type { Locale } from "@/lib/i18n";

const BRAND = {
  olive: "#5E6F4F",
  oliveDark: "#435139",
  wood: "#C5A880",
  ivory: "#FAF9F6",
  ink: "#1E293B",
  muted: "#64748B",
  line: "#EBE9E2",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function getPublicSiteUrl(): string {
  const fallback = "https://ossaboisfrance.com";
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return fallback;

  try {
    const url = new URL(configured);
    const localDevelopment =
      process.env.NODE_ENV !== "production" &&
      url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1");
    if (url.protocol !== "https:" && !localDevelopment) return fallback;
    return url.origin;
  } catch {
    return fallback;
  }
}

type EmailShellArgs = {
  lang?: Locale;
  preheader: string;
  eyebrow: string;
  title: string;
  bodyHtml: string;
  action?: {
    href: string;
    label: string;
  };
  footerNote?: string;
};

function emailShell({
  lang = "fr",
  preheader,
  eyebrow,
  title,
  bodyHtml,
  action,
  footerNote,
}: EmailShellArgs): string {
  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.ivory};font-family:Arial,Helvetica,sans-serif;color:${BRAND.ink};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BRAND.ivory};padding:24px 10px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#fff;border:1px solid ${BRAND.line};border-radius:14px;overflow:hidden;">
            <tr><td style="height:5px;background:${BRAND.wood};font-size:0;line-height:0;">&nbsp;</td></tr>
            <tr>
              <td style="padding:30px 34px 24px;background:${BRAND.oliveDark};color:#fff;">
                <div style="font-size:19px;font-weight:800;letter-spacing:2.5px;">OSSA BOIS</div>
                <div style="margin-top:4px;color:#E7EDE3;font-size:10px;letter-spacing:1.4px;">FRANCE &bull; CONSTRUCTION BOIS</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 34px 14px;">
                <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:${BRAND.olive};text-transform:uppercase;">${escapeHtml(eyebrow)}</div>
                <h1 style="margin:8px 0 18px;font-size:25px;line-height:1.2;color:${BRAND.ink};">${escapeHtml(title)}</h1>
                <div style="font-size:15px;line-height:1.7;color:#475569;">${bodyHtml}</div>
              </td>
            </tr>
            ${action ? `<tr>
              <td style="padding:8px 34px 30px;">
                <a href="${escapeHtml(action.href)}" style="display:inline-block;padding:13px 22px;border-radius:8px;background:${BRAND.olive};color:#fff;text-decoration:none;font-size:14px;font-weight:700;">${escapeHtml(action.label)}</a>
              </td>
            </tr>` : ""}
            <tr>
              <td style="padding:22px 34px;background:#F7F8F5;border-top:1px solid ${BRAND.line};font-size:12px;line-height:1.6;color:${BRAND.muted};">
                ${footerNote ? `<div style="margin-bottom:9px;">${escapeHtml(footerNote)}</div>` : ""}
                <strong style="color:${BRAND.oliveDark};">Ossa Bois France</strong><br />
                50 rue Chanzy, 28000 Chartres, France<br />
                <a href="https://ossaboisfrance.com" style="color:${BRAND.olive};text-decoration:none;">ossaboisfrance.com</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildPasswordResetEmail(token: string): {
  html: string;
  subject: string;
} {
  const resetUrl = `${getPublicSiteUrl()}/admin/reset/${encodeURIComponent(token)}`;
  const subject = "Réinitialisation de votre mot de passe - Ossa Bois France";
  return {
    subject,
    html: emailShell({
      preheader: "Lien sécurisé de réinitialisation de votre mot de passe.",
      eyebrow: "Sécurité du compte",
      title: "Réinitialiser votre mot de passe",
      bodyHtml: `<p style="margin:0 0 14px;">Une demande de réinitialisation a été reçue pour votre compte d'administration Ossa Bois France.</p>
        <p style="margin:0;">Ce lien personnel expire dans <strong>30 minutes</strong>. Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail et ne transmettez jamais ce lien.</p>`,
      action: {
        href: resetUrl,
        label: "Choisir un nouveau mot de passe",
      },
      footerNote: "Pour votre sécurité, Ossa Bois France ne vous demandera jamais votre mot de passe par e-mail.",
    }),
  };
}

export function buildPasswordChangedEmail(): {
  html: string;
  subject: string;
} {
  const subject = "Votre mot de passe a été modifié - Ossa Bois France";
  return {
    subject,
    html: emailShell({
      preheader: "Confirmation de modification de votre mot de passe.",
      eyebrow: "Alerte de sécurité",
      title: "Mot de passe modifié",
      bodyHtml: `<p style="margin:0 0 14px;">Le mot de passe de votre compte d'administration Ossa Bois France vient d'être modifié.</p>
        <p style="margin:0;">Si vous avez effectué cette opération, aucune action supplémentaire n'est nécessaire. Sinon, contactez immédiatement la personne responsable de la plateforme et sécurisez votre compte.</p>`,
      footerNote: "Cet e-mail de sécurité est envoyé automatiquement après une réinitialisation réussie.",
    }),
  };
}

type AcknowledgementKind = "contact" | "b2b";

const ACK_COPY: Record<Locale, Record<AcknowledgementKind, {
  subject: string;
  eyebrow: string;
  title: string;
  greeting: string;
  message: string;
  reference: string;
  footer: string;
}>> = {
  fr: {
    contact: {
      subject: "Nous avons bien reçu votre message",
      eyebrow: "Confirmation de réception",
      title: "Votre demande est entre de bonnes mains",
      greeting: "Bonjour {name},",
      message: "Notre équipe a bien reçu votre message. Un conseiller vous répondra dans les meilleurs délais ouvrés, après examen de votre demande.",
      reference: "Référence de votre demande",
      footer: "Vous pouvez répondre directement à cet e-mail si vous souhaitez ajouter une précision.",
    },
    b2b: {
      subject: "Votre demande professionnelle a bien été reçue",
      eyebrow: "Demande B2B",
      title: "Merci pour votre proposition de collaboration",
      greeting: "Bonjour {name},",
      message: "Notre équipe professionnelle étudie votre demande et les documents transmis. Nous reviendrons vers vous dès que l'analyse initiale sera terminée.",
      reference: "Référence de votre demande",
      footer: "Vous pouvez répondre directement à cet e-mail pour compléter votre dossier.",
    },
  },
  en: {
    contact: {
      subject: "We have received your message",
      eyebrow: "Message received",
      title: "Your request is in good hands",
      greeting: "Hello {name},",
      message: "Our team has received your message. An advisor will reply as soon as practicable during business days, after reviewing your request.",
      reference: "Request reference",
      footer: "You can reply directly to this email if you would like to add more information.",
    },
    b2b: {
      subject: "Your professional request has been received",
      eyebrow: "B2B request",
      title: "Thank you for your collaboration proposal",
      greeting: "Hello {name},",
      message: "Our professional team is reviewing your request and submitted documents. We will contact you after the initial review.",
      reference: "Request reference",
      footer: "You can reply directly to this email to add information to your file.",
    },
  },
  de: {
    contact: {
      subject: "Wir haben Ihre Nachricht erhalten",
      eyebrow: "Eingangsbestätigung",
      title: "Ihre Anfrage ist bei uns eingegangen",
      greeting: "Guten Tag {name},",
      message: "Unser Team hat Ihre Nachricht erhalten. Nach Prüfung Ihrer Anfrage meldet sich ein Berater schnellstmöglich an einem Werktag bei Ihnen.",
      reference: "Referenz Ihrer Anfrage",
      footer: "Sie können direkt auf diese E-Mail antworten, um weitere Informationen hinzuzufügen.",
    },
    b2b: {
      subject: "Ihre Geschäftsanfrage ist eingegangen",
      eyebrow: "B2B-Anfrage",
      title: "Vielen Dank für Ihren Kooperationsvorschlag",
      greeting: "Guten Tag {name},",
      message: "Unser Fachteam prüft Ihre Anfrage und die übermittelten Dokumente. Nach der ersten Prüfung melden wir uns bei Ihnen.",
      reference: "Referenz Ihrer Anfrage",
      footer: "Sie können direkt auf diese E-Mail antworten, um Ihre Unterlagen zu ergänzen.",
    },
  },
  nl: {
    contact: {
      subject: "Wij hebben uw bericht ontvangen",
      eyebrow: "Ontvangstbevestiging",
      title: "Uw aanvraag is goed ontvangen",
      greeting: "Hallo {name},",
      message: "Ons team heeft uw bericht ontvangen. Na beoordeling van uw aanvraag neemt een adviseur zo spoedig mogelijk op een werkdag contact met u op.",
      reference: "Referentie van uw aanvraag",
      footer: "U kunt rechtstreeks op deze e-mail antwoorden om extra informatie toe te voegen.",
    },
    b2b: {
      subject: "Uw zakelijke aanvraag is ontvangen",
      eyebrow: "B2B-aanvraag",
      title: "Bedankt voor uw samenwerkingsvoorstel",
      greeting: "Hallo {name},",
      message: "Ons professionele team beoordeelt uw aanvraag en de ingediende documenten. Na de eerste beoordeling nemen wij contact met u op.",
      reference: "Referentie van uw aanvraag",
      footer: "U kunt rechtstreeks op deze e-mail antwoorden om uw dossier aan te vullen.",
    },
  },
};

export function buildLeadAcknowledgementEmail(args: {
  kind: AcknowledgementKind;
  locale: Locale;
  name: string;
  reference: string;
}): { html: string; subject: string } {
  const copy = ACK_COPY[args.locale]?.[args.kind] || ACK_COPY.fr[args.kind];
  const safeName = escapeHtml(args.name);
  const safeReference = escapeHtml(args.reference);
  return {
    subject: `${copy.subject} - ${args.reference}`,
    html: emailShell({
      lang: args.locale,
      preheader: `${copy.subject}. ${copy.reference}: ${args.reference}`,
      eyebrow: copy.eyebrow,
      title: copy.title,
      bodyHtml: `<p style="margin:0 0 14px;">${escapeHtml(copy.greeting).replace("{name}", safeName)}</p>
        <p style="margin:0 0 18px;">${escapeHtml(copy.message)}</p>
        <div style="padding:13px 15px;border-radius:8px;background:${BRAND.ivory};border:1px solid ${BRAND.line};">
          <span style="display:block;font-size:11px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:.7px;">${escapeHtml(copy.reference)}</span>
          <strong style="display:block;margin-top:4px;color:${BRAND.oliveDark};font-size:16px;letter-spacing:.5px;">${safeReference}</strong>
        </div>`,
      footerNote: copy.footer,
    }),
  };
}
