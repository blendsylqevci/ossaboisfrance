'use client'
import React, { useEffect, useState } from 'react'
import { useField, useFormFields } from '@payloadcms/ui'

interface SubField {
  name: string
  label: string
  type: 'text' | 'number' | 'textarea' | 'checkbox' | 'image'
}

interface DynamicValuesFormProps {
  path: string
}

const MediaSelectInput: React.FC<{ value: any; onChange: (val: any) => void }> = ({ value, onChange }) => {
  const [media, setMedia] = useState<any[]>([])
  const [selectedUrl, setSelectedUrl] = useState<string>('')
  const actualMediaId = typeof value === 'object' && value ? value.id : value

  useEffect(() => {
    fetch('/api/media?limit=250')
      .then(res => res.json())
      .then(data => {
        if (data && data.docs) {
          setMedia(data.docs)
          const found = data.docs.find((m: any) => m.id === actualMediaId)
          if (found) setSelectedUrl(found.url || '')
        }
      })
      .catch(err => console.error("Error fetching media list:", err))
  }, [actualMediaId])

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    onChange(val)
    const found = media.find((m: any) => m.id === val)
    setSelectedUrl(found ? found.url || '' : '')
  }

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <select
        value={actualMediaId || ''}
        onChange={handleSelectChange}
        style={{ flex: 1, height: 32, padding: '0 8px', fontSize: 13, borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff' }}
      >
        <option value="">Sélectionner une image...</option>
        {media.map(m => (
          <option key={m.id} value={m.id}>{m.filename}</option>
        ))}
      </select>
      {selectedUrl && (
        <img src={selectedUrl} alt="Thumbnail" style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 4, border: '1px solid #e2e8f0' }} />
      )}
    </div>
  )
}

export const DynamicValuesForm: React.FC<DynamicValuesFormProps> = ({ path }) => {
  const { value: rawValue, setValue } = useField<any>({ path })

  const lastOptionsIdx = path.lastIndexOf('.options.')
  const parentDefPath = lastOptionsIdx !== -1 ? path.substring(0, lastOptionsIdx) + '.field_definition' : ''

  const fieldDefField = useFormFields(([fields]) => fields[parentDefPath])
  const fieldDefId = fieldDefField?.value

  const actualId = typeof fieldDefId === 'object' && fieldDefId ? (fieldDefId as any).id : fieldDefId

  const [subFields, setSubFields] = useState<SubField[]>([])

  useEffect(() => {
    if (actualId) {
      fetch(`/api/field-definitions/${actualId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.subFields) {
            setSubFields(data.subFields)
          } else {
            setSubFields([])
          }
        })
        .catch(err => {
          console.error("Error fetching field definition:", err)
          setSubFields([])
        })
    } else {
      setSubFields([])
    }
  }, [actualId])

  const currentValues = rawValue
    ? typeof rawValue === 'string'
      ? JSON.parse(rawValue)
      : rawValue
    : {}

  const handleChange = (name: string, val: any) => {
    const nextValues = { ...currentValues, [name]: val }
    setValue(nextValues)
  }

  return (
    <div style={{ marginTop: 12, padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: 13, fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Dynamic Custom Fields
      </h4>
      {subFields.length === 0 ? (
        <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
          No sub-fields defined. Please select or add sub-fields to the Field Definition first.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {subFields.map(sf => {
            const val = currentValues[sf.name] ?? ''
            return (
              <div key={sf.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 550, color: '#475569' }}>{sf.label}</label>
                {sf.type === 'textarea' ? (
                  <textarea
                    value={val}
                    onChange={(e) => handleChange(sf.name, e.target.value)}
                    style={{ width: '100%', minHeight: 60, padding: '6px 10px', fontSize: 13, borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff' }}
                  />
                ) : sf.type === 'checkbox' ? (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={!!val}
                      onChange={(e) => handleChange(sf.name, e.target.checked)}
                    />
                    Active / Oui
                  </label>
                ) : sf.type === 'image' ? (
                  <MediaSelectInput
                    value={val}
                    onChange={(mediaId) => handleChange(sf.name, mediaId)}
                  />
                ) : (
                  <input
                    type={sf.type === 'number' ? 'number' : 'text'}
                    value={val}
                    onChange={(e) => handleChange(sf.name, sf.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
                    style={{ width: '100%', height: 32, padding: '0 10px', fontSize: 13, borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff' }}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
