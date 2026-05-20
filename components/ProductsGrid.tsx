"use client";

import Image from "next/image";
import Link from "next/link";
import { formatArchiveStartingPrice } from "@/data/houses-archive";

type House = {
  slug: string;
  title: string;
  description: string;
  image: string;
  price60x160?: number | null;
};

type ProductsGridProps = {
  houses: House[];
  locale: string;
};

export function ProductsGrid({ houses, locale }: ProductsGridProps) {
  return (
    <div className="products-layout-wrapper">
      <div className="products-grid-container">
        {houses.map((house) => {
          return (
            <div className="prod-card" key={house.slug}>
              <div className="prod-card-img-container">
                <Image
                  src={house.image}
                  alt={house.title}
                  width={380}
                  height={320}
                  style={{ objectFit: "cover", width: "100%", height: "320px" }}
                />
              </div>
              <div className="prod-card-content">
                <div>
                  <h3 className="prod-card-title">{house.title}</h3>
                  <p className="prod-card-desc">{house.description}</p>
                </div>
                
                <div className="prod-card-footer">
                  {(() => {
                    const formattedPrice = formatArchiveStartingPrice(house.price60x160);
                    return formattedPrice ? (
                      <div className="prod-card-price-row">
                        <span className="prod-price-label">À partir de</span>
                        <span className="prod-price-val">{formattedPrice} €</span>
                      </div>
                    ) : (
                      // Keep spacing empty so buttons align nicely
                      <div className="prod-card-price-row" style={{ minHeight: "24px" }} />
                    );
                  })()}
                  
                  <Link
                    href={`/${locale}/maisons/${house.slug}`}
                    className="prod-card-button"
                  >
                    <span>View & Configure</span>
                    <svg className="prod-btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
