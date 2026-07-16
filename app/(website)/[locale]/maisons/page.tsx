import { getPayload } from "payload";
import config from "@/payload.config";
import { HousesArchive, CMSHouseItem, CMSCategoryItem } from "@/components/HousesArchive";
import { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { translateText, translateHouseDescription } from "@/lib/translation-helper";
import { Metadata } from "next";
import { calculateStructureSizePrice } from "@/lib/house-mapper";
import { getPlanimetryRooms } from "@/lib/planimetry-rooms";
import { getPlanimetryImageCropRight } from "@/lib/planimetry-visual-crop";
import { isPublishedHousePrice } from "@/lib/price-availability";


// ISR: cached and revalidated on a 600s safety window; Payload house/option
// edits trigger on-demand revalidation (see lib/revalidate-house.ts).
export const revalidate = 600;
export const dynamicParams = true;

type HousesPageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: HousesPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const titles = {
    fr: "Modèles de Maisons Ossature Bois | Ossa Bois France",
    en: "Timber Frame House Models | Ossa Bois France",
    de: "Holzrahmenhaus-Modelle | Ossa Bois France",
    nl: "Houtskelet Huismodellen | Ossa Bois France",
  };

  const descriptions = {
    fr: "Découvrez nos modèles de maisons modulaires contemporaines à ossature bois de haute performance thermique conformes à la RE2020.",
    en: "Discover our high thermal performance modular timber frame contemporary house models conforming to RE2020.",
    de: "Entdecken Sie unsere energieeffizienten modularen Holzrahmenhäuser nach dem aktuellen Energiestandard RE2020.",
    nl: "Ontdek onze hoogwaardige modulaire houtskeletwoningmodellen conform de RE2020-normen.",
  };

  const title = titles[locale] || titles.fr;
  const description = descriptions[locale] || descriptions.fr;

  return {
    title,
    description,
    alternates: {
      canonical: `https://ossaboisfrance.com/${locale}/maisons`,
      languages: {
        fr: `https://ossaboisfrance.com/fr/maisons`,
        en: `https://ossaboisfrance.com/en/maisons`,
        de: `https://ossaboisfrance.com/de/maisons`,
        nl: `https://ossaboisfrance.com/nl/maisons`,
      }
    },
    openGraph: {
      title,
      description,
      url: `https://ossaboisfrance.com/${locale}/maisons`,
      type: "website",
    }
  };
}

export default async function HousesPage({ params }: HousesPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  const payload = await getPayload({ config });
  
  // Fetch categories
  const categoriesRes = await payload.find({
    collection: 'house-categories',
    limit: 100,
    locale: locale,
  });

  // Fetch houses with depth 1 to populate media and categories
  const housesRes = await payload.find({
    collection: 'houses',
    limit: 100,
    depth: 1,
    locale: locale,
  });

  // Fetch global house options to get the global margin percentage
  let globalOptions = null;
  try {
    globalOptions = await payload.findGlobal({
      slug: 'house-options',
      locale: locale,
    });
  } catch (error) {
    console.error('Failed to fetch global house options on archive:', error);
  }
  const globalMargin = globalOptions?.marginPercent ?? 40;

  const categoryOrder = [
    "maison-toitu-terrasse",
    "maison-sans-faitage",
    "maison-plein-pied",
    "maison-combles-ammenageable",
    "maison-avec-etage"
  ];

  const categorySlugToKey: Record<string, string> = {
    "maison-toitu-terrasse": "terrace",
    "maison-sans-faitage": "terraceEtage",
    "maison-plein-pied": "plainPied",
    "maison-combles-ammenageable": "combles",
    "maison-avec-etage": "etage"
  };

  // Map to client-friendly props
  const categories: CMSCategoryItem[] = categoriesRes.docs
    .map((doc) => {
      const key = categorySlugToKey[doc.slug];
      const categoriesObj = dict.header?.categories as Record<string, string> | undefined;
      const translatedTitle = key && categoriesObj?.[key] ? categoriesObj[key] : translateText(doc.name, locale);
      return {
        id: doc.slug,
        title: translatedTitle,
        slug: doc.slug,
      };
    })
    .sort((a, b) => {
      const idxA = categoryOrder.indexOf(a.id);
      const idxB = categoryOrder.indexOf(b.id);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });

  const houses: CMSHouseItem[] = housesRes.docs.map((doc) => {
    const imageUrl = typeof doc.defaultImage === 'object' ? doc.defaultImage?.url : '';
    const finalImageUrl = typeof doc.finalImage === 'object' ? doc.finalImage?.url : '';
    const planimetryUrl = typeof doc.planimetry === 'object' ? doc.planimetry?.url : '';
    const planimetryVisualUrl =
      typeof doc.planimetryVisual === 'object' ? doc.planimetryVisual?.url : '';
    const catObj = typeof doc.category === 'object' ? doc.category : null;
    
    const neto = doc.perdhesa?.neto || 0;
    const rawPrice = isPublishedHousePrice(doc.price60x160)
      ? calculateStructureSizePrice(
          "60x160",
          neto,
          doc.price60x160,
          globalOptions?.priceRate60x160,
          globalOptions?.priceRate60x200
        )
      : null;
    const marginMultiplier = 1 + (doc.marginPercent ?? globalMargin) / 100;
    const finalPrice = rawPrice !== null ? rawPrice * marginMultiplier : null;
    
    return {
      slug: doc.slug,
      title: translateText(doc.title, locale),
      categoryName: translateText(catObj?.name || 'Maison', locale),
      categorySlug: catObj?.slug || '',
      description: translateHouseDescription(doc.description || doc.subheading || '', doc.slug, locale),
      image: imageUrl || '',
      imageBardage: finalImageUrl || '',
      price60x160: finalPrice,
      neto: doc.perdhesa?.neto || null,
      bruto: doc.perdhesa?.bruto || null,
      planimetry: planimetryUrl || null,
      planimetryVisual: planimetryVisualUrl || null,
      planimetryImageCropRight: getPlanimetryImageCropRight(doc.slug),
      planimetryRooms: getPlanimetryRooms(doc.slug, doc.planimetryDetails, locale),
    };
  });

  return (
    <HousesArchive 
      locale={locale} 
      initialHouses={houses} 
      initialCategories={categories} 
      dict={dict.archive}
    />
  );
}
