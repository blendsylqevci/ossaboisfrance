import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Locale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: "Politique de Confidentialité | Ossa Bois France",
    description: "Politique de confidentialité et protection des données personnelles de la société Ossa Bois France.",
  };
}

export default async function PolitiqueConfidentialitePage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="legal-page-root">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div className="legal-breadcrumb">
          <Link href={`/${locale}`} className="back-link">
            ← Retour à l'accueil
          </Link>
        </div>

        {/* Page Header */}
        <header className="legal-header">
          <span className="legal-kicker">DONNÉES PERSONNELLES</span>
          <h1>Politique de Confidentialité</h1>
          <p className="legal-date">Dernière mise à jour : Mai 2026</p>
        </header>

        {/* Content Section */}
        <div className="legal-content">
          <p className="legal-intro">
            La protection de vos données personnelles est au cœur des préoccupations de <strong>OSSA BOIS FRANCE</strong>. La présente politique décrit comment nous collectons, utilisons, stockons et protégeons vos données lorsque vous visitez notre site <strong>ossaboisfrance.com</strong> et utilisez nos services.
          </p>

          <hr className="legal-divider" />

          {/* Section 1 */}
          <section className="legal-section">
            <h2>1. Responsable du traitement des données</h2>
            <p>
              Le responsable du traitement des données personnelles collectées sur le site est la société :
            </p>
            <p>
              <strong>OSSA BOIS FRANCE</strong>, SAS au capital de [Ex: 10 000] €, immatriculée au RCS de Chartres sous le numéro [Ex: 123 456 789], dont le siège social est situé 50 rue Chanzy, 28000 Chartres, France.
            </p>
            <p>
              Pour toute question relative à vos données, vous pouvez nous contacter par e-mail à : <strong>infoossabois@gmail.com</strong>.
            </p>
          </section>

          {/* Section 2 */}
          <section className="legal-section">
            <h2>2. Données personnelles que nous collectons</h2>
            <p>
              Nous collectons et traitons des données personnelles que vous nous fournissez volontairement lors de vos interactions avec le site, notamment :
            </p>
            <ul>
              <li><strong>Formulaires de contact :</strong> Nom, prénom, adresse e-mail, numéro de téléphone, message.</li>
              <li><strong>Formulaire de devis / configuration :</strong> Coordonnées complètes, détails du modèle de maison configuré, choix des options de structure, de toiture, d'isolation et de menuiseries, budget estimatif.</li>
              <li><strong>Système de favoris :</strong> Identifiants des modèles de maison que vous enregistrez dans vos favoris (stockés localement sur votre navigateur).</li>
              <li><strong>Cookies et données de trafic :</strong> Adresse IP, type de navigateur, parcours utilisateur sur le site (uniquement après acceptation via notre bannière de cookies).</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="legal-section">
            <h2>3. Finalités de la collecte des données</h2>
            <p>
              Le traitement de vos données personnelles repose sur les bases légales de l'exécution de mesures précontractuelles (réponse à vos demandes de devis et d'informations) et sur votre consentement (pour les cookies analytiques). Vos données sont collectées afin de :
            </p>
            <ul>
              <li>Répondre à vos demandes de renseignements envoyées via le formulaire de contact.</li>
              <li>Étudier vos configurations de maisons et élaborer des offres commerciales et devis personnalisés.</li>
              <li>Assurer le suivi de la relation client (prise de rendez-vous, études de faisabilité).</li>
              <li>Améliorer et optimiser l'utilisation de notre site internet grâce à des analyses statistiques anonymisées de navigation.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="legal-section">
            <h2>4. Durée de conservation des données</h2>
            <p>
              Vos données personnelles sont conservées pendant une durée strictement nécessaire aux finalités pour lesquelles elles ont été collectées :
            </p>
            <ul>
              <li><strong>Données des prospects / clients :</strong> Conservées pendant 3 ans à compter de votre dernier contact ou de la fin de la relation commerciale.</li>
              <li><strong>Données de navigation (cookies) :</strong> Conservées pendant une durée maximale de 13 mois conformément aux recommandations de la CNIL.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="legal-section">
            <h2>5. Destinataires des données</h2>
            <p>
              Les données collectées sur notre site sont exclusivement destinées à la société <strong>OSSA BOIS FRANCE</strong>. Vos données ne sont jamais vendues, louées, partagées ou cédées à des tiers à des fins publicitaires ou marketing.
            </p>
            <p>
              Dans le cas où la réalisation de votre projet l'exige (par exemple, étude de sol, architecte partenaire ou sous-traitance), certaines informations pourront être transmises à des tiers après votre accord exprès préalable.
            </p>
          </section>

          {/* Section 6 */}
          <section className="legal-section">
            <h2>6. Vos droits sous le Règlement Général sur la Protection des Données (RGPD)</h2>
            <p>
              Conformément à la réglementation européenne en vigueur, vous disposez des droits suivants concernant vos données personnelles :
            </p>
            <ul>
              <li><strong>Droit d'accès :</strong> Vous pouvez obtenir la confirmation que des données vous concernant sont traitées et en obtenir une copie.</li>
              <li><strong>Droit de rectification :</strong> Vous pouvez demander la correction de données inexactes ou incomplètes.</li>
              <li><strong>Droit à l'effacement (« droit à l'oubli ») :</strong> Vous pouvez demander la suppression de vos données personnelles sous certaines conditions.</li>
              <li><strong>Droit d'opposition :</strong> Vous pouvez vous opposer à tout moment au traitement de vos données pour des raisons tenant à votre situation particulière.</li>
              <li><strong>Droit à la limitation du traitement :</strong> Vous pouvez demander à suspendre temporairement le traitement de certaines données.</li>
              <li><strong>Droit à la portabilité :</strong> Vous pouvez demander à recevoir vos données dans un format structuré et lisible pour les transmettre à un autre responsable.</li>
            </ul>
            <p>
              Pour exercer ces droits, il vous suffit d'adresser votre demande par e-mail à : <strong>infoossabois@gmail.com</strong>. Nous répondrons à votre demande dans un délai d'un mois maximum.
            </p>
            <p>
              Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous avez le droit d'introduire une réclamation auprès de l'autorité de contrôle compétente en France (la CNIL - Commission Nationale de l'Informatique et des Libertés, sur son site internet cnil.fr).
            </p>
          </section>

          {/* Section 7 */}
          <section className="legal-section">
            <h2>7. Gestion des cookies et consentements</h2>
            <p>
              Notre site utilise des cookies. Un cookie est un petit fichier texte stocké sur votre ordinateur lors de la visite d'un site.
            </p>
            <p>
              Certains cookies sont dits <strong>essentiels</strong> (comme la sauvegarde de votre choix de langue, la mémorisation de vos maisons favorites, ou le fonctionnement technique du configurateur). Ces cookies ne nécessitent pas votre consentement car ils sont indispensables à la fourniture du service que vous avez demandé.
            </p>
            <p>
              D'autres cookies, dits <strong>de mesure d'audience</strong> (analytiques), nous aident à comptabiliser les visites et les sources de trafic. Ils ne sont installés qu'après votre acceptation expresse via la bannière de consentement affichée lors de votre première visite. Vous pouvez modifier ou révoquer vos choix de consentement à tout moment en cliquant sur le bouton flottant (icône cookie) en bas à gauche de votre écran.
            </p>
          </section>

          {/* Section 8 */}
          <section className="legal-section">
            <h2>8. Sécurité des données</h2>
            <p>
              Nous mettons en œuvre toutes les mesures techniques, administratives et organisationnelles appropriées pour protéger vos données contre toute destruction, perte, altération, divulgation ou accès non autorisé. Le site utilise le protocole de chiffrement SSL (HTTPS) pour sécuriser le transfert des informations que vous saisissez dans nos formulaires.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
