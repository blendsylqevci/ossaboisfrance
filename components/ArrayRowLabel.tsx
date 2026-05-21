'use client'
import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

export const ArrayRowLabel = () => {
  const { data, rowNumber } = useRowLabel<{ option_name?: string }>()
  
  // Use the option name if it exists, otherwise fall back to a default row index label
  const customLabel = data?.option_name || `Option ${String(rowNumber).padStart(2, '0')}`

  return <span>{customLabel}</span>
}
