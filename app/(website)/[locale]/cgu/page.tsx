import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Locale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: "Conditions Générales d'Utilisation (CGU) | Ossa Bois France",
    description: "Conditions générales d'utilisation du site Ossa Bois France et de son configurateur de maison à ossature bois.",
  };
}

export default async function CGUPage({ params }: PageProps) {
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
          <span className="legal-kicker">CONDITIONS D'UTILISATION</span>
          <h1>Conditions Générales d'Utilisation</h1>
          <p className="legal-date">Dernière mise à jour : Mai 2026</p>
        </header>

        {/* Content Section */}
        <div className="legal-content">
          <p className="legal-intro">
            Les présentes Conditions Générales d'Utilisation (ci-après désignées « CGU ») ont pour objet de définir les modalités de mise à disposition et d'utilisation du site <strong>ossaboisfrance.com</strong> (ci-après désigné « le Site ») par ses utilisateurs.
          </p>
          <p className="legal-intro">
            En naviguant sur ce Site et en utilisant ses services (notamment le configurateur en ligne), vous acceptez sans réserve les présentes CGU.
          </p>

          <hr className="legal-divider" />

          {/* Section 1 */}
          <section className="legal-section">
            <h2>1. Objet du Site et du Configurateur</h2>
            <p>
              Le Site a pour but de présenter l'activité de la société <strong>OSSA BOIS FRANCE</strong>, fabricant de structures et de maisons à ossature bois, et de proposer un outil interactif de configuration de modèles de maisons (ci-après « le Configurateur »).
            </p>
            <p>
              Le Configurateur permet à l'utilisateur de choisir un modèle de maison et de personnaliser diverses options de gros œuvre, d'isolation, de toiture et de menuiseries afin d'obtenir une estimation tarifaire indicative de la structure bois.
            </p>
          </section>

          {/* Section 2 */}
          <section className="legal-section alert-box">
            <h2>⚠️ Avertissement important : Nature indicative des tarifs et devis</h2>
            <p>
              <strong>
                Les prix affichés sur le Site et générés par le Configurateur sont des estimations indicatives et n'ont aucune valeur contractuelle.
              </strong>
            </p>
            <p>
              Ces estimations de prix concernent uniquement la structure bois fournie par Ossa Bois France (livrée et assemblée selon les options) et excluent les travaux de terrassement, de maçonnerie (fondations/dalle), d'électricité, de plomberie, de second œuvre et les finitions intérieures.
            </p>
            <p>
              <strong>Aucun devis contractuel ne peut être conclu en ligne.</strong> Seul un devis écrit, daté et signé par les représentants légaux de <strong>OSSA BOIS FRANCE</strong> à la suite d'une étude technique personnalisée de faisabilité sur votre terrain d'implantation, engage la responsabilité de l'entreprise.
            </p>
            <p>
              La société se réserve le droit de modifier ses tarifs à tout moment et sans préavis, notamment en raison de la fluctuation du coût des matières premières (bois d'œuvre, isolants, métaux).
            </p>
          </section>

          {/* Section 2.a */}
          <section className="legal-section">
            <h2>2.a Absence de vente en ligne et Droit de rétractation</h2>
            <p>
              Puisqu'aucun contrat n'est conclu à distance et qu'aucune transaction financière n'est effectuée directement sur le Site, les dispositions réglementaires relatives au droit de rétractation des ventes en ligne ne s'appliquent pas aux services de ce Site.
            </p>
            <p>
              Toute signature ultérieure d'un contrat physique d'entreprise ou de construction de maison individuelle (CCMI) avec notre société s'effectuera dans le strict respect de la réglementation de la consommation, incluant le droit de rétractation légal (notamment le délai de rétractation de 10 jours prévu par l'article L. 271-1 du Code de la construction et de l'habitation pour les contrats de construction de maison individuelle).
            </p>
          </section>

          {/* Section 3 */}
          <section className="legal-section">
            <h2>3. Propriété intellectuelle et interdiction de copie</h2>
            <p>
              Le Site, son arborescence, ses bases de données, ses images de rendu 3D, ses calques de configurateurs, ses icônes, ses plans de maisons, et les textes décrivant les modèles sont protégés par le droit d'auteur et sont la propriété exclusive de <strong>OSSA BOIS FRANCE</strong>.
            </p>
            <p>
              Toute extraction, réutilisation, copie, modification, distribution ou reproduction, même partielle, de l'un de ces éléments ou du code source du Configurateur, par quelque procédé que ce soit, est strictement interdite sans notre accord préalable écrit. Tout manquement pourra donner lieu à des poursuites pénales et civiles pour contrefaçon.
            </p>
          </section>

          {/* Section 4 */}
          <section className="legal-section">
            <h2>4. Accès au site et disponibilité</h2>
            <p>
              L'éditeur s'efforce de permettre l'accès au site 24 heures sur 24, 7 jours sur 7, sauf en cas de force majeure ou d'un événement hors du contrôle de l'éditeur, et sous réserve des éventuelles pannes et interventions de maintenance nécessaires au bon fonctionnement du site et des services.
            </p>
            <p>
              Par conséquent, la responsabilité de l'éditeur ne saurait être engagée en cas d'impossibilité d'accès à ce site ou d'utilisation des services.
            </p>
          </section>

          {/* Section 5 */}
          <section className="legal-section">
            <h2>5. Données personnelles et cookies</h2>
            <p>
              L'utilisation du Configurateur et des formulaires de contact implique la collecte et le traitement de données personnelles. Les modalités de ce traitement sont décrites en détail dans notre <Link href={`/${locale}/politique-de-confidentialite`} className="legal-inline-link">Politique de Confidentialité</Link>.
            </p>
          </section>

          {/* Section 6 */}
          <section className="legal-section">
            <h2>6. Liens vers d'autres sites</h2>
            <p>
              Le Site peut contenir des liens hypertextes vers d'autres sites internet. L'éditeur ne peut être tenu pour responsable du contenu, des politiques de confidentialité ou des pratiques de ces sites tiers.
            </p>
          </section>

          {/* Section 7 */}
          <section className="legal-section">
            <h2>7. Modification des CGU</h2>
            <p>
              <strong>OSSA BOIS FRANCE</strong> se réserve le droit de modifier, à tout moment et sans préavis, les présentes CGU afin de les adapter aux évolutions du site et/ou de son exploitation, ou aux évolutions réglementaires. Les modifications entrent en vigueur dès leur mise en ligne.
            </p>
          </section>

          {/* Section 8 */}
          <section className="legal-section">
            <h2>8. Droit applicable</h2>
            <p>
              Tant le présent site internet que les modalités et conditions de son utilisation sont régis par le droit français. En cas de litige, après échec de toute tentative de recherche d'une solution amiable, compétence exclusive est attribuée aux tribunaux compétents de Chartres.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
