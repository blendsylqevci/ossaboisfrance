import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import { getComingSoonMessage } from "@/lib/coming-soon-copy";

type ComingSoonPageProps = {
  locale: Locale;
};

export function ComingSoonPage({ locale }: ComingSoonPageProps) {
  return (
    <div className="coming-soon">
      <div className="coming-soon__inner">
        <div className="coming-soon__logo" aria-hidden="true">
          <Image
            src="/images/brand/ossa-bois-logo.png"
            alt=""
            width={96}
            height={88}
            sizes="96px"
            quality={90}
            preload
          />
        </div>
        <p className="coming-soon__kicker">Ossa Bois France</p>
        <p className="coming-soon__message">{getComingSoonMessage(locale)}</p>
        <div className="coming-soon__track" aria-hidden="true">
          <span className="coming-soon__bar" />
        </div>
      </div>
    </div>
  );
}
