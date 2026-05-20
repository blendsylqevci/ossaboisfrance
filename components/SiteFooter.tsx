import Image from "next/image";
import Link from "next/link";
import { Locale } from "@/lib/i18n";

type SiteFooterProps = {
  locale: Locale;
};

export function SiteFooter({ locale }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Image src="/images/brand/ossa-bois-logo-alt.png" alt="Ossa Bois" width={180} height={165} />
          <p>Construction de maison à ossature bois.</p>
        </div>
        <div className="footer-nav">
          <h2>Navigation</h2>
          <Link href={`/${locale}`}>Accueil</Link>
          <Link href={`/${locale}/qui-sommes-nous`}>Qui Sommes-Nous</Link>
          <Link href={`/${locale}/b2b`}>B2B</Link>
          <Link href={`/${locale}/realisations`}>Réalisations</Link>
          <Link href={`/${locale}/maisons`}>Modèles de Maisons</Link>
          <Link href={`/${locale}/contact`}>Contact</Link>
        </div>
        <div className="footer-contact">
          <h2>Our Address</h2>
          <p>50 rue Chanzy<br />28000 Chartres</p>
          <h2>Contact Us</h2>
          <p>infoossabois@gmail.com</p>
          <h2>Reseaux sociaux</h2>
          <div className="footer-socials" aria-label="Reseaux sociaux">
            <span>f</span>
            <span>in</span>
            <span>ig</span>
          </div>
        </div>
        <div className="footer-question">
          <form>
            <label htmlFor="footer-email">Contact for any question</label>
            <div className="footer-form-row">
              <input id="footer-email" type="email" placeholder="E-mail" />
              <button type="button">Send</button>
            </div>
          </form>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>Copyright © 2025. Ossabois</span>
        <a href="https://www.icode-ks.com" target="_blank" rel="noreferrer">Made by iCode</a>
      </div>
    </footer>
  );
}
