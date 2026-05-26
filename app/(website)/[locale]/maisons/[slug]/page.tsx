import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPayload } from "payload";
import config from "@/payload.config";
import { HouseConfigurator } from "@/components/HouseConfigurator";
import { mapHouseDocToConfiguratorData } from "@/lib/house-mapper";
import { formatArchiveStartingPrice } from "@/data/houses-archive";
import { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { translateText, translateHouseDescription } from "@/lib/translation-helper";
import { HouseTitleDispatcher } from "@/components/HouseTitleDispatcher";
import { Metadata } from "next";

const slugRedirects: Record<string, string> = {
  "emeraude-toiture-terrasse": "emeraude-avec-attique",
  "emeraude-me-atike": "emeraude-avec-attique",
  "flora-me-atike": "flora-avec-attique",
  "france-etage-me-atike": "france-etage-avec-attique",
  "liberte-etage-me-atike": "liberte-etage-avec-attique",
  "enea-me-atike": "enea-avec-attique",
  "forest-side-cabin-me-atike": "forest-side-cabin-avec-attique",
  "monna-me-atike": "monna-avec-attique",
  "ambre-me-atike": "ambre-avec-attique",
  "boreale-me-atike": "boreale-avec-attique",
  "asebra-me-atike": "asebra-avec-attique",
  "maison-enea-me-kulm": "enea-avec-toit",
  "asebra-me-kulm": "asebra-avec-toit",
  "calme-me-atike": "calme-avec-attique",
  "escape-villa-me-atike": "escape-villa-avec-attique",
  "melodie-me-atike": "melodie-avec-attique",
  "palma-etage-me-atike": "palma-etage-avec-attique",
  "regence-me-atike": "regence-avec-attique",
  "sira-me-atike": "sira-avec-attique",
  "symphonie-me-atike": "symphonie-avec-attique",
  "marinela-me-atike": "marinela-avec-attique",
  "maison-2-etage-me-atike": "maison-2-etages-avec-attique",
};

export const dynamic = "force-dynamic";

type HouseDetailPageProps = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateMetadata({ params }: HouseDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  
  // Resolve redirected slugs for metadata to prevent indexing duplicate pages
  const resolvedSlug = slugRedirects[slug] || slug;

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: 'houses',
      where: { slug: { equals: resolvedSlug } },
      locale: locale,
    });

    if (result.totalDocs === 0) return {};

    const houseDoc = result.docs[0];
    const rawTitle = typeof houseDoc.title === 'string' ? houseDoc.title : 'Maison';
    const translatedTitle = translateText(rawTitle, locale);
    
    const pageTitle = `${translatedTitle} | Ossa Bois France`;
    const descriptionText = translateHouseDescription(
      houseDoc.description || houseDoc.subheading || '',
      resolvedSlug,
      locale
    );

    const imageUrl = typeof houseDoc.defaultImage === 'object' ? houseDoc.defaultImage?.url : '';

    return {
      title: pageTitle,
      description: descriptionText,
      alternates: {
        canonical: `https://ossaboisfrance.com/${locale}/maisons/${resolvedSlug}`,
        languages: {
          fr: `https://ossaboisfrance.com/fr/maisons/${resolvedSlug}`,
          en: `https://ossaboisfrance.com/en/maisons/${resolvedSlug}`,
          de: `https://ossaboisfrance.com/de/maisons/${resolvedSlug}`,
          nl: `https://ossaboisfrance.com/nl/maisons/${resolvedSlug}`,
        }
      },
      openGraph: {
        title: pageTitle,
        description: descriptionText,
        url: `https://ossaboisfrance.com/${locale}/maisons/${resolvedSlug}`,
        images: imageUrl ? [{ url: imageUrl }] : [],
        type: "website",
      }
    };
  } catch (e) {
    console.error('Failed to generate metadata:', e);
    return {};
  }
}

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config });
    const houses = await payload.find({
      collection: 'houses',
      limit: 100,
      select: { slug: true }
    });
    return houses.docs.map((doc) => ({
      slug: doc.slug,
    }));
  } catch (e) {
    console.error('Failed to generate static params:', e);
    return [];
  }
}

export default async function HouseDetailPage({ params }: HouseDetailPageProps) {
  const { locale, slug } = await params;
  const dict = await getDictionary(locale);

  // Perform permanent 308 redirect if the requested slug is an old one
  const targetNewSlug = slugRedirects[slug];
  if (targetNewSlug) {
    permanentRedirect(`/${locale}/maisons/${targetNewSlug}`);
  }
  
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'houses',
    where: { slug: { equals: slug } },
    locale: locale,
  });

  if (result.totalDocs === 0) {
    notFound();
  }

  const houseDoc = result.docs[0];
  
  // Fetch global house options to propagate dynamic pricing and metadata
  let globalOptions = null;
  try {
    globalOptions = await payload.findGlobal({
      slug: 'house-options',
      locale: locale,
      depth: 2,
    });
  } catch (error) {
    console.error('Failed to fetch global house options:', error);
  }

  // Pre-fetch house-specific overridden media URLs from dynamicFieldsConfig
  const mediaMap: Record<string, string> = {};
  const configObj = houseDoc.dynamicFieldsConfig
    ? typeof houseDoc.dynamicFieldsConfig === 'string'
      ? JSON.parse(houseDoc.dynamicFieldsConfig)
      : houseDoc.dynamicFieldsConfig
    : {};

  const mediaIds: string[] = [];
  for (const fieldSlug in configObj) {
    const fieldConf = configObj[fieldSlug];
    if (fieldConf && fieldConf.enabled && fieldConf.options) {
      for (const layerKey in fieldConf.options) {
        const mediaId = fieldConf.options[layerKey];
        if (mediaId && typeof mediaId === 'string') {
          mediaIds.push(mediaId);
        }
      }
    }
  }

  if (mediaIds.length > 0) {
    try {
      const mediaDocs = await payload.find({
        collection: 'media',
        where: {
          id: {
            in: mediaIds,
          },
        },
        limit: mediaIds.length,
        depth: 0,
      });
      if (mediaDocs && mediaDocs.docs) {
        mediaDocs.docs.forEach((doc: any) => {
          mediaMap[doc.id] = doc.url || '';
        });
      }
    } catch (err) {
      console.error('Failed to pre-fetch override media docs:', err);
    }
  }

  const configuratorConfig = mapHouseDocToConfiguratorData(houseDoc, globalOptions, mediaMap, locale);

  // If it's a configurator house, render the visual configurator component
  if (configuratorConfig) {
    return <HouseConfigurator config={configuratorConfig} locale={locale} dict={dict.configurator} />;
  }

  // Otherwise, render the standard house detail page
  const globalMargin = globalOptions?.marginPercent ?? 40;
  const marginMultiplier = 1 + (houseDoc.marginPercent ?? globalMargin) / 100;
  const rawPrice = houseDoc.price60x160 || null;
  const finalPrice = rawPrice ? rawPrice * marginMultiplier : null;
  const price = formatArchiveStartingPrice(finalPrice);
  const defaultImageUrl = typeof houseDoc.defaultImage === 'object' ? houseDoc.defaultImage?.url : '';
  const categoryName = typeof houseDoc.category === 'object' ? houseDoc.category?.name : '';

  const translatedCategoryName = translateText(categoryName, locale);
  const translatedTitle = translateText(houseDoc.title, locale);
  const translatedDescription = translateHouseDescription(houseDoc.description || houseDoc.subheading || '', houseDoc.slug, locale);

  return (
    <section className="house-detail-shell">
      <HouseTitleDispatcher title={translatedTitle} />
      <div className="container house-detail-back">
        <Link href={`/${locale}/maisons`}>← {dict.configurator.labels.backToModels}</Link>
      </div>

      <div className="container house-detail-hero">
        <div className="house-detail-media">
          {defaultImageUrl && (
            <Image src={defaultImageUrl} alt={translatedTitle} width={1400} height={930} priority sizes="(max-width: 980px) 100vw, 58vw" />
          )}
        </div>
        <div className="house-detail-copy">
          <p className="house-detail-category">{translatedCategoryName}</p>
          <h1>{translatedTitle}</h1>
          <p>{translatedDescription}</p>
          {price ? (
            <div className="house-detail-price">
              <span>{dict.configurator.startingPrice}</span>
              <strong>{price}&nbsp;€</strong>
            </div>
          ) : null}
          <div className="house-detail-status">
            <strong>{dict.configurator.labels.configuratorPrep}</strong>
            <p>
              {dict.configurator.labels.configuratorPrepDesc}
            </p>
          </div>
          <Link className="house-detail-cta" href={`/${locale}/contact`}>
            {dict.configurator.labels.askQuote}
          </Link>
        </div>
      </div>
    </section>
  );
}
