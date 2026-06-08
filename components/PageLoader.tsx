import Image from "next/image";

type PageLoaderProps = {
  label?: string;
};

export function PageLoader({ label = "Chargement" }: PageLoaderProps) {
  return (
    <div className="page-loader" role="status" aria-live="polite" aria-busy="true">
      <div className="page-loader__inner">
        <div className="page-loader__logo" aria-hidden="true">
          <Image
            src="/images/brand/ossa-bois-logo.png"
            alt=""
            width={72}
            height={66}
            priority
          />
        </div>
        <div className="page-loader__track" aria-hidden="true">
          <span className="page-loader__bar" />
        </div>
        <p className="page-loader__label">{label}</p>
      </div>
    </div>
  );
}
