import type { Metadata } from "next";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export const metadata: Metadata = {
  title: "Politique de confidentialité | Ossa Bois France",
  description:
    "Informations sur le traitement des données transmises à Ossa Bois France.",
};

export default async function PrivacyPolicyPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="legal-page-root">
      <div className="container">
        <div className="legal-breadcrumb">
          <Link href={`/${locale}`} className="back-link">
            ← Retour à l&apos;accueil
          </Link>
        </div>

        <header className="legal-header">
          <span className="legal-kicker">DONNÉES PERSONNELLES</span>
          <h1>Politique de confidentialité</h1>
          <p className="legal-date">Dernière mise à jour : 8 septembre 2026</p>
        </header>

        <div className="legal-content">
          <p className="legal-intro">
            Cette politique explique comment Ossa Bois France traite les
            informations que vous transmettez par les formulaires de contact et
            de demande professionnelle du site ossaboisfrance.com.
          </p>

          <hr className="legal-divider" />

          <section className="legal-section">
            <h2>1. Responsable du traitement</h2>
            <p>
              Ossa Bois France, 50 rue Chanzy, 28000 Chartres, France. Pour toute
              question relative à vos données personnelles, écrivez à{" "}
              <a href="mailto:info@ossaboisfrance.com">
                info@ossaboisfrance.com
              </a>
              .
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Données traitées et finalités</h2>
            <p>
              Selon le formulaire utilisé, nous traitons vos nom, prénom,
              coordonnées, type de demande, message et, pour les demandes B2B,
              le document PDF que vous choisissez volontairement de joindre.
              Ces informations servent uniquement à recevoir, analyser et
              répondre à votre demande, préparer un échange technique ou
              commercial et protéger les formulaires contre les abus.
            </p>
            <p>
              N&apos;envoyez pas de données sensibles ni de documents sans rapport
              direct avec votre projet. Supprimez les informations inutiles de
              tout PDF avant son envoi.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Base et caractère du traitement</h2>
            <p>
              Le traitement est réalisé pour répondre aux démarches que vous
              initiez et, selon la nature de la demande, pour prendre des mesures
              précontractuelles ou répondre à l&apos;intérêt légitime de traiter les
              sollicitations reçues. Les champs marqués comme obligatoires sont
              nécessaires pour acheminer et traiter votre demande.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Destinataires et prestataires techniques</h2>
            <p>
              Les données sont accessibles uniquement aux personnes autorisées
              chez Ossa Bois France et aux prestataires strictement nécessaires
              au fonctionnement du site et à l&apos;acheminement des e-mails,
              notamment Vercel et Resend. Elles ne sont pas vendues.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Durée de conservation</h2>
            <p>
              Les demandes et leurs pièces jointes sont conservées pendant la
              durée nécessaire à leur traitement et au suivi de la relation,
              puis supprimées ou archivées uniquement lorsque des obligations
              légales ou la défense de droits le justifient. Vous pouvez demander
              la suppression d&apos;une demande qui n&apos;a plus à être conservée.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Vos droits</h2>
            <p>
              Vous pouvez demander l&apos;accès, la rectification, l&apos;effacement ou
              la limitation du traitement de vos données, et vous opposer à un
              traitement lorsque la réglementation le permet. Adressez votre
              demande à info@ossaboisfrance.com en précisant les informations
              nécessaires pour identifier la demande concernée. Vous pouvez
              également introduire une réclamation auprès de la CNIL.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Sécurité et mises à jour</h2>
            <p>
              Ossa Bois France applique des mesures techniques et
              organisationnelles destinées à limiter l&apos;accès non autorisé, la
              perte et l&apos;usage abusif des données. Cette politique peut évoluer
              lorsque le service ou ses prestataires changent ; la date affichée
              en haut de la page indique la version applicable.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
