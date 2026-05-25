import { getPayload } from "payload";
import config from "@/payload.config";
import { HousesArchive, CMSHouseItem, CMSCategoryItem } from "@/components/HousesArchive";
import { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { translateText, translateHouseDescription } from "@/lib/translation-helper";

export const dynamic = "force-dynamic";

type HousesPageProps = {
  params: Promise<{ locale: Locale }>;
};

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
    const catObj = typeof doc.category === 'object' ? doc.category : null;
    
    const rawPrice = doc.price60x160 || null;
    const marginMultiplier = 1 + (doc.marginPercent ?? globalMargin) / 100;
    const finalPrice = rawPrice ? rawPrice * marginMultiplier : null;
    
    return {
      slug: doc.slug,
      title: translateText(doc.title, locale),
      categoryName: translateText(catObj?.name || 'Maison', locale),
      categorySlug: catObj?.slug || '',
      description: translateHouseDescription(doc.description || doc.subheading || '', doc.slug, locale),
      image: imageUrl || '',
      imageBardage: finalImageUrl || '',
      price60x160: finalPrice,
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
