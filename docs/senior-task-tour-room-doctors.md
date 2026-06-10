# Senior Task: Link 360° Tour Rooms to Doctors

**Priority:** Low (post-demo)
**Estimated effort:** 15–30 min
**Who:** Senior / Payload owner
**Frontend:** Ready — no additional frontend work needed after this task

---

## Problem

The 360° Room Tour detail page (`/360-tour/[roomId]`) is designed to show
doctors relevant to each room. For example:

- Queen Room → shows Gynecology doctors
- Standard Room → shows General Medicine doctors

Currently the `TourScenes` Payload collection has no department field,
so there is no data link between a room and its department.
The "Meet Our Specialists" section is **hidden** until this is resolved.

---

## Required Change

### File: `src/payload/collections/TourScenes.ts`

Add one field inside the `fields` array:

```ts
{
  name: 'department',
  type: 'relationship',
  relationTo: 'departments',
  required: false,
  admin: {
    description: 'Link this room to a department to show relevant doctors on the room detail page.',
    position: 'sidebar',
  },
},
```

### Migration

```bash
npx payload migrate:create --name add-department-to-tour-scenes
npx payload migrate
```

### Admin Panel

After migration, each Tour Scene in the Payload admin will have a
**Department** dropdown in the sidebar. Editors select the relevant
department when creating or editing a room.

---

## What Frontend Will Do (Already Prepared)

Once the field is live, the frontend developer will:

1. Update `src/app/api/tour-scenes/route.ts` — include `departmentPayloadId` in the response
2. Update `src/lib/tour-cache.ts` — add `departmentPayloadId?: string` to `TourScene` type
3. Update `src/app/[locale]/360-tour/[roomId]/page.tsx` — restore "Meet Our Specialists" section, filtered by `departmentPayloadId`

No Supabase changes. No additional API routes. Estimated frontend time: ~20 min.

---

## Why Not a Supabase Mapping Table?

A separate Supabase table (`tour_scene_departments`) would also work technically,
but requires admins to maintain two separate places — the Payload admin for
room content, and the Supabase dashboard for the department mapping.
A Payload relationship field keeps everything in one place.

---

## Current State Summary

| Feature | Status |
|---|---|
| 360° room listing page (2-col grid) | ✅ Working |
| Room detail page — 360° viewer | ✅ Working |
| Room detail page — back button | ✅ Working |
| Room detail page — Meet Our Specialists | ⚠️ Hidden (pending this task) |
| Admin can add/edit rooms in Payload | ✅ Working |
