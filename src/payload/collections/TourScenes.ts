import type { CollectionConfig } from 'payload'
import { statusFields } from '../fields/status'
import { publishedOnlyFor, createRBACAccess } from '../access'
import { createWebhookHooks } from '../hooks/contentWebhooks'
import { createAuditHooks } from '../hooks/auditTrail'
const webhookHooks = createWebhookHooks('tourScenes')
const auditHooks = createAuditHooks('tourScenes')

export const TourScenes: CollectionConfig = {
  slug: 'tourScenes',
  admin: {
    group: 'Website Content',
    useAsTitle: 'title',
  },
  access: {
    read: publishedOnlyFor('tourScenes'),
    create: createRBACAccess('tourScenes', 'create'),
    update: createRBACAccess('tourScenes', 'update'),
    delete: createRBACAccess('tourScenes', 'delete'),
  },
  fields: [
    {
      name: 'sceneNumber',
      type: 'number',
      required: true,
      min: 1,
      max: 15,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'branch',
      type: 'relationship',
      relationTo: 'branches',
      required: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'roomGroup',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Optional. Scenes with the same group are shown together as sub-rooms (e.g. "OPD"). Leave blank for a standalone room.',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'thumbnailImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      // Visual placement tool: lets non-technical editors click on the panorama
      // to drop a navigation pin instead of typing pitch/yaw numbers by hand.
      // It reads/writes the `hotspots` array below via the form state.
      name: 'hotspotEditor',
      type: 'ui',
      admin: {
        components: {
          Field: '@/payload/admin/components/tour/HotspotEditorField',
        },
      },
    },
    {
      name: 'hotspots',
      type: 'array',
      admin: {
        description:
          'Pins placed on the 360° photo. Use the visual editor above to add a pin (click the photo), then pick the room it opens.',
      },
      fields: [
        {
          // Set automatically by the visual editor (crosshair). Not required, so a
          // freshly-placed pin can never block saving/publishing the scene.
          name: 'pitch',
          type: 'number',
        },
        {
          name: 'yaw',
          type: 'number',
        },
        {
          name: 'targetScene',
          type: 'relationship',
          relationTo: 'tourScenes',
          admin: {
            description: 'When clicked, take the visitor to this room. Leave empty for an info-only marker.',
          },
        },
        {
          name: 'label',
          type: 'text',
          localized: true,
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
        },
      ],
    },
    ...statusFields(),
  ],
  hooks: {
    afterChange: [webhookHooks.onChange, auditHooks.onChange],
    afterDelete: [webhookHooks.onDelete, auditHooks.onDelete],
  },
}
