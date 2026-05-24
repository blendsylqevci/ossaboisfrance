"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Locale, localeLabels, locales } from "@/lib/i18n";

type SiteHeaderProps = {
  locale: Locale;
  dict: any;
};

export function SiteHeader({ locale, dict }: SiteHeaderProps) {
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);

  const houseNav = [
    { href: "maisons#maison-toitu-terrasse", label: dict?.categories?.terrace || "Maisons à toiture terrasse" },
    { href: "maisons#maison-sans-faitage", label: dict?.categories?.terraceEtage || "Maisons à toiture terrasse avec étage" },
    { href: "maisons#maison-plein-pied", label: dict?.categories?.plainPied || "Maisons de plain-pied" },
    { href: "maisons#maison-combles-ammenageable", label: dict?.categories?.combles || "Maisons avec combles aménageables" },
    { href: "maisons#maison-avec-etage", label: dict?.categories?.etage || "Maisons avec étage" }
  ];

  // Disable default browser scroll restoration on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Force scroll to top on homepage path changes
  useEffect(() => {
    if (pathname === `/${locale}` || pathname === `/${locale}/` || pathname === "/") {
      window.scrollTo(0, 0);
    }
  }, [pathname, locale]);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === `/${locale}` || pathname === `/${locale}/` || pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const isActive = (path: string) => {
    if (path === "") {
      return pathname === `/${locale}` || pathname === `/${locale}/` || pathname === "/" || pathname === "";
    }
    return pathname.includes(`/${locale}/${path}`) || pathname.includes(`/${path}`);
  };

  const closeMobileMenu = () => {
    if (mobileMenuRef.current) {
      mobileMenuRef.current.removeAttribute("open");
    }
  };

  const getLocalePath = (targetLocale: Locale) => {
    if (!pathname) return `/${targetLocale}`;
    const segments = pathname.split("/");
    if (segments.length < 2) return `/${targetLocale}`;
    segments[1] = targetLocale;
    return segments.join("/");
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href={`/${locale}`} className="brand-link" aria-label="Ossa Bois France" onClick={handleLogoClick}>
          <Image src="/images/brand/ossa-bois-logo.png" alt="" width={86} height={78} priority />
        </Link>
        <nav className="main-nav" aria-label="Navigation principale">
          <Link href={`/${locale}`} className={isActive("") ? "active" : ""} onClick={handleLogoClick}>
            {dict?.home || "Accueil"}
          </Link>
          
          <div className="nav-dropdown">
            <Link className={`nav-dropdown-trigger ${isActive("maisons") ? "active" : ""}`} href={`/${locale}/maisons`}>
              <span>{dict?.models || "Modèles De Maisons"}</span>
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
            {dict?.about || "Qui Sommes-Nous"}
          </Link>
          
          <Link href={`/${locale}/b2b`} className={isActive("b2b") ? "active" : ""}>
            {dict?.b2b || "B2B"}
          </Link>

          <Link href={`/${locale}/realisations`} className={isActive("realisations") ? "active" : ""}>
            {dict?.realisations || "Réalisations"}
          </Link>
        </nav>
        
        <div className="header-actions">
          <div className="locale-switcher" aria-label="Changer de langue">
            {locales.map((item) => (
              <Link key={item} href={getLocalePath(item)} aria-current={item === locale ? "page" : undefined}>
                {localeLabels[item]}
              </Link>
            ))}
          </div>
          <Link className="button secondary header-contact-btn" href={`/${locale}/contact`}>
            {dict?.contactUs || "Contactez-Nous"}
          </Link>
          <details className="mobile-menu" ref={mobileMenuRef}>
            <summary aria-label="Ouvrir le menu">
              <span />
              <span />
              <span />
            </summary>
            <div className="mobile-menu-panel">
              <Link href={`/${locale}`} onClick={closeMobileMenu}>{dict?.home || "Accueil"}</Link>
              <details className="mobile-menu-submenu">
                <summary className="mobile-submenu-trigger">
                  <span>{dict?.models || "Modèles de Maisons"}</span>
                  <svg className="submenu-arrow-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </summary>
                <div className="mobile-submenu-content">
                  <Link href={`/${locale}/maisons`} className="mobile-submenu-all-link" onClick={closeMobileMenu}>
                    {dict?.allModels || "Tous les modèles"}
                  </Link>
                  {houseNav.map((item) => (
                    <Link key={item.href} href={`/${locale}/${item.href}`} onClick={closeMobileMenu}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>
              <Link href={`/${locale}/qui-sommes-nous`} onClick={closeMobileMenu}>{dict?.about || "Qui Sommes-Nous"}</Link>
              <Link href={`/${locale}/b2b`} onClick={closeMobileMenu}>{dict?.b2b || "B2B"}</Link>
              <Link href={`/${locale}/realisations`} onClick={closeMobileMenu}>{dict?.realisations || "Réalisations"}</Link>
              <Link className="mobile-menu-contact" href={`/${locale}/contact`} onClick={closeMobileMenu}>
                {dict?.contactUs || "Contactez-Nous"}
              </Link>
              <div className="mobile-locale-switcher">
                <div className="mobile-locale-switcher-inner">
                  {locales.map((item) => (
                    <Link key={item} href={getLocalePath(item)} className={item === locale ? "active" : ""} onClick={closeMobileMenu}>
                      {localeLabels[item].toUpperCase()}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
