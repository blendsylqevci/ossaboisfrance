"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Locale, localeLabels, locales } from "@/lib/i18n";

type SiteHeaderProps = {
  locale: Locale;
};

const houseNav = [
  { href: "maisons#maison-toitu-terrasse", label: "Maisons à toiture terrasse" },
  { href: "maisons#maison-sans-faitage", label: "Maisons à toiture terrasse avec étage" },
  { href: "maisons#maison-plein-pied", label: "Maisons de plain-pied" },
  { href: "maisons#maison-combles-ammenageable", label: "Maisons avec combles aménageables" },
  { href: "maisons#maison-avec-etage", label: "Maisons avec étage" }
];

export function SiteHeader({ locale }: SiteHeaderProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "") {
      return pathname === `/${locale}` || pathname === `/${locale}/` || pathname === "/" || pathname === "";
    }
    return pathname.includes(`/${locale}/${path}`) || pathname.includes(`/${path}`);
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href={`/${locale}`} className="brand-link" aria-label="Ossa Bois France">
          <Image src="/images/brand/ossa-bois-logo.png" alt="" width={86} height={78} priority />
        </Link>
        <nav className="main-nav" aria-label="Navigation principale">
          <Link href={`/${locale}`} className={isActive("") ? "active" : ""}>
            Accueil
          </Link>
          
          <div className="nav-dropdown">
            <Link className={`nav-dropdown-trigger ${isActive("maisons") ? "active" : ""}`} href={`/${locale}/maisons`}>
              <span>Modèles De Maisons</span>
              <span className="dropdown-arrow-indicator">▼</span>
            </Link>
            <div className="nav-dropdown-panel">
              {houseNav.map((item) => (
                <Link key={item.href} href={`/${locale}/${item.href}`}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <Link href={`/${locale}/qui-sommes-nous`} className={isActive("qui-sommes-nous") ? "active" : ""}>
            Qui Sommes-Nous
          </Link>
          
          <Link href={`/${locale}/b2b`} className={isActive("b2b") ? "active" : ""}>
            B2B
          </Link>

          <Link href={`/${locale}/realisations`} className={isActive("realisations") ? "active" : ""}>
            Réalisations
          </Link>
        </nav>
        
        <div className="header-actions">
          <div className="locale-switcher" aria-label="Changer de langue">
            {locales.map((item) => (
              <Link key={item} href={`/${item}`} aria-current={item === locale ? "page" : undefined}>
                {localeLabels[item]}
              </Link>
            ))}
          </div>
          <Link className="button secondary header-contact-btn" href={`/${locale}/contact`}>
            Contactez-Nous
          </Link>
          <details className="mobile-menu">
            <summary aria-label="Ouvrir le menu">
              <span />
              <span />
              <span />
            </summary>
            <div className="mobile-menu-panel">
              <Link href={`/${locale}`}>Accueil</Link>
              <Link href={`/${locale}/maisons`}>Modèles de Maisons</Link>
              {houseNav.map((item) => (
                <Link key={item.href} href={`/${locale}/${item.href}`}>
                  {item.label}
                </Link>
              ))}
              <Link href={`/${locale}/qui-sommes-nous`}>Qui Sommes-Nous</Link>
              <Link href={`/${locale}/b2b`}>B2B</Link>
              <Link href={`/${locale}/realisations`}>Réalisations</Link>
              <Link className="mobile-menu-contact" href={`/${locale}/contact`}>
                Contactez-Nous
              </Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
