'use client'

import React from 'react'
import { useField, useFormFields } from '@payloadcms/ui'

interface StoredSelection {
  house?: {
    name?: string;
    id?: string;
    image?: string;
  };
  size?: {
    value?: string;
    price?: string;
    image?: string;
  };
  currentImage?: string;
  isolation?: { value?: string };
  outerIsolation?: { value?: string };
  facade?: { value?: string };
  etancheite?: { value?: string };
  toiture?: { value?: string };
  etancheiteTerrasse?: { value?: string };
  strukturaPlloqes?: { value?: string };
  izolimiPlloqes?: { value?: string };
  dritaret?: { value?: string };
  totalPrice?: number;
  priceBreakdown?: Array<{ label: string; value: number }>;
  perdhesa?: Record<string, number | string>;
}

const PERDHESA_LABELS: Record<string, string> = {
  bruto: "Surface Brute",
  neto: "Surface Nette",
  mure_te_jashtme: "Murs Extérieurs",
  mure_mbajtese: "Murs Porteurs",
  mure_ndarese: "Murs Séparateurs",
  pllaka_e_kulmit: "Dalle de Toit",
  pllaka_e_katit_0: "Dalle d'Étage 0",
  pllaka_e_katit_1: "Dalle d'Étage 1",
  pllaka_e_katit_2: "Dalle d'Étage 2",
  pllaka_e_katit: "Dalle d'Étage",
  kulmi: "Toiture",
}

export const OrderSummaryView: React.FC<{ path: string }> = ({ path }) => {
  const { value } = useField<any>({ path })

  // Read other form fields using Payload's form state selectors
  const transportCostValue = useFormFields(([fields]) => fields.transportCost?.value)
  const totalPriceValue = useFormFields(([fields]) => fields.totalPrice?.value)

  if (!value) {
    return (
      <div style={{
        padding: '16px',
        border: '1.5px dashed var(--theme-elevation-150, #e2e8f0)',
        borderRadius: '6px',
        color: 'var(--theme-elevation-400, #94a3b8)',
        fontSize: '14px',
        textAlign: 'center'
      }}>
        Aucune configuration enregistrée pour cette commande.
      </div>
    )
  }

  // Parse if it's a string, otherwise use directly
  let selection: StoredSelection = {}
  try {
    selection = typeof value === 'string' ? JSON.parse(value) : value
  } catch (err) {
    console.error("Failed to parse selections JSON", err)
    return <pre style={{ fontSize: '12px', padding: '10px', background: '#fee2e2', color: '#991b1b' }}>{JSON.stringify(value, null, 2)}</pre>
  }

  const euroFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })

  const houseImageUrl = selection.currentImage || selection.house?.image

  // Calculate pricing components
  const shippingCost = transportCostValue !== undefined && transportCostValue !== null ? Number(transportCostValue) : 0
  const grandTotal = totalPriceValue !== undefined && totalPriceValue !== null ? Number(totalPriceValue) : (selection.totalPrice || 0) + shippingCost
  const housePrice = totalPriceValue !== undefined && totalPriceValue !== null ? grandTotal - shippingCost : (selection.totalPrice || 0)

  return (
    <div style={{
      background: 'var(--theme-elevation-50, #f8fafc)',
      border: '1px solid var(--theme-elevation-150, #e2e8f0)',
      borderRadius: '12px',
      padding: '24px',
      fontFamily: 'Segoe UI, system-ui, -apple-system, sans-serif',
      color: 'var(--theme-elevation-900, #1e293b)',
      marginTop: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '24px', borderBottom: '1px solid var(--theme-elevation-150, #e2e8f0)', paddingBottom: '20px' }}>
        {houseImageUrl && (
          <div style={{ flexShrink: 0, width: '160px', height: '110px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--theme-elevation-200, #cbd5e1)', background: '#fff' }}>
            <img 
              src={houseImageUrl} 
              alt={selection.house?.name || "House"} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}
        <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '700', color: 'var(--theme-elevation-900, #0f172a)' }}>
            {selection.house?.name || "Modèle personnalisé"}
          </h3>
          <div style={{ fontSize: '14px', color: 'var(--theme-elevation-600, #64748b)', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <span><strong>Dimensions:</strong> {selection.size?.value || 'Non spécifié'}</span>
            <span>• <strong>Montant de base:</strong> {euroFormatter.format(housePrice)}</span>
          </div>
        </div>
      </div>

      {/* Grid for customizations and specifications */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* Column 1: Configured Options */}
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '13.5px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--theme-elevation-400, #64748b)', fontWeight: '700' }}>
            Options Configurées
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
            <tbody>
              {selection.isolation?.value && (
                <tr style={{ borderBottom: '1px solid var(--theme-elevation-100, #f1f5f9)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--theme-elevation-500, #64748b)', fontWeight: '500' }}>Isolation</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600' }}>{selection.isolation.value}</td>
                </tr>
              )}
              {selection.outerIsolation?.value && (
                <tr style={{ borderBottom: '1px solid var(--theme-elevation-100, #f1f5f9)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--theme-elevation-500, #64748b)', fontWeight: '500' }}>Isolation Ext.</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600' }}>{selection.outerIsolation.value}</td>
                </tr>
              )}
              {selection.facade?.value && (
                <tr style={{ borderBottom: '1px solid var(--theme-elevation-100, #f1f5f9)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--theme-elevation-500, #64748b)', fontWeight: '500' }}>Façade / Revêtement</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600' }}>{selection.facade.value}</td>
                </tr>
              )}
              {selection.toiture?.value && (
                <tr style={{ borderBottom: '1px solid var(--theme-elevation-100, #f1f5f9)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--theme-elevation-500, #64748b)', fontWeight: '500' }}>Couverture de Toit</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600' }}>{selection.toiture.value}</td>
                </tr>
              )}
              {selection.dritaret?.value && (
                <tr style={{ borderBottom: '1px solid var(--theme-elevation-100, #f1f5f9)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--theme-elevation-500, #64748b)', fontWeight: '500' }}>Menuiseries (Fenêtres)</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600' }}>{selection.dritaret.value}</td>
                </tr>
              )}
              {selection.etancheite?.value && (
                <tr style={{ borderBottom: '1px solid var(--theme-elevation-100, #f1f5f9)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--theme-elevation-500, #64748b)', fontWeight: '500' }}>EPDM Option</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600' }}>{selection.etancheite.value}</td>
                </tr>
              )}
              {selection.etancheiteTerrasse?.value && (
                <tr style={{ borderBottom: '1px solid var(--theme-elevation-100, #f1f5f9)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--theme-elevation-500, #64748b)', fontWeight: '500' }}>Attic Polystyrene</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600' }}>{selection.etancheiteTerrasse.value}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Column 2: Architectural Details */}
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '13.5px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--theme-elevation-400, #64748b)', fontWeight: '700' }}>
            Détails Architecturaux
          </h4>
          {selection.perdhesa && Object.keys(selection.perdhesa).length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <tbody>
                {Object.entries(selection.perdhesa)
                  .filter(([_, val]) => val !== undefined && val !== null && val !== "" && Number(val) > 0)
                  .map(([key, val]) => {
                    const label = PERDHESA_LABELS[key] || key.replace(/_/g, ' ');
                    return (
                      <tr key={key} style={{ borderBottom: '1px solid var(--theme-elevation-100, #f1f5f9)' }}>
                        <td style={{ padding: '8px 0', color: 'var(--theme-elevation-500, #64748b)', textTransform: 'capitalize' }}>{label}</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600' }}>{val} m²</td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          ) : (
            <p style={{ fontSize: '13.5px', color: 'var(--theme-elevation-400, #94a3b8)', margin: 0, fontStyle: 'italic' }}>
              Aucune mesure spécifique disponible.
            </p>
          )}
        </div>

      </div>

      {/* Pricing Summary Card */}
      <div style={{
        marginTop: '28px',
        padding: '20px',
        background: 'var(--theme-elevation-100, #f1f5f9)',
        borderRadius: '8px',
        border: '1.5px dashed #5E6F4F',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '13.5px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--theme-elevation-500, #64748b)', fontWeight: '700' }}>
            Détails du Financement (TTC)
          </h4>
          <div style={{ fontSize: '13.5px', color: 'var(--theme-elevation-600, #475569)', display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '8px' }}>
            <span><strong>Montant Maison:</strong> {euroFormatter.format(housePrice)}</span>
            <span>• <strong>Frais de transport:</strong> {euroFormatter.format(shippingCost)}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: 'var(--theme-elevation-500, #64748b)', fontWeight: '600', textTransform: 'uppercase' }}>
            Total Général
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#5E6F4F', marginTop: '2px' }}>
            {euroFormatter.format(grandTotal)}
          </div>
        </div>
      </div>

      {/* Raw Data Toggle (for advanced view) */}
      <details style={{ marginTop: '24px', borderTop: '1px solid var(--theme-elevation-150, #e2e8f0)', paddingTop: '16px' }}>
        <summary style={{ fontSize: '12px', color: 'var(--theme-elevation-400, #64748b)', cursor: 'pointer', outline: 'none', userSelect: 'none' }}>
          Voir les données JSON brutes
        </summary>
        <pre style={{
          marginTop: '12px',
          fontSize: '11px',
          background: 'var(--theme-elevation-100, #0f172a)',
          color: 'var(--theme-elevation-800, #38bdf8)',
          padding: '16px',
          borderRadius: '6px',
          overflowX: 'auto',
          maxHeight: '250px'
        }}>
          {JSON.stringify(selection, null, 2)}
        </pre>
      </details>
    </div>
  )
}
