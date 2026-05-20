"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";

type StoredSelection = {
  house?: {
    name?: string;
    image?: string;
  };
  size?: {
    value?: string;
  };
  totalPrice?: number;
  priceBreakdown?: Array<{ label: string; value: number }>;
};

const TRANSPORTATION_COST = 3000;

const euroFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export function CheckoutPage() {
  const [selection, setSelection] = useState<StoredSelection | null>(null);
  const [transport, setTransport] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("house_selections");
    if (!raw) return;
    try {
      // This is the client-only handoff from the configurator to checkout.
      setSelection(JSON.parse(raw) as StoredSelection);
    } catch {
      setSelection(null);
    }
  }, []);

  const basePrice = selection?.totalPrice ?? 0;
  const total = useMemo(() => basePrice + (transport ? TRANSPORTATION_COST : 0), [basePrice, transport]);

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(true);
    sessionStorage.removeItem("house_selections");
  }

  return (
    <div className={`checkout-page${success ? " success-showing" : ""}`}>
      <div className="checkout-container">
        <h1 className="checkout-title">Finalisation de la commande</h1>

        {success ? (
          <div id="success-message" className="success-message show">
            <div className="success-icon">✓</div>
            <h3>Merci pour votre commande&nbsp;!</h3>
            <p>Nous avons bien recu votre demande et nous vous contacterons sous peu.</p>
          </div>
        ) : (
          <div className="checkout-content">
            <div className="checkout-form-section">
              <form id="checkout-form" className="checkout-form-card" onSubmit={submitOrder}>
                <div className="form-section">
                  <h2 className="form-title">Informations de contact</h2>
                  <div className="form-row">
                    <div className="form-group form-group-half">
                      <label className="form-label">
                        Nom complet <span className="required">*</span>
                      </label>
                      <input className="form-input" name="full_name" required type="text" />
                    </div>
                    <div className="form-group form-group-half">
                      <label className="form-label">
                        Email <span className="required">*</span>
                      </label>
                      <input className="form-input" name="email" required type="email" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group form-group-half">
                      <label className="form-label">
                        Telephone <span className="required">*</span>
                      </label>
                      <input className="form-input" name="phone" required type="tel" />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h2 className="form-title">Adresse de livraison</h2>
                  <div className="form-row">
                    <div className="form-group form-group-full">
                      <label className="form-label">
                        Adresse (rue) <span className="required">*</span>
                      </label>
                      <input className="form-input" name="street_address" required type="text" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group form-group-half">
                      <label className="form-label">
                        Ville <span className="required">*</span>
                      </label>
                      <input className="form-input" name="city" required type="text" />
                    </div>
                    <div className="form-group form-group-half">
                      <label className="form-label">
                        Code postal <span className="required">*</span>
                      </label>
                      <input className="form-input" name="zip_code" required type="text" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group form-group-full">
                      <label className="form-label">
                        State/Region <span className="required">*</span>
                      </label>
                      <input className="form-input" name="state_region" required type="text" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group form-group-full">
                      <label className="form-label">Notes supplementaires</label>
                      <textarea className="form-textarea" name="notes" rows={3} />
                    </div>
                  </div>
                </div>

                <div className="form-section transportation-section">
                  <h2 className="transportation-title">Mode de transport</h2>
                  <label className={`transportation-label${transport ? " checked" : ""}`}>
                    <input
                      className="transportation-checkbox"
                      type="checkbox"
                      checked={transport}
                      onChange={(event) => setTransport(event.target.checked)}
                    />
                    <span className="transportation-custom-checkbox" />
                    <div className="transportation-content">
                      <div className="transportation-info">
                        <span className="transportation-name">Transport standard</span>
                        <span className="transportation-description">Livraison a votre adresse sous 15 a 20 jours</span>
                      </div>
                      <span className="transportation-price">{euroFormatter.format(TRANSPORTATION_COST)}</span>
                    </div>
                  </label>
                </div>
              </form>
            </div>

            <aside className="order-summary-card">
              <h2 className="order-summary-title">Order Summary</h2>
              {selection ? (
                <div className="order-details">
                  <div className="order-product-item">
                    <div className="order-product-details">
                      <div className="order-product-image">
                        <Image
                          src={selection.house?.image || "/images/houses/ambre/10 ambre.jpg"}
                          alt={selection.house?.name || "Maison"}
                          width={80}
                          height={80}
                        />
                      </div>
                      <div className="order-product-info">
                        <div className="order-product-name">{selection.house?.name || "Maison"}</div>
                        <div className="order-product-qty">Qty: 1 · {selection.size?.value}</div>
                      </div>
                      <div className="order-product-price">{euroFormatter.format(basePrice)}</div>
                    </div>
                  </div>
                  <div className="order-divider" />
                  <div className="order-price-row">
                    <span className="order-price-label">Subtotal</span>
                    <span className="order-price-value">{euroFormatter.format(basePrice)}</span>
                  </div>
                  <div className="order-price-row">
                    <span className="order-price-label">Shipping</span>
                    <span className="order-price-value">{euroFormatter.format(transport ? TRANSPORTATION_COST : 0)}</span>
                  </div>
                  <div className="order-divider" />
                  <div className="order-price-row order-total-row">
                    <span className="order-price-label">Total</span>
                    <span className="order-price-value order-total-price">{euroFormatter.format(total)}</span>
                  </div>
                </div>
              ) : (
                <p className="empty-order">No order data found. Please go back and select your options.</p>
              )}
              <div className="order-summary-footer">
                <button className="place-order-button" type="submit" form="checkout-form">
                  Place Order
                </button>
                <p className="terms-text">En passant votre commande, vous acceptez nos Conditions generales</p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
