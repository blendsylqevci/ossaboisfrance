import * as addMediaOrganizationFields from './20260521_222000_add_media_organization_fields'

export const migrations = [
  {
    up: addMediaOrganizationFields.up,
    down: addMediaOrganizationFields.down,
    name: '20260521_222000_add_media_organization_fields',
  },
]
