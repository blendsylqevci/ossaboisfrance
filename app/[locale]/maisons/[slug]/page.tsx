import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatArchiveStartingPrice, findArchiveHouse, houseArchiveItems } from "@/data/houses-archive";
import { Locale } from "@/lib/i18n";

type HouseDetailPageProps = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export function generateStaticParams() {
  return houseArchiveItems
    .filter((house) => !["ambre", "ambre-sans-faitage", "maison-calme", "asebra", "boreale", "asebra-me-kulm", "maison-enea-me-kulm", "escape-villa-me-atike"].includes(house.slug))
    .map((house) => ({
      slug: house.slug
    }));
}

export default async function HouseDetailPage({ params }: HouseDetailPageProps) {
  const { locale, slug } = await params;
  const house = findArchiveHouse(slug);

  if (!house || ["ambre", "ambre-sans-faitage", "maison-calme", "asebra", "boreale", "asebra-me-kulm", "maison-enea-me-kulm", "escape-villa-me-atike"].includes(house.slug)) {
    notFound();
  }

  const price = formatArchiveStartingPrice(house.price60x160);

  return (
    <section className="house-detail-shell">
      <div className="container house-detail-back">
        <Link href={`/${locale}/maisons`}>← Modèles de Maisons</Link>
      </div>

      <div className="container house-detail-hero">
        <div className="house-detail-media">
          <Image src={house.image} alt={house.title} width={1400} height={930} priority sizes="(max-width: 980px) 100vw, 58vw" />
        </div>
        <div className="house-detail-copy">
          <p className="house-detail-category">{house.category}</p>
          <h1>{house.title}</h1>
          <p>{house.description}</p>
          {price ? (
            <div className="house-detail-price">
              <span>à partir de</span>
              <strong>{price}&nbsp;€</strong>
            </div>
          ) : null}
          <div className="house-detail-status">
            <strong>Configurateur en préparation</strong>
            <p>
              Les données de cette maison sont importées depuis WordPress. Le configurateur visuel sera activé après
              confirmation des layers et options ACF pour ce modèle.
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
