"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Locale, localeLabels, locales } from "@/lib/i18n";
import { translateText } from "@/lib/translation-helper";
import { useFavorites } from "@/lib/favorites";
import { useSavedConfigurations } from "@/lib/saved-configs";

type SiteHeaderProps = {
  locale: Locale;
  dict: any;
};

const getCleanHouseName = (slug: string, locale: Locale) => {
  if (!slug) return "";
  const mapping: Record<string, string> = {
    "monna-avec-attique": "Monna",
    "diademe-toiture-terrasse": "Diadème",
    "cotage-toiture-terrasse": "Cotage",
    "asebra-avec-attique": "Asebra",
    "asebra-avec-toit": "Asebra",
    "ambre-avec-attique": "Ambre",
    "amethyste-me-kulm": "Amethyste",
    "boreale-avec-attique": "Boréale",
    "enea-avec-attique": "Enea",
    "enea-avec-toit": "Enea",
    "flora-avec-attique": "Flora",
    "azura-comble": "Azura",
    "nina-house": "Nina",
    "dianne": "Dianne",
    "forest-side-cabin-avec-attique": "Forest Side",
    "marinela-avec-attique": "Marinela",
    "maison-e": "Maison E",
    "maison-loren": "Maison Loren",
    "a-frame-house": "A-Frame",
    "sira-avec-attique": "Sira",
    "emeraude-toiture-terrasse": "Émeraude",
    "emeraude-avec-attique": "Émeraude",
    "emeraude-me-kulm": "Émeraude",
    "symphonie-avec-attique": "Symphonie",
    "australe": "Australe",
    "enea-toiture-terrasse": "Enea",
    "maison-2-etages-avec-attique": "Maison 2 Étages",
    "france-etage-avec-attique": "France",
    "liberte-etage-avec-attique": "Liberté",
    "flora-house": "Flora",
    "forest-side-cabin": "Forest Side",
    "france-etage": "France",
    "liberte-house": "Liberté",
    "maison-en-l": "Maison en L"
  };

  const baseName = mapping[slug] || slug
    .replace("-me-atike", "")
    .replace("-avec-attique", "")
    .replace("-avec-toit", "")
    .replace("-toiture-terrasse", "")
    .replace("-house", "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return translateText(baseName, locale);
};

export function SiteHeader({ locale, dict }: SiteHeaderProps) {
  const pathname = usePathname() || "";
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);
  
  const { favorites } = useFavorites();
  const { savedConfigs } = useSavedConfigurations();
  const totalFavoritesCount = favorites.length;
  const totalSavedConfigsCount = savedConfigs.length;

  const segments = pathname ? pathname.split("/") : [];
  const isHouseDetailPage = segments[2] === "maisons" && segments[3] && segments[3] !== "";
  const houseSlug = isHouseDetailPage ? segments[3] : "";

  const [houseTitle, setHouseTitle] = useState("");

  useEffect(() => {
    // 1. Set initial title using fallback from slug
    if (isHouseDetailPage && houseSlug) {
      setHouseTitle(getCleanHouseName(houseSlug, locale));
    } else {
      setHouseTitle("");
    }

    // 2. Event listener for precise database title updates
    const handleTitleLoaded = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setHouseTitle(customEvent.detail);
    };
    window.addEventListener("house-title-loaded", handleTitleLoaded);
    return () => {
      window.removeEventListener("house-title-loaded", handleTitleLoaded);
    };
  }, [isHouseDetailPage, houseSlug]);

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

  const handleHouseCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const archivePath = `/${locale}/maisons`;
    if (pathname === archivePath || pathname === `${archivePath}/`) {
      e.preventDefault();
      const hash = href.split("#")[1];
      if (hash) {
        const target = document.getElementById(hash);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
        const nextUrl = `${window.location.pathname}${window.location.search}#${hash}`;
        window.history.pushState(null, "", nextUrl);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
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
        {isHouseDetailPage && houseTitle && (
          <span className="mobile-header-house-title">
            {houseTitle}
          </span>
        )}
        <nav className="main-nav" aria-label="Navigation principale">
          <Link href={`/${locale}`} className={isActive("") ? "active" : ""} onClick={handleLogoClick}>
            {dict?.home || "Accueil"}
          </Link>
          
          <div className="nav-dropdown">
            <Link className={`nav-dropdown-trigger ${isActive("maisons") ? "active" : ""}`} href={`/${locale}/maisons`}>
              <span>{dict?.models || "Modèles De Maisons"}</span>
              <svg className="nav-dropdown-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <div className="nav-dropdown-panel">
              {houseNav.map((item) => (
                <Link 
                  key={item.href} 
                  href={`/${locale}/${item.href}`}
                  onClick={(e) => handleHouseCategoryClick(e, item.href)}
                >
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
          <div className="locale-dropdown" aria-label="Changer de langue">
            <button className="locale-dropdown-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
              <span>{localeLabels[locale]}</span>
              <svg className="locale-dropdown-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="locale-dropdown-panel">
              {locales.map((item) => (
                <Link 
                  key={item} 
                  href={getLocalePath(item)} 
                  className={`locale-dropdown-item ${item === locale ? "active" : ""}`}
                >
                  {localeLabels[item]}
                </Link>
              ))}
            </div>
          </div>

          <Link 
            href={`/${locale}/maisons?view=saves`} 
            className={`header-action-icon-btn saves-btn ${pathname.includes("view=saves") ? "active" : ""}`}
            title={locale === "en" ? "Your Saves" : locale === "de" ? "Gespeichert" : locale === "nl" ? "Je keuzes" : "Vos choix"}
            aria-label={locale === "en" ? "Your Saves" : locale === "de" ? "Gespeichert" : locale === "nl" ? "Je keuzes" : "Vos choix"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            {totalSavedConfigsCount > 0 && (
              <span className="header-action-badge">{totalSavedConfigsCount}</span>
            )}
          </Link>

          <Link 
            href={`/${locale}/maisons?view=favorites`} 
            className={`header-action-icon-btn fav-btn ${pathname.includes("view=favorites") ? "active" : ""}`}
            title={locale === "en" ? "Your Favorites" : locale === "de" ? "Favoriten" : locale === "nl" ? "Je favorieten" : "Vos favoris"}
            aria-label={locale === "en" ? "Your Favorites" : locale === "de" ? "Favoriten" : locale === "nl" ? "Je favorieten" : "Vos favoris"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {totalFavoritesCount > 0 && (
              <span className="header-action-badge">{totalFavoritesCount}</span>
            )}
          </Link>

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
                    <Link 
                      key={item.href} 
                      href={`/${locale}/${item.href}`} 
                      onClick={(e) => {
                        closeMobileMenu();
                        handleHouseCategoryClick(e, item.href);
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>
              <Link href={`/${locale}/qui-sommes-nous`} onClick={closeMobileMenu}>{dict?.about || "Qui Sommes-Nous"}</Link>
              <Link href={`/${locale}/b2b`} onClick={closeMobileMenu}>{dict?.b2b || "B2B"}</Link>
              <Link href={`/${locale}/realisations`} onClick={closeMobileMenu}>{dict?.realisations || "Réalisations"}</Link>
              {totalSavedConfigsCount > 0 && (
                <Link 
                  href={`/${locale}/maisons?view=saves`} 
                  onClick={closeMobileMenu}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ display: "inline-block", verticalAlign: "middle" }}>
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  {locale === "en" ? "Your Saves" : locale === "de" ? "Gespeichert" : locale === "nl" ? "Je keuzes" : "Vos choix"} ({totalSavedConfigsCount})
                </Link>
              )}
              {totalFavoritesCount > 0 && (
                <Link 
                  href={`/${locale}/maisons?view=favorites`} 
                  onClick={closeMobileMenu}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ display: "inline-block", verticalAlign: "middle" }}>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {locale === "en" ? "Your Favorites" : locale === "de" ? "Favoriten" : locale === "nl" ? "Favorieten" : "Vos favoris"} ({totalFavoritesCount})
                </Link>
              )}
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
