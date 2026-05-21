'use client'
import React, { useEffect, useState } from 'react'
import { useField } from '@payloadcms/ui'

interface FieldDef {
  id: string
  name: string
  label: any
  type: string
}

interface GlobalOptionChoice {
  option_name: string
  layer_key: string
  option_image?: any
}

interface GlobalDynamicConfig {
  field_definition: any
  options?: GlobalOptionChoice[]
}

interface HouseDynamicFieldsConfigProps {
  path: string
}

export const HouseDynamicFieldsConfig: React.FC<HouseDynamicFieldsConfigProps> = ({ path }) => {
  const { value: rawValue, setValue } = useField<any>({ path })

  const [fieldDefs, setFieldDefs] = useState<FieldDef[]>([])
  const [globalConfigs, setGlobalConfigs] = useState<GlobalDynamicConfig[]>([])
  const [mediaList, setMediaList] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // 1. Fetch Field Definitions, Global House Options, and Media
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fieldDefsRes, globalOptionsRes, mediaRes] = await Promise.all([
          fetch('/api/field-definitions?limit=100'),
          fetch('/api/globals/house-options'),
          fetch('/api/media?limit=250')
        ])

        const fieldDefsData = await fieldDefsRes.json()
        const globalOptionsData = await globalOptionsRes.json()
        const mediaData = await mediaRes.json()

        if (fieldDefsData?.docs) {
          setFieldDefs(fieldDefsData.docs)
        }
        if (globalOptionsData?.dynamic_options) {
          setGlobalConfigs(globalOptionsData.dynamic_options)
        }
        if (mediaData?.docs) {
          setMediaList(mediaData.docs)
        }
      } catch (err) {
        console.error("Error loading dynamic config assets:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 2. Read current saved JSON config value
  const currentValues = rawValue
    ? typeof rawValue === 'string'
      ? JSON.parse(rawValue)
      : rawValue
    : {}

  const handleToggle = (fieldSlug: string, enabled: boolean) => {
    const nextValues = { ...currentValues }
    if (!nextValues[fieldSlug]) {
      nextValues[fieldSlug] = { enabled, options: {} }
    } else {
      nextValues[fieldSlug] = { ...nextValues[fieldSlug], enabled }
    }

    setValue(nextValues)
  }

  const handleOptionImageChange = (fieldSlug: string, layerKey: string, mediaId: string) => {
    const nextValues = { ...currentValues }
    if (!nextValues[fieldSlug]) {
      nextValues[fieldSlug] = { enabled: true, options: {} }
    }

    const nextOptions = { ...nextValues[fieldSlug].options, [layerKey]: mediaId }
    nextValues[fieldSlug] = { ...nextValues[fieldSlug], options: nextOptions }

    setValue(nextValues)
  }

  if (loading) {
    return <p style={{ fontSize: 13, color: 'var(--theme-elevation-400, #64748b)', margin: 0 }}>Loading dynamic fields configuration...</p>
  }

  // Filter global configs to only include those with active, valid field definitions
  const activeConfigs = globalConfigs.filter(gc => {
    const defId = typeof gc.field_definition === 'object' ? gc.field_definition?.id : gc.field_definition
    return fieldDefs.some(fd => fd.id === defId)
  })

  if (activeConfigs.length === 0) {
    return (
      <div style={{ padding: 16, background: 'var(--theme-elevation-50, #1e293b)', borderRadius: 8, border: '1px solid var(--theme-elevation-150, #334155)' }}>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--theme-elevation-400, #64748b)', fontStyle: 'italic' }}>
          Aucun champ dynamique n'est configuré globalement dans les options de la maison.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, background: 'var(--theme-elevation-50, #1e293b)', borderRadius: 8, border: '1px solid var(--theme-elevation-150, #334155)' }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 600, color: 'var(--theme-text, #e2e8f0)' }}>
        Configuration des Champs Dynamiques (ACF)
      </h3>
      <p style={{ margin: '0 0 12px 0', fontSize: 12, color: 'var(--theme-elevation-400, #64748b)' }}>
        Activez ou désactivez les champs personnalisés globaux pour cette maison et configurez les images des calques graphiques associées.
      </p>

      {activeConfigs.map(gc => {
        const defId = typeof gc.field_definition === 'object' ? gc.field_definition?.id : gc.field_definition
        const fieldDef = fieldDefs.find(fd => fd.id === defId)!
        const fieldSlug = fieldDef.name
        const fieldLabel = typeof fieldDef.label === 'object' ? fieldDef.label.fr || Object.values(fieldDef.label)[0] || fieldSlug : fieldDef.label || fieldSlug

        const config = currentValues[fieldSlug] || { enabled: false, options: {} }
        const isEnabled = !!config.enabled

        return (
          <div key={fieldSlug} style={{ border: '1px solid var(--theme-elevation-150, #334155)', borderRadius: 6, padding: 14, background: 'var(--theme-elevation-0, #0f172a)' }}>
            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--theme-text, #e2e8f0)' }}>{fieldLabel}</span>
                <span style={{ fontSize: 11, color: 'var(--theme-elevation-400, #64748b)', marginLeft: 8, fontStyle: 'italic' }}>({fieldSlug})</span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 550, color: isEnabled ? 'var(--theme-success-500, #22c55e)' : 'var(--theme-elevation-400, #64748b)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => handleToggle(fieldSlug, e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                {isEnabled ? 'Activé' : 'Désactivé'}
              </label>
            </div>

            {isEnabled && (
              <div style={{ marginTop: 12, borderTop: '1px solid var(--theme-elevation-100, #1e293b)', paddingTop: 12 }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 11, fontWeight: 600, color: 'var(--theme-elevation-500, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Images des calques graphiques (Layers)
                </h4>
                {(!gc.options || gc.options.length === 0) ? (
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--theme-elevation-400, #64748b)', fontStyle: 'italic' }}>
                    Aucune option n'est configurée globalement pour cette fushë.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {gc.options.map(opt => {
                      if (!opt.layer_key) return null
                      const selectedId = config.options?.[opt.layer_key] || ''
                      const selectedMedia = mediaList.find(m => m.id === selectedId)
                      const thumbnail = selectedMedia?.url || ''

                      return (
                        <div key={opt.layer_key} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--theme-elevation-50, #1e293b)', padding: 8, borderRadius: 4, border: '1px solid var(--theme-elevation-150, #334155)' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 550, color: 'var(--theme-text, #e2e8f0)' }}>
                              {opt.option_name}
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--theme-elevation-400, #64748b)' }}>
                              Clé du calque : <code>{opt.layer_key}</code>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '60%' }}>
                            <select
                              value={selectedId}
                              onChange={(e) => handleOptionImageChange(fieldSlug, opt.layer_key, e.target.value)}
                              style={{ flex: 1, height: 28, padding: '0 6px', fontSize: 12, borderRadius: 4, border: '1px solid var(--theme-elevation-150, #334155)', background: 'var(--theme-input-bg, #111827)', color: 'var(--theme-text, #e2e8f0)' }}
                            >
                              <option value="">Utiliser l'image globale par défaut</option>
                              {mediaList.map(m => (
                                <option key={m.id} value={m.id}>{m.filename}</option>
                              ))}
                            </select>
                            {thumbnail && (
                              <img src={thumbnail} alt="Calque" style={{ width: 40, height: 28, objectFit: 'cover', borderRadius: 3, border: '1px solid var(--theme-elevation-150, #334155)' }} />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
