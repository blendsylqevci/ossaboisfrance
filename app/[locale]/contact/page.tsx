import { Locale } from "@/lib/i18n";

type ContactPageProps = {
  params: Promise<{ locale: Locale }>;
};

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  void locale;

  return (
    <section className="contact-page">
      <div className="container">
        <h1>Contactez-nous</h1>
        <p className="contact-subtitle">
          Vous avez un projet de construction ? Une question sur nos maisons modulaires ?
          N&apos;hésitez pas à nous contacter, notre équipe vous répondra dans les plus brefs
          délais.
        </p>
      </div>

      <div className="container contact-grid">
        <div className="contact-form-section">
          <h2>Envoyez-nous un message</h2>
          <form className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact-firstname">Prénom</label>
                <input id="contact-firstname" type="text" name="firstname" required />
              </div>
              <div className="form-group">
                <label htmlFor="contact-lastname">Nom</label>
                <input id="contact-lastname" type="text" name="lastname" required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="contact-email">Email</label>
              <input id="contact-email" type="email" name="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="contact-phone">Téléphone</label>
              <input id="contact-phone" type="tel" name="phone" />
            </div>
            <div className="form-group">
              <label htmlFor="contact-subject">Sujet</label>
              <select id="contact-subject" name="subject">
                <option value="">Choisir un sujet</option>
                <option value="devis">Demande de devis</option>
                <option value="info">Demande d&apos;information</option>
                <option value="visite">Visite de l&apos;usine</option>
                <option value="b2b">Partenariat B2B</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="contact-message">Message</label>
              <textarea id="contact-message" name="message" rows={6} required />
            </div>
            <button className="button" type="submit">
              Envoyer le message
            </button>
          </form>
        </div>

        <div className="contact-info-section">
          <div className="contact-info-card">
            <h3>Notre adresse</h3>
            <p>50 rue Chanzy<br />28000 Chartres, France</p>
          </div>
          <div className="contact-info-card">
            <h3>Email</h3>
            <p>
              <a href="mailto:infoossabois@gmail.com">infoossabois@gmail.com</a>
            </p>
          </div>
          <div className="contact-info-card">
            <h3>Horaires</h3>
            <p>Lundi – Vendredi : 9h00 – 18h00<br />Samedi – Dimanche : Fermé</p>
          </div>
          <div className="contact-info-card">
            <h3>Réseaux sociaux</h3>
            <div className="contact-socials">
              <a href="#" aria-label="Facebook">Facebook</a>
              <a href="#" aria-label="LinkedIn">LinkedIn</a>
              <a href="#" aria-label="Instagram">Instagram</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
