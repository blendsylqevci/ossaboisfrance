import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPayload } from "payload";
import config from "@/payload.config";
import { HouseConfigurator } from "@/components/HouseConfigurator";
import { mapHouseDocToConfiguratorData } from "@/lib/house-mapper";
import { formatArchiveStartingPrice } from "@/data/houses-archive";
import { Locale } from "@/lib/i18n";

type HouseDetailPageProps = {
  params: Promise<{ locale: Locale; slug: string }>;
};

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

  if (slug === "emeraude-toiture-terrasse") {
    redirect(`/${locale}/maisons/emeraude-me-atike`);
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

  const configuratorConfig = mapHouseDocToConfiguratorData(houseDoc, globalOptions, mediaMap);

  // If it's a configurator house, render the visual configurator component
  if (configuratorConfig) {
    return <HouseConfigurator config={configuratorConfig} />;
  }

  // Otherwise, render the standard house detail page
  const price = formatArchiveStartingPrice(houseDoc.price60x160);
  const defaultImageUrl = typeof houseDoc.defaultImage === 'object' ? houseDoc.defaultImage?.url : '';
  const categoryName = typeof houseDoc.category === 'object' ? houseDoc.category?.name : '';

  return (
    <section className="house-detail-shell">
      <div className="container house-detail-back">
        <Link href={`/${locale}/maisons`}>← Modèles de Maisons</Link>
      </div>

      <div className="container house-detail-hero">
        <div className="house-detail-media">
          {defaultImageUrl && (
            <Image src={defaultImageUrl} alt={houseDoc.title} width={1400} height={930} priority sizes="(max-width: 980px) 100vw, 58vw" />
          )}
        </div>
        <div className="house-detail-copy">
          <p className="house-detail-category">{categoryName}</p>
          <h1>{houseDoc.title}</h1>
          <p>{houseDoc.description}</p>
          {price ? (
            <div className="house-detail-price">
              <span>à partir de</span>
              <strong>{price}&nbsp;€</strong>
            </div>
          ) : null}
          <div className="house-detail-status">
            <strong>Configurateur en préparation</strong>
            <p>
              Les données de cette maison sont importées depuis le CMS. Le configurateur visuel sera activé après
              chargement complet des calques graphiques.
            </p>
          </div>
          <Link className="house-detail-cta" href={`/${locale}/contact`}>
            Demander des informations
          </Link>
        </div>
      </div>
    </section>
  );
}
