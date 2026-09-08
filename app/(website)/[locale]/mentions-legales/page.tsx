import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Locale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: "Mentions Légales | Ossa Bois France",
    description: "Mentions légales du site Ossa Bois France, fabricant de maisons à ossature bois.",
  };
}

export default async function MentionsLegalesPage({ params }: PageProps) {
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
          <span className="legal-kicker">INFORMATIONS LÉGALES</span>
          <h1>Mentions Légales</h1>
          <p className="legal-date">Dernière mise à jour : Mai 2026</p>
        </header>

        {/* Content Section */}
        <div className="legal-content">
          <p className="legal-intro">
            Conformément aux dispositions de l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN), il est précisé aux utilisateurs du site <strong>ossaboisfrance.com</strong> l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi.
          </p>

          <hr className="legal-divider" />

          {/* Section 1 */}
          <section className="legal-section">
            <h2>1. Éditeur du site</h2>
            <p>
              Le site internet <strong>ossaboisfrance.com</strong> est édité par la société :
            </p>
            <div className="legal-card">
              <p><strong>Dénomination sociale :</strong> OSSA BOIS FRANCE</p>
              <p><strong>Forme juridique :</strong> SAS (Société par Actions Simplifiée)</p>
              <p><strong>Siège social :</strong> 50 rue Chanzy, 28000 Chartres, France</p>
              <p><strong>Capital social :</strong> [Ex: 10 000] €</p>
              <p><strong>Numéro d'immatriculation (RCS) :</strong> [Ex: 123 456 789 RCS Chartres]</p>
              <p><strong>Numéro SIRET :</strong> [Ex: 123 456 789 00012]</p>
              <p><strong>Numéro de TVA intracommunautaire :</strong> [Ex: FR 12 123456789]</p>
              <p><strong>Identifiant Unique (IDU) ADEME (Filière REP PMCB) :</strong> [Ex: FR123456_01ABCD]</p>
              <p><strong>Adresse e-mail :</strong> info@ossaboisfrance.com</p>
              <p><strong>Téléphone :</strong> [Numéro de téléphone de l'entreprise]</p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="legal-section">
            <h2>2. Directeur de la publication</h2>
            <p>
              Le Directeur de la publication du site internet est <strong>[Nom du dirigeant de Ossa Bois]</strong>, en sa qualité de <strong>Président de OSSA BOIS FRANCE</strong>.
            </p>
          </section>

          {/* Section 3 */}
          <section className="legal-section">
            <h2>3. Hébergement du site</h2>
            <p>
              Le site internet est hébergé par les infrastructures cloud de :
            </p>
            <div className="legal-card">
              <p><strong>Hébergeur :</strong> Vercel Inc. / Supabase Inc.</p>
              <p><strong>Adresse de l'hébergeur :</strong> Vercel Inc., 440 N Barranca Ave #4133 Covina, CA 91723, USA</p>
              <p><strong>Site internet :</strong> vercel.com / supabase.com</p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="legal-section">
            <h2>4. Assurances professionnelles (Garantie Décennale)</h2>
            <p>
              En tant que constructeur de maisons individuelles et de structures en ossature bois en France, la société <strong>OSSA BOIS FRANCE</strong> est soumise à l'obligation de souscription d'une assurance décennale conformément à l'article L. 241-1 du Code des assurances.
            </p>
            <div className="legal-card">
              <p><strong>Assureur décennal :</strong> [Nom de votre compagnie d'assurance, ex: AXA, SMABTP, Allianz]</p>
              <p><strong>Numéro de contrat :</strong> [Numéro de votre police d'assurance décennale]</p>
              <p><strong>Zone de couverture géographique :</strong> France Métropolitaine</p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="legal-section">
            <h2>5. Propriété intellectuelle</h2>
            <p>
              La structure générale du site, ainsi que les textes, images animées ou non, sons, savoir-faire, et tous les autres éléments composant le site sont la propriété exclusive de <strong>OSSA BOIS FRANCE</strong> ou de ses partenaires.
            </p>
            <p>
              Toute représentation totale ou partielle de ce site par quelque procédé que ce soit, sans l'autorisation expresse de l'exploitant du site internet est interdite et constituerait une contrefaçon sanctionnée par les articles L. 335-2 et suivants du Code de la propriété intellectuelle.
            </p>
            <p>
              Les marques de l'exploitant du site internet et de ses partenaires, ainsi que les logos figurant sur le site sont des marques déposées. Toute reproduction totale ou partielle de ces marques ou de ces logos effectuée à partir des éléments du site sans l'autorisation expresse de l'exploitant du site internet est prohibée au sens de l'article L. 713-2 du Code de la propriété intellectuelle.
            </p>
          </section>

          {/* Section 6 */}
          <section className="legal-section">
            <h2>6. Limitation de responsabilité</h2>
            <p>
              Les informations diffusées sur le site <strong>ossaboisfrance.com</strong> (notamment les prix générés par le configurateur de maison) sont fournies à titre strictement indicatif et gratuit. L'éditeur s'efforce de fournir des informations précises et à jour, mais ne saurait garantir l'exactitude, la complétude ou l'actualité des informations diffusées.
            </p>
            <p>
              En conséquence, l'utilisateur reconnaît utiliser ces informations sous sa responsabilité exclusive. L'éditeur ne peut être tenu responsable des dommages directs ou indirects résultant de l'utilisation de ce site ou des informations qui y sont contenues.
            </p>
          </section>

          {/* Section 7 */}
          <section className="legal-section">
            <h2>7. Médiation de la consommation</h2>
            <p>
              Conformément aux articles L. 612-1 et suivants du Code de la consommation, en cas de litige de consommation non résolu de manière amiable avec notre service client, vous pouvez recourir gratuitement au médiateur de la consommation agréé dont nous relevons :
            </p>
            <div className="legal-card">
              <p><strong>Organisme de médiation :</strong> [Nom du médiateur de la consommation choisi, ex: AME Conso, CM2C]</p>
              <p><strong>Adresse de saisine :</strong> [Adresse postale du médiateur]</p>
              <p><strong>Site internet :</strong> [Site internet de l'organisme de médiation]</p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="legal-section">
            <h2>8. Droit applicable</h2>
            <p>
              Le site internet <strong>ossaboisfrance.com</strong> et ses mentions légales sont soumis au droit français. En cas de litige, et à défaut de résolution amiable, compétence exclusive est attribuée aux tribunaux compétents de Chartres.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
