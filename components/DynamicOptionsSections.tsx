'use client'
import React, { useEffect, useState, useCallback } from 'react'

/* ──────────────────────────── types ──────────────────────────── */
interface FieldDef {
  id: number
  name: string
  label: string
  type: string
}

interface OptionRow {
  id?: string
  option_name: string
  option_image: number | string | null
  option_mini_image: number | string | null
  option_price: number | null
  option_price_200: number | null
  option_description: string
  layer_key: string
  checkbox: boolean
  dynamicValues: any
}

interface DynEntry {
  id?: string
  field_definition: number | { id: number }
  options: OptionRow[]
}

/* ──────────────────────── helper: blank option ──────────────────────── */
const blankOption = (): OptionRow => ({
  option_name: '',
  option_image: null,
  option_mini_image: null,
  option_price: 0,
  option_price_200: null,
  option_description: '',
  layer_key: '',
  checkbox: false,
  dynamicValues: null,
})

/* ──────────────────── sub-components ──────────────────── */
const FieldInput: React.FC<{
  label: string
  value: any
  onChange: (v: any) => void
  type?: string
  placeholder?: string
}> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div style={{ marginBottom: 10 }}>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 3, color: 'var(--theme-elevation-500, #94a3b8)' }}>
      {label}
    </label>
    {type === 'textarea' ? (
      <textarea
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        style={{
          width: '100%', padding: '6px 10px', fontSize: 13, borderRadius: 4,
          border: '1px solid var(--theme-elevation-150, #334155)',
          background: 'var(--theme-input-bg, #111827)',
          color: 'var(--theme-text, #e2e8f0)', resize: 'vertical',
        }}
      />
    ) : (
      <input
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value)}
        style={{
          width: '100%', height: 34, padding: '0 10px', fontSize: 13, borderRadius: 4,
          border: '1px solid var(--theme-elevation-150, #334155)',
          background: 'var(--theme-input-bg, #111827)',
          color: 'var(--theme-text, #e2e8f0)',
        }}
      />
    )}
  </div>
)

const MediaSelect: React.FC<{
  label: string
  value: any
  mediaItems: any[]
  onChange: (v: any) => void
}> = ({ label, value, mediaItems, onChange }) => {
  const actualId = typeof value === 'object' && value ? value.id : value
  const selected = mediaItems.find((m) => String(m.id) === String(actualId))

  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 3, color: 'var(--theme-elevation-500, #94a3b8)' }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <select
          value={actualId ?? ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          style={{
            flex: 1, height: 34, padding: '0 8px', fontSize: 13, borderRadius: 4,
            border: '1px solid var(--theme-elevation-150, #334155)',
            background: 'var(--theme-input-bg, #111827)',
            color: 'var(--theme-text, #e2e8f0)',
          }}
        >
          <option value="">— Aucune —</option>
          {mediaItems.map((m) => (
            <option key={m.id} value={m.id}>{m.filename}</option>
          ))}
        </select>
        {selected?.url && (
          <img
            src={selected.url}
            alt="thumb"
            style={{ width: 40, height: 28, objectFit: 'cover', borderRadius: 3, border: '1px solid var(--theme-elevation-150, #334155)' }}
          />
        )}
      </div>
    </div>
  )
}

/* ──────────────────── main component ──────────────────── */
export const DynamicOptionsSections: React.FC<any> = () => {
  const [fieldDefs, setFieldDefs] = useState<FieldDef[]>([])
  const [entries, setEntries] = useState<DynEntry[]>([])
  const [mediaItems, setMediaItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>({})
  const [collapsedOpts, setCollapsedOpts] = useState<Record<string, boolean>>({})

  /* ── load data ── */
  useEffect(() => {
    ;(async () => {
      try {
        const [dRes, gRes, mRes] = await Promise.all([
          fetch('/api/field-definitions?limit=100&locale=fr&depth=0'),
          fetch('/api/globals/house-options?locale=fr&depth=0'),
          fetch('/api/media?limit=250'),
        ])
        const d = await dRes.json()
        const g = await gRes.json()
        const m = await mRes.json()
        const defs: FieldDef[] = d.docs || []
        const existingEntries: DynEntry[] = g.dynamic_options || []
        const media = m.docs || []

        setFieldDefs(defs)
        setMediaItems(media)

        // Merge: ensure every field definition has an entry in dynamic_options
        const mergedEntries = [...existingEntries]
        let needsSave = false

        for (const fd of defs) {
          const alreadyLinked = existingEntries.some((e) => {
            const defId = typeof e.field_definition === 'object' && e.field_definition
              ? (e.field_definition as { id: number }).id
              : e.field_definition
            return defId === fd.id
          })
          if (!alreadyLinked) {
            mergedEntries.push({ field_definition: fd.id, options: [] })
            needsSave = true
          }
        }

        setEntries(mergedEntries)

        // Auto-save if we added missing entries
        if (needsSave) {
          try {
            await fetch('/api/globals/house-options?locale=fr', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dynamic_options: mergedEntries }),
            })
          } catch (saveErr) {
            console.error('DynamicOptionsSections: auto-save merge error', saveErr)
          }
        }
      } catch (e) {
        console.error('DynamicOptionsSections: load error', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  /* ── resolve field def id ── */
  const resolveFdId = useCallback((fd: number | { id: number }) => (typeof fd === 'object' && fd ? fd.id : fd), [])

  /* ── save ── */
  const handleSave = useCallback(async () => {
    setSaving(true)
    setSaveMsg('')
    try {
      const res = await fetch('/api/globals/house-options?locale=fr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dynamic_options: entries }),
      })
      if (res.ok) {
        setHasChanges(false)
        setSaveMsg('✓ Ruajtur me sukses!')
        setTimeout(() => setSaveMsg(''), 4000)
      } else {
        const err = await res.json().catch(() => null)
        setSaveMsg(`✗ Gabim: ${err?.message || res.statusText}`)
      }
    } catch (e: any) {
      setSaveMsg(`✗ Gabim: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }, [entries])

  /* ── CRUD helpers ── */
  const addOption = useCallback((ei: number) => {
    setEntries((prev) => {
      const next = [...prev]
      next[ei] = { ...next[ei], options: [...(next[ei].options || []), blankOption()] }
      return next
    })
    setHasChanges(true)
  }, [])

  const removeOption = useCallback((ei: number, oi: number) => {
    setEntries((prev) => {
      const next = [...prev]
      next[ei] = { ...next[ei], options: next[ei].options.filter((_, i) => i !== oi) }
      return next
    })
    setHasChanges(true)
  }, [])

  const updateOpt = useCallback((ei: number, oi: number, field: string, value: any) => {
    setEntries((prev) => {
      const next = [...prev]
      const entry = { ...next[ei] }
      const opts = [...entry.options]
      opts[oi] = { ...opts[oi], [field]: value }
      entry.options = opts
      next[ei] = entry
      return next
    })
    setHasChanges(true)
  }, [])

  /* ── collapse toggles ── */
  const toggleSection = useCallback((i: number) => {
    setCollapsedSections((prev) => ({ ...prev, [i]: !prev[i] }))
  }, [])
  const toggleOpt = useCallback((key: string) => {
    setCollapsedOpts((prev) => ({ ...prev, [key]: prev[key] === false }))
  }, [])
  const collapseAllOpts = useCallback((ei: number, opts: OptionRow[]) => {
    setCollapsedOpts((prev) => {
      const next = { ...prev }
      opts.forEach((_, oi) => { next[`${ei}-${oi}`] = true })
      return next
    })
  }, [])
  const expandAllOpts = useCallback((ei: number, opts: OptionRow[]) => {
    setCollapsedOpts((prev) => {
      const next = { ...prev }
      opts.forEach((_, oi) => { next[`${ei}-${oi}`] = false })
      return next
    })
  }, [])

  /* ── render ── */
  if (loading) {
    return <div style={{ padding: 20, fontSize: 13, color: 'var(--theme-elevation-400, #64748b)' }}>Duke u ngarkuar opsionet dinamike…</div>
  }

  return (
    <div style={{ marginTop: 24 }}>
      {/* ── title ── */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--theme-text, #e2e8f0)' }}>
            Dynamic Options &amp; Prices
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--theme-elevation-400, #64748b)' }}>
            Secili Field Definition shfaqet si seksion i veçantë. Shtoni opsionet me çmime, foto dhe layer keys.
          </p>
        </div>
        {/* save button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saveMsg && (
            <span style={{ fontSize: 13, fontWeight: 500, color: saveMsg.startsWith('✓') ? 'var(--theme-success-500, #22c55e)' : 'var(--theme-error-500, #ef4444)' }}>
              {saveMsg}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            style={{
              padding: '8px 20px', fontSize: 13, fontWeight: 600, borderRadius: 4,
              border: 'none', cursor: (saving || !hasChanges) ? 'not-allowed' : 'pointer',
              background: hasChanges ? 'var(--theme-success-500, #22c55e)' : 'var(--theme-elevation-150, #334155)',
              color: hasChanges ? '#fff' : 'var(--theme-elevation-400, #64748b)',
              opacity: saving ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
          >
            {saving ? 'Duke ruajtur…' : 'Ruaj Dynamic Options'}
          </button>
        </div>
      </div>

      {entries.length === 0 && (
        <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--theme-elevation-400, #64748b)', border: '1px dashed var(--theme-elevation-150, #334155)', borderRadius: 6 }}>
          Asnjë Field Definition nuk është krijuar ende. Krijoni një Field Definition te re dhe ajo do të shfaqet këtu automatikisht.
        </div>
      )}

      {/* ── sections ── */}
      {entries.map((entry, ei) => {
        const fdId = resolveFdId(entry.field_definition)
        const fd = fieldDefs.find((f) => f.id === fdId)
        const sectionLabel = fd?.label || fd?.name || `Field #${fdId}`
        const isCollapsed = collapsedSections[ei]
        const opts = entry.options || []

        return (
          <div
            key={entry.id || ei}
            style={{
              marginBottom: 20,
              border: '1px solid var(--theme-elevation-150, #334155)',
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            {/* ── section header ── */}
            <div
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 16px',
                background: 'var(--theme-elevation-50, #1e293b)',
                borderBottom: isCollapsed ? 'none' : '1px solid var(--theme-elevation-150, #334155)',
                cursor: 'pointer', userSelect: 'none',
              }}
              onClick={() => toggleSection(ei)}
            >
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--theme-text, #e2e8f0)' }}>
                {sectionLabel}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12 }}>
                {!isCollapsed && opts.length > 0 && (
                  <>
                    <span
                      onClick={(e) => { e.stopPropagation(); collapseAllOpts(ei, opts) }}
                      style={{ color: 'var(--theme-elevation-400, #64748b)', cursor: 'pointer' }}
                    >
                      Collapse All
                    </span>
                    <span
                      onClick={(e) => { e.stopPropagation(); expandAllOpts(ei, opts) }}
                      style={{ color: 'var(--theme-elevation-400, #64748b)', cursor: 'pointer' }}
                    >
                      Show All
                    </span>
                  </>
                )}
                <span style={{ color: 'var(--theme-elevation-400, #64748b)' }}>
                  {opts.length} option{opts.length !== 1 ? 's' : ''}
                </span>
                <span style={{ fontSize: 10 }}>{isCollapsed ? '▶' : '▼'}</span>
              </div>
            </div>

            {/* ── section body ── */}
            {!isCollapsed && (
              <div style={{ background: 'var(--theme-elevation-0, #0f172a)' }}>
                {opts.map((opt, oi) => {
                  const optKey = `${ei}-${oi}`
                  const isOptCollapsed = collapsedOpts[optKey] !== false

                  return (
                    <div
                      key={opt.id || oi}
                      style={{
                        borderBottom: '1px solid var(--theme-elevation-100, #1e293b)',
                      }}
                    >
                      {/* option row header */}
                      <div
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 16px', cursor: 'pointer', userSelect: 'none',
                        }}
                        onClick={() => toggleOpt(optKey)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: 'var(--theme-elevation-300, #475569)', fontSize: 14, cursor: 'grab' }}>⋮⋮</span>
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--theme-text, #e2e8f0)' }}>
                            {opt.option_name || `Option ${String(oi + 1).padStart(2, '0')}`}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeOption(ei, oi) }}
                            style={{
                              background: 'none', border: 'none', fontSize: 11, fontWeight: 500,
                              color: 'var(--theme-error-500, #ef4444)', cursor: 'pointer', padding: '2px 6px',
                            }}
                          >
                            Fshi
                          </button>
                          <span style={{ fontSize: 10, color: 'var(--theme-elevation-400, #64748b)' }}>
                            {isOptCollapsed ? '▶' : '▼'}
                          </span>
                        </div>
                      </div>

                      {/* option fields */}
                      {!isOptCollapsed && (
                        <div style={{ padding: '8px 16px 16px 36px', borderTop: '1px solid var(--theme-elevation-100, #1e293b)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                            <FieldInput label="Nom de l'option *" value={opt.option_name} onChange={(v) => updateOpt(ei, oi, 'option_name', v)} placeholder="Ex: Laine de Verre" />
                            <FieldInput label="Layer Key" value={opt.layer_key} onChange={(v) => updateOpt(ei, oi, 'layer_key', v)} placeholder="Ex: iso_inter_verre" />
                            <FieldInput label="Prix 60×160 (€) *" type="number" value={opt.option_price} onChange={(v) => updateOpt(ei, oi, 'option_price', v)} />
                            <FieldInput label="Prix 60×200 (€)" type="number" value={opt.option_price_200} onChange={(v) => updateOpt(ei, oi, 'option_price_200', v)} placeholder="Défaut: prix 60×160" />
                          </div>
                          <FieldInput label="Description" type="textarea" value={opt.option_description} onChange={(v) => updateOpt(ei, oi, 'option_description', v)} />
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                            <MediaSelect label="Image" value={opt.option_image} mediaItems={mediaItems} onChange={(v) => updateOpt(ei, oi, 'option_image', v)} />
                            <MediaSelect label="Mini Image" value={opt.option_mini_image} mediaItems={mediaItems} onChange={(v) => updateOpt(ei, oi, 'option_mini_image', v)} />
                          </div>
                          <div style={{ marginTop: 4 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--theme-text, #e2e8f0)', cursor: 'pointer' }}>
                              <input type="checkbox" checked={!!opt.checkbox} onChange={(e) => updateOpt(ei, oi, 'checkbox', e.target.checked)} />
                              Zgjedhur si parazgjedhje
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* add option button */}
                <div
                  onClick={() => addOption(ei)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '10px 16px', cursor: 'pointer',
                    color: 'var(--theme-elevation-400, #64748b)', fontSize: 13,
                    borderTop: opts.length > 0 ? '1px solid var(--theme-elevation-100, #1e293b)' : 'none',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--theme-text, #e2e8f0)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theme-elevation-400, #64748b)')}
                >
                  <span style={{ fontSize: 16 }}>+</span> Add {sectionLabel.split(' ').slice(0, 2).join('_').toLowerCase()}_option
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
