'use client'
import React, { useEffect, useState } from 'react'
import { useRowLabel } from '@payloadcms/ui'

export const DynamicOptionsRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<{ field_definition?: number | { id: number; label?: string; name?: string } }>()
  const [label, setLabel] = useState<string>('')

  useEffect(() => {
    if (!data?.field_definition) {
      setLabel(`Dynamic Option ${String(rowNumber).padStart(2, '0')}`)
      return
    }

    // If field_definition is a populated object
    if (typeof data.field_definition === 'object' && data.field_definition) {
      const fd = data.field_definition as any
      const fdLabel = fd.label || fd.name || `Field #${fd.id}`
      setLabel(fdLabel)
      return
    }

    // If it's just an ID, fetch the label
    const fdId = data.field_definition
    fetch(`/api/field-definitions/${fdId}?locale=fr&depth=0`)
      .then((r) => r.json())
      .then((d) => setLabel(d.label || d.name || `Field #${fdId}`))
      .catch(() => setLabel(`Field #${fdId}`))
  }, [data?.field_definition, rowNumber])

  return <span>{label || `Dynamic Option ${String(rowNumber).padStart(2, '0')}`}</span>
}
