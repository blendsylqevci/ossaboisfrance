import * as addMediaOrganizationFields from './20260521_222000_add_media_organization_fields'
import * as updateOrdersSchema from './20260522_001200_update_orders_schema'

export const migrations = [
  {
    up: addMediaOrganizationFields.up,
    down: addMediaOrganizationFields.down,
    name: '20260521_222000_add_media_organization_fields',
  },
  {
    up: updateOrdersSchema.up,
    down: updateOrdersSchema.down,
    name: '20260522_001200_update_orders_schema',
  },
]

