import Image from "next/image";
import { Locale } from "@/lib/i18n";

type RealisationsPageProps = {
  params: Promise<{ locale: Locale }>;
};

const galleryImages = [
  {
    src: "https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-7-scaled.jpg",
    alt: "Australe - Vue extérieure",
    category: "Toiture terrasse"
  },
  {
    src: "https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-1-scaled.jpg",
    alt: "Australe - Vue intérieure",
    category: "Toiture terrasse"
  },
  {
    src: "https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-2-scaled.jpg",
    alt: "Australe - Salon",
    category: "Toiture terrasse"
  },
  {
    src: "https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-3-scaled.jpg",
    alt: "Australe - Cuisine",
    category: "Toiture terrasse"
  },
  {
    src: "https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-4-scaled.jpg",
    alt: "Australe - Chambre",
    category: "Toiture terrasse"
  },
  {
    src: "https://ossaboisfrance.com/wp-content/uploads/2025/12/australe-5-scaled.jpg",
    alt: "Australe - Salle de bain",
    category: "Toiture terrasse"
  },
  {
    src: "https://ossaboisfrance.com/wp-content/uploads/2025/12/7-boreale-scaled.jpg",
    alt: "Boreale - Vue extérieure",
    category: "Toiture terrasse"
  },
  {
    src: "https://ossaboisfrance.com/wp-content/uploads/2025/12/7-CALME-scaled.jpg",
    alt: "Maison Calme - Vue extérieure",
    category: "Toiture terrasse"
  },
  {
    src: "https://ossaboisfrance.com/wp-content/uploads/2025/12/7-ambre-scaled.jpg",
    alt: "Ambre - Vue extérieure",
    category: "Toiture terrasse"
  },
  {
    src: "https://ossaboisfrance.com/wp-content/uploads/2025/12/LOREN-7-scaled.jpg",
    alt: "Maison Loren - Vue extérieure",
    category: "Toiture terrasse"
  },
  {
    src: "https://ossaboisfrance.com/wp-content/uploads/2025/12/EMMY-7-scaled.jpg",
    alt: "Maison Emmy - Vue extérieure",
    category: "Avec étage"
  },
  {
    src: "https://ossaboisfrance.com/wp-content/uploads/2025/12/cristal-comble-7-scaled.jpg",
    alt: "Cristal - Vue extérieure",
    category: "Combles aménageables"
  }
];

export default async function RealisationsPage({ params }: RealisationsPageProps) {
  const { locale } = await params;
  void locale;

  return (
    <section className="realisations-page">
      <div className="container">
        <h1>Nos réalisations</h1>
        <p className="realisations-subtitle">
          Découvrez nos projets de maisons modulaires à ossature bois, livrées et installées à
          travers l&apos;Europe.
        </p>
      </div>

      <div className="container gallery-grid">
        {galleryImages.map((image, index) => (
          <div className="gallery-item" key={index}>
            <Image
              src={image.src}
              alt={image.alt}
              width={800}
              height={530}
              sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 30vw"
            />
            <div className="gallery-item-overlay">
              <span className="gallery-item-category">{image.category}</span>
              <span className="gallery-item-alt">{image.alt}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
