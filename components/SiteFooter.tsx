import Image from "next/image";
import Link from "next/link";
import { Locale } from "@/lib/i18n";

type SiteFooterProps = {
  locale: Locale;
  dict: any;
};

export function SiteFooter({ locale, dict }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Image src="/images/brand/ossa-bois-logo-alt.png" alt="Ossa Bois" width={180} height={165} />
          <p>{dict?.description || "Construction de maison à ossature bois."}</p>
        </div>
        <div className="footer-nav">
          <h2>{dict?.navigation || "Navigation"}</h2>
          <Link href={`/${locale}`}>{dict?.home || "Accueil"}</Link>
          <Link href={`/${locale}/qui-sommes-nous`}>{dict?.about || "Qui Sommes-Nous"}</Link>
          <Link href={`/${locale}/b2b`}>{dict?.b2b || "B2B"}</Link>
          <Link href={`/${locale}/realisations`}>{dict?.realisations || "Réalisations"}</Link>
          <Link href={`/${locale}/maisons`}>{dict?.models || "Modèles de Maisons"}</Link>
          <Link href={`/${locale}/contact`}>Contact</Link>
        </div>
        <div className="footer-contact">
          <h2>{dict?.address || "Notre Adresse"}</h2>
          <p>50 rue Chanzy<br />28000 Chartres</p>
          <h2>{dict?.contactUs || "Contactez-Nous"}</h2>
          <p>infoossabois@gmail.com</p>
          <h2>{dict?.socialMedia || "Réseaux sociaux"}</h2>
          <div className="footer-socials" aria-label={dict?.socialMedia || "Réseaux sociaux"}>
            <span>f</span>
            <span>in</span>
            <span>ig</span>
          </div>
        </div>
        <div className="footer-question">
          <form>
            <label htmlFor="footer-email">{dict?.newsletterLabel || "Contact for any question"}</label>
            <div className="footer-form-row">
              <input id="footer-email" type="email" placeholder={dict?.emailPlaceholder || "E-mail"} />
              <button type="button">{dict?.send || "Envoyer"}</button>
            </div>
          </form>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>{dict?.copyright || "Copyright © 2025. Ossabois"}</span>
        <span className="footer-links-divider">|</span>
        <Link href={`/${locale}/mentions-legales`}>Mentions Légales</Link>
        <span className="footer-links-divider">|</span>
        <Link href={`/${locale}/politique-de-confidentialite`}>Confidentialité</Link>
        <span className="footer-links-divider">|</span>
        <Link href={`/${locale}/cgu`}>CGU</Link>
        <span className="footer-links-divider">|</span>
        <a href="https://www.icode-ks.com" target="_blank" rel="noreferrer">{dict?.madeBy || "Made by iCode"}</a>
      </div>
    </footer>
  );
}
