import { CollectionConfig, APIError } from 'payload'

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

export const FieldDefinitions: CollectionConfig = {
  slug: 'field-definitions',
  lockDocuments: false,
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'label',
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data) {
          // Trim and lowercase all subFields names if they exist
          if (data.subFields && Array.isArray(data.subFields)) {
            data.subFields = data.subFields.map((sf: any) => {
              if (sf && typeof sf.name === 'string') {
                sf.name = sf.name.trim().toLowerCase();
              }
              return sf;
            });
          }

          // 1. Label to Name
          if (!data.name && data.label) {
            let labelText = '';
            if (typeof data.label === 'object') {
              labelText = data.label.fr || Object.values(data.label)[0] || '';
            } else if (typeof data.label === 'string') {
              labelText = data.label;
            }
            if (labelText) {
              data.name = slugify(labelText);
            }
          }
          // 2. Name to Label
          if (data.name && (!data.label || (typeof data.label === 'object' && !data.label.fr))) {
            const prettyLabel = data.name.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
            if (typeof data.label === 'object') {
              data.label = { ...data.label, fr: prettyLabel };
            } else {
              data.label = { fr: prettyLabel };
            }
          }

          // Trim and lowercase main name if it exists
          if (typeof data.name === 'string') {
            data.name = data.name.trim().toLowerCase();
          }
        }
        return data;
      }
    ],
    beforeDelete: [
      async ({ id, req }) => {
        if (!id) return;
        
        // Fetch the field definition to know its name/slug
        const fieldDef = await req.payload.findByID({
          collection: 'field-definitions',
          id,
          depth: 0,
        });

        if (!fieldDef) return;

        const pool = (req.payload.db as any).pool;
        if (!pool) return;

        // 1. BLOCK: Check if referenced in Houses custom fields blocks (real data)
        const blockTables = [
          'houses_blocks_boolean_value',
          'houses_blocks_image_value',
          'houses_blocks_number_value',
          'houses_blocks_repeater_value',
          'houses_blocks_select_value',
          'houses_blocks_text_value',
          'houses_blocks_textarea_value'
        ];

        for (const table of blockTables) {
          try {
            const blockCheck = await pool.query(
              `SELECT 1 FROM ${table} WHERE definition_id = $1 LIMIT 1`,
              [id]
            );
            if (blockCheck && blockCheck.rowCount > 0) {
              throw new APIError(
                'Kjo fushë nuk mund të fshihet sepse ka vlera të ruajtura në një ose më shumë Shtëpi (Custom Fields Values). Ju lutemi largojeni atë nga Shtëpitë më parë.',
                400
              );
            }
          } catch (err: any) {
            // If table doesn't exist, skip (no references)
            if (err instanceof APIError) throw err;
          }
        }

        // 2. AUTO-CLEAN: Remove from House Options dynamic_options
        try {
          const houseOptions = await req.payload.findGlobal({
            slug: 'house-options',
            depth: 0,
          });
          const dynamicOpts = houseOptions.dynamic_options || [];
          const filtered = dynamicOpts.filter((d: any) => {
            const defId = typeof d.field_definition === 'object' ? d.field_definition?.id : d.field_definition;
            return defId !== id;
          });
          if (filtered.length !== dynamicOpts.length) {
            await req.payload.updateGlobal({
              slug: 'house-options',
              data: { dynamic_options: filtered },
            });
          }
        } catch (cleanErr) {
          console.error('FieldDefinitions beforeDelete: error cleaning house-options', cleanErr);
        }

        // 3. AUTO-CLEAN: Remove from Houses dynamicFieldsConfig JSON
        if (fieldDef.name) {
          try {
            const housesWithConfig = await pool.query(
              `SELECT id, dynamic_fields_config FROM houses WHERE dynamic_fields_config::text LIKE $1`,
              [`%"${fieldDef.name}"%`]
            );
            if (housesWithConfig && housesWithConfig.rowCount > 0) {
              for (const row of housesWithConfig.rows) {
                const config = typeof row.dynamic_fields_config === 'string'
                  ? JSON.parse(row.dynamic_fields_config)
                  : row.dynamic_fields_config || {};
                delete config[fieldDef.name];
                await pool.query(
                  `UPDATE houses SET dynamic_fields_config = $1 WHERE id = $2`,
                  [JSON.stringify(config), row.id]
                );
              }
            }
          } catch (cleanErr) {
            console.error('FieldDefinitions beforeDelete: error cleaning houses config', cleanErr);
          }
        }
      }
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Auto-register new Field Definitions in House Options dynamic_options
        if (operation !== 'create') return doc;

        // Defer the insert to run AFTER the current transaction commits.
        // The afterChange hook runs inside the transaction, so the new
        // field_definitions row isn't visible to FK checks yet.
        const payload = req.payload;
        const docId = doc.id;
        const docName = doc.name;

        setTimeout(async () => {
          console.log(`[FieldDefinitions] Deferred auto-register: id=${docId}, name=${docName}`);
          try {
            const pool = (payload.db as any).pool;
            if (!pool) {
              console.error('[FieldDefinitions] No database pool available');
              return;
            }

            // Check if already linked
            const existing = await pool.query(
              'SELECT 1 FROM house_options_dynamic_options WHERE field_definition_id = $1 LIMIT 1',
              [docId]
            );

            if (existing && existing.rowCount > 0) {
              console.log(`[FieldDefinitions] Already linked in house-options, skipping.`);
              return;
            }

            // Get the next order number
            const maxOrder = await pool.query(
              'SELECT COALESCE(MAX(_order), 0) + 1 as next_order FROM house_options_dynamic_options WHERE _parent_id = 1'
            );
            const nextOrder = maxOrder.rows[0]?.next_order || 1;

            // Generate a unique hex ID (Payload uses MongoDB-style ObjectIds for array row IDs)
            const rowId = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

            // Insert directly via SQL (transaction is now committed, FK is satisfied)
            await pool.query(
              `INSERT INTO house_options_dynamic_options (_order, _parent_id, id, field_definition_id) VALUES ($1, 1, $2, $3)`,
              [nextOrder, rowId, docId]
            );

            console.log(`[FieldDefinitions] Successfully registered in house-options (order=${nextOrder}).`);
          } catch (err) {
            console.error('[FieldDefinitions] Deferred auto-register error:', err);
          }
        }, 1000); // 1 second delay to ensure transaction is committed

        return doc;
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: false,
      unique: true,
      admin: {
        description: 'Internal unique identifier. Automatically generated from Label if left blank (only lowercase alphanumeric and underscores allowed).',
      },
      validate: (value: string | null | undefined) => {
        if (!value) return true;
        const trimmed = value.trim().toLowerCase();
        const regex = /^[a-z0-9_]+$/
        if (!regex.test(trimmed)) {
          return 'Only lowercase alphanumeric characters and underscores are allowed.'
        }
        return true
      },
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'User-facing label displayed in frontend (e.g. Isolation Salle de Bain).',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Checkbox (Yes/No)', value: 'checkbox' },
        { label: 'Select (Dropdown)', value: 'select' },
        { label: 'Number', value: 'number' },
        { label: 'Text', value: 'text' },
        { label: 'Text Area', value: 'textarea' },
        { label: 'Image Select', value: 'image' },
        { label: 'Repeater (Repeating List)', value: 'repeater' },
      ],
      admin: {
        description: 'Field type input layout.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Optional description of the field or choice layout.',
      },
    },
    {
      name: 'subFields',
      type: 'array',
      label: 'Repeater Fields / Sub-fields',
      admin: {
        condition: (data) => data?.type === 'repeater',
        description: 'Define the fields that this repeater will contain.',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Sub-field Name (slug, lowercase alphanumeric and underscores)',
          validate: (val: string | null | undefined) => {
            if (!val) return 'Required';
            const trimmed = val.trim().toLowerCase();
            const regex = /^[a-z0-9_]+$/;
            if (!regex.test(trimmed)) return 'Only lowercase alphanumeric and underscores allowed.';
            return true;
          }
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Sub-field Label (e.g. Epaisseur)',
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'text',
          options: [
            { label: 'Text', value: 'text' },
            { label: 'Number', value: 'number' },
            { label: 'Text Area', value: 'textarea' },
            { label: 'Checkbox (Yes/No)', value: 'checkbox' },
            { label: 'Image', value: 'image' },
          ],
        }
      ]
    },
    {
      name: 'slugWatcher',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/SlugWatcher#SlugWatcher',
        },
      },
    },
  ],
}
