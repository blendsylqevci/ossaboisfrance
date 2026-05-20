import Image from "next/image";
import Link from "next/link";
import {
  formatArchiveStartingPrice,
  houseArchiveCategories,
  houseArchiveItems,
  HouseArchiveItem
} from "@/data/houses-archive";
import { Locale } from "@/lib/i18n";

type HousesArchiveProps = {
  locale: Locale;
};

function HouseCard({ house, locale }: { house: HouseArchiveItem; locale: Locale }) {
  const price = formatArchiveStartingPrice(house.price60x160);

  return (
    <article className="house-archive-card">
      <div className="house-archive-card-image">
        <Image src={house.image} alt={house.title} width={900} height={600} sizes="(max-width: 760px) 100vw, 33vw" />
      </div>
      <div className="house-archive-card-body">
        <h3>{house.title}</h3>
        <p>{house.description}</p>
        {price ? (
          <div className="house-archive-price">
            <span>à partir de</span>
            <strong>{price}&nbsp;€</strong>
          </div>
        ) : null}
        <Link className="house-archive-button" href={`/${locale}/maisons/${house.slug}`}>
          Voir et configurer
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

export function HousesArchive({ locale }: HousesArchiveProps) {
  return (
    <section className="houses-archive-page">
      <div className="container houses-archive-title-block">
        <h1>Modèles de Maisons</h1>
      </div>

      <div className="container archive-commitments">
        <div>
          <h2>Our commitments and guarantees</h2>
          <p>Every house built by Pobepo has all the builder&apos;s guarantees required by law, including ten-year insurance.</p>
        </div>
        <div>
          <h2>Our commitments and guarantees</h2>
          <p>Every house built by Pobepo has all the builder&apos;s guarantees required by law, including ten-year insurance.</p>
        </div>
      </div>

      {houseArchiveCategories.map((category) => {
        const houses = houseArchiveItems.filter((house) => house.category === category.sourceCategory);
        if (houses.length === 0) return null;
        return (
          <div className="container archive-house-section" id={category.id} key={category.id}>
            <h2>{category.title}</h2>
            <div className="house-archive-grid">
              {houses.map((house) => (
                <HouseCard key={house.slug} house={house} locale={locale} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
