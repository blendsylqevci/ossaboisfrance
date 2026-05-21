'use client'
import React, { useEffect, useRef } from 'react'
import { useForm, useFormFields } from '@payloadcms/ui'

const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s_]/g, '')
    .trim()
    .replace(/[\s]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export const SlugWatcher: React.FC = () => {
  const { dispatchFields } = useForm()

  const labelFrField = useFormFields(([fields]) => fields['label.fr'])
  const labelField = useFormFields(([fields]) => fields['label'])
  const nameField = useFormFields(([fields]) => fields['name'])

  const labelValue = (labelFrField?.value || labelField?.value) as string | undefined
  const nameValue = nameField?.value as string | undefined

  const lastLabelRef = useRef<string | undefined>(undefined)
  const lastNameRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    // 1. Label -> Name (real-time slugification)
    if (labelValue !== undefined && labelValue !== lastLabelRef.current) {
      lastLabelRef.current = labelValue
      const currentSlug = slugify(labelValue)
      // Only set name if name is empty or was previously auto-slugified from last label
      if (!nameValue || nameValue === slugify(lastLabelRef.current || '')) {
        dispatchFields({
          type: 'UPDATE',
          path: 'name',
          value: currentSlug,
        })
      }
    }

    // 2. Name -> Label (real-time generation if label is empty)
    if (nameValue !== undefined && nameValue !== lastNameRef.current) {
      lastNameRef.current = nameValue
      if (!labelValue && nameValue) {
        const prettyLabel = nameValue.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
        if (labelFrField) {
          dispatchFields({
            type: 'UPDATE',
            path: 'label.fr',
            value: prettyLabel,
          })
        } else {
          dispatchFields({
            type: 'UPDATE',
            path: 'label',
            value: prettyLabel,
          })
        }
      }
    }
  }, [labelValue, nameValue, dispatchFields, labelFrField])

  return null
}
