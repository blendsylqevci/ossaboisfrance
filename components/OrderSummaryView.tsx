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
  selectedOptions?: Array<{
    categoryId?: string;
    categoryLabel?: string;
    optionId?: string;
    label?: string;
  }>;
  configurationSubtotal?: number;
  truckCount?: number;
  transportCost?: number;
  installationMode?: 'professional' | 'ossa';
  assemblyCost?: number;
  totalPrice?: number;
  priceBreakdown?: Array<{ label: string; value: number }>;
  perdhesa?: Record<string, number | string>;
}

const PERDHESA_LABELS: Record<string, string> = {
  bruto: "Bruto",
  neto: "Neto",
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

function getNonNegativeNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

function getPositiveInteger(value: unknown): number | null {
  const number = getNonNegativeNumber(value)
  return number !== null && number > 0 && Number.isInteger(number) ? number : null
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  const houseImageUrl = selection.currentImage || selection.house?.image

  // New orders carry a server-authored breakdown in selections. The top-level
  // order fields remain useful as a fallback for historical records.
  const storedSelectionTotal = getNonNegativeNumber(selection.totalPrice)
  const topLevelTotal = getNonNegativeNumber(totalPriceValue)
  const shippingCost =
    getNonNegativeNumber(selection.transportCost) ??
    getNonNegativeNumber(transportCostValue) ??
    0
  const assemblyCost = getNonNegativeNumber(selection.assemblyCost) ?? 0
  const truckCount = getPositiveInteger(selection.truckCount)
  const hasAuthoritativeBreakdown =
    selection.configurationSubtotal !== undefined ||
    selection.transportCost !== undefined ||
    selection.assemblyCost !== undefined ||
    selection.installationMode !== undefined
  const grandTotal =
    topLevelTotal ??
    (hasAuthoritativeBreakdown
      ? storedSelectionTotal ??
        (getNonNegativeNumber(selection.configurationSubtotal) ?? 0) +
          shippingCost +
          assemblyCost
      : (storedSelectionTotal ?? 0) + shippingCost)
  const configurationSubtotal =
    getNonNegativeNumber(selection.configurationSubtotal) ??
    Math.max(0, grandTotal - shippingCost - assemblyCost)
  const assemblyLabel =
    selection.installationMode === 'ossa'
      ? 'Montage par Ossa Bois'
      : selection.installationMode === 'professional'
        ? 'Montage client / professionnel tiers'
        : 'Choix du montage non enregistré'
  const assemblyPrice =
    selection.installationMode === 'professional'
      ? `Non inclus · ${euroFormatter.format(0)}`
      : selection.installationMode === 'ossa'
        ? euroFormatter.format(assemblyCost)
        : 'À confirmer'

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
            <span>• <strong>Maison configurée:</strong> {euroFormatter.format(configurationSubtotal)}</span>
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
              {selection.strukturaPlloqes?.value && (
                <tr style={{ borderBottom: '1px solid var(--theme-elevation-100, #f1f5f9)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--theme-elevation-500, #64748b)', fontWeight: '500' }}>Structure de la dalle (Toit)</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600' }}>{selection.strukturaPlloqes.value}</td>
                </tr>
              )}
              {selection.izolimiPlloqes?.value && (
                <tr style={{ borderBottom: '1px solid var(--theme-elevation-100, #f1f5f9)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--theme-elevation-500, #64748b)', fontWeight: '500' }}>Isolation plafond (Faux plafond)</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600' }}>{selection.izolimiPlloqes.value}</td>
                </tr>
              )}
              {(selection.selectedOptions ?? [])
                .filter((item) => ![
                  'isolation',
                  'outerIsolation',
                  'facade',
                  'couverture',
                  'dritaret',
                  'etancheite',
                  'terraceEtancheite',
                  'roof',
                  'fauxPlafond',
                ].includes(item.categoryId || ''))
                .map((item, index) => (
                  <tr key={`${item.categoryId}-${item.optionId}-${index}`} style={{ borderBottom: '1px solid var(--theme-elevation-100, #f1f5f9)' }}>
                    <td style={{ padding: '8px 0', color: 'var(--theme-elevation-500, #64748b)', fontWeight: '500' }}>{item.categoryLabel || item.categoryId}</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600' }}>{item.label || item.optionId}</td>
                  </tr>
                ))}
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
                  .filter((entry) => entry[1] !== undefined && entry[1] !== null && entry[1] !== "" && Number(entry[1]) > 0)
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
        marginTop: '32px',
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(21, 128, 61, 0.03) 100%)',
        borderRadius: '12px',
        border: '2px solid #22c55e',
        boxShadow: '0 4px 20px rgba(34, 197, 94, 0.12)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px',
      }}>
        <div>
          <h4 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '12px', 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em', 
            color: '#22c55e', 
            fontWeight: '700' 
          }}>
            Détail du prix enregistré
          </h4>
          <div style={{ 
            fontSize: '14px', 
            color: 'var(--theme-elevation-800, #e2e8f0)', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--theme-elevation-500, #94a3b8)', fontWeight: '500' }}>Maison configurée:</span>
              <strong style={{ fontSize: '15px', color: 'var(--theme-elevation-900, #ffffff)' }}>{euroFormatter.format(configurationSubtotal)}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--theme-elevation-500, #94a3b8)', fontWeight: '500' }}>
                Frais de transport{truckCount ? ` (${truckCount} camion${truckCount === 1 ? '' : 's'})` : ''}:
              </span>
              <strong style={{ fontSize: '15px', color: 'var(--theme-elevation-900, #ffffff)' }}>{euroFormatter.format(shippingCost)}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--theme-elevation-500, #94a3b8)', fontWeight: '500' }}>{assemblyLabel}:</span>
              <strong style={{ fontSize: '15px', color: 'var(--theme-elevation-900, #ffffff)' }}>{assemblyPrice}</strong>
            </div>
          </div>
        </div>
        <div style={{ 
          textAlign: 'right',
          background: 'rgba(34, 197, 94, 0.1)',
          padding: '12px 24px',
          borderRadius: '10px',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ 
            fontSize: '11px', 
            color: '#4ade80', 
            fontWeight: '700', 
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Total Général
          </div>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: '900', 
            color: '#22c55e', 
            marginTop: '4px',
            textShadow: '0 0 15px rgba(34, 197, 94, 0.25)'
          }}>
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
