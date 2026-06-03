import * as addMediaOrganizationFields from './20260521_222000_add_media_organization_fields'
import * as updateOrdersSchema from './20260522_001200_update_orders_schema'
import * as addOrderCancellationReason from './20260522_002500_add_order_cancellation_reason'
import * as addPlanimetryVisual from './20260603_120000_add_planimetry_visual'

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
  {
    up: addOrderCancellationReason.up,
    down: addOrderCancellationReason.down,
    name: '20260522_002500_add_order_cancellation_reason',
  },
  {
    up: addPlanimetryVisual.up,
    down: addPlanimetryVisual.down,
    name: '20260603_120000_add_planimetry_visual',
  },
]
