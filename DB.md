# Database Reference

## Rules
- Payload CMS uses **`payload` schema** in Supabase PostgreSQL
- Payload stores camelCase field names as **snake_case** columns (e.g. `positionTitle` → `position_title`)
- Localized fields live in separate `*_locales` tables, NOT the main table
- `payload.findByID` does NOT read `_locales` — **always use raw SQL with COALESCE** for localized fields
- `bio` / `description` / `body` are **Lexical rich-text JSON** (not plain string) — use `lexicalToText()`
- Image URL = `media.url`, prefix stored separately in `media.prefix`
- Locales: `en`, `km`, `zh`

---

## Supabase `public` Schema

### `appointments`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | auto |
| patient_name | text NOT NULL | |
| patient_phone | text NOT NULL | |
| patient_email | text | optional |
| preferred_date | date | |
| preferred_time | text | |
| message | text | |
| language | text | `en`/`km`/`zh` |
| status | text | default `pending` |
| source | text | default `website` |
| user_id | uuid | FK supabase auth.users |
| doctor_payload_id | integer | Payload doctors.id |
| department_payload_id | real | Payload departments.id |
| branch_payload_id | integer | Payload branches.id |
| slot_start | timestamptz | |
| slot_end | timestamptz | |
| created_at | timestamptz NOT NULL | |

### `purchases`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | auto |
| patient_name | text NOT NULL | |
| patient_phone | text | |
| patient_email | text | |
| promotion_id | uuid | Mobile app UUID FK — always null on web |
| promotion_payload_id | integer | Payload promotions.id — web uses this |
| promotion_title | text | Denormalized title for display |
| branch_payload_id | integer | Payload branches.id |
| message | text | |
| language | text | |
| status | text | default `pending` |
| source | text | default `website` |
| user_id | uuid | FK supabase auth.users |
| created_at | timestamptz NOT NULL | |

### `emergency_logs`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| phone | text | |
| contact_info | text | |
| user_id | uuid | optional, from session |
| created_at | timestamptz | |

### `inquiries`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| phone | text | |
| email | text | |
| message | text | |
| created_at | timestamptz | |
| subject | text | `Contact Form` / inquiry type |
| language | text | `en`/`km`/`zh` |

### `profiles`
FK to `auth.users`. Stores display name, phone, avatar.

---

## Payload `payload` Schema — Key Collections

### `doctors` + `doctors_locales`
```sql
-- Main table
doctors: id, slug, photo_id→media, department_id→departments,
         phone, email, doctor_number, sex, nationality,
         position_title, employment_type, employment_start_date,
         total_clinical_experience_years, specialist_experience_years,
         order, status, _status, published_at, updated_at, created_at

-- Localized fields (join on _parent_id = doctors.id)
doctors_locales: name, bio (jsonb/lexical), specialty, _locale, _parent_id

-- Sub-tables
doctors_education: _parent_id, _order, description (text)
doctors_languages: _parent_id, _order, name (text)
```

**Query pattern:**
```sql
SELECT d.*, COALESCE(dl_loc.name, dl_en.name) AS name,
            COALESCE(dl_loc.specialty, dl_en.specialty) AS specialty,
            COALESCE(dl_loc.bio, dl_en.bio) AS bio
FROM payload.doctors d
LEFT JOIN payload.doctors_locales dl_en ON dl_en._parent_id = d.id AND dl_en._locale = 'en'
LEFT JOIN payload.doctors_locales dl_loc ON dl_loc._parent_id = d.id AND dl_loc._locale = $locale
WHERE d._status = 'published'
```

---

### `departments` + `departments_locales`
```
departments: id, slug, icon_id→media, branch_id→branches,
             order, status, _status, published_at
departments_locales: name, description (jsonb), _locale, _parent_id
```

---

### `branches` + `branches_locales`
```
branches: id, slug, phone, email, map_url, image_id→media,
          order, status, _status, published_at
branches_locales: name, description (jsonb), address, hours, _locale, _parent_id
```

---

### `promotions` + `promotions_locales`
```
promotions: id, slug, image_id→media,
            valid_from (timestamptz), valid_to (timestamptz),
            status, _status, published_at
promotions_locales: title, description (jsonb/lexical), _locale, _parent_id
```

---

### `services` + `services_locales`
```
services: id, slug, department_id→departments, icon_id→media,
          status, _status, published_at
services_locales: title, description (jsonb), _locale, _parent_id
```

---

### `service_packages` + `service_packages_locales`
```
service_packages: id, slug, department_id→departments,
                  promotion_id→promotions, image_id→media,
                  order, status, _status, published_at
service_packages_locales: title, description (jsonb), price_label, _locale, _parent_id
service_packages_rels: parent_id→service_packages, services_id→services
```

---

### `news` + `news_locales`
```
news: id, slug, thumbnail_id→media, author, status, _status, published_at
news_locales: title, body (jsonb/lexical), excerpt, _locale, _parent_id
```

---

### `faqs` + `faqs_locales`
```
faqs: id, category (enum), order, status, _status, published_at
faqs_locales: question, answer (jsonb/lexical), _locale, _parent_id
```

---

### `doctor_schedules` + `doctor_schedules_locales`
```
doctor_schedules: id, label, doctor_id→doctors, department_id→departments,
                  day_of_week (enum: mon/tue/wed/thu/fri/sat/sun),
                  start_time (varchar), end_time (varchar),
                  appointment_duration_minutes, active (bool),
                  order, status, _status, published_at
doctor_schedules_locales: room, _locale, _parent_id
```

---

### `tour_scenes` + `tour_scenes_locales`
```
tour_scenes: id, scene_number, thumbnail_image_id→media, status, published_at
tour_scenes_locales: title, description, _locale, _parent_id
tour_scenes_hotspots: _parent_id, _order, pitch, yaw
tour_scenes_hotspots_locales: label, description, _locale, _parent_id
```

---

### `announcements` + `announcements_locales`
```
announcements: id, slug, thumbnail_id→media, author,
               priority (enum), start_date, end_date,
               is_banner (bool), banner_background_color,
               status, _status, published_at
announcements_locales: title, body (jsonb), excerpt, _locale, _parent_id
```

---

### `health_tips` + `health_tips_locales`
```
health_tips: id, slug, thumbnail_id→media, author,
             health_tip_category (enum), reading_time (minutes),
             status, _status, published_at
health_tips_locales: title, body (jsonb), excerpt, _locale, _parent_id
health_tips_health_tip_tags: _parent_id, _order, tag
```

---

### `doctor_talks` + `doctor_talks_locales`
```
doctor_talks: id, slug, thumbnail_id→media, author,
              featured_doctor_id→doctors,
              event_date, event_time, duration (minutes),
              is_virtual (bool), meeting_link, max_attendees,
              status, _status, published_at
doctor_talks_locales: title, body (jsonb), excerpt, talk_topic, _locale, _parent_id
```

---

### `careers` + `careers_locales`
```
careers: id, slug, thumbnail_id→media, author,
         career_department_id→departments,
         career_employment_type (enum), experience_level (enum),
         application_deadline, status, _status, published_at
careers_locales: title, body (jsonb), excerpt, position, salary_range,
                 career_requirements (jsonb), responsibilities (jsonb),
                 _locale, _parent_id
```

---

### `insurance_updates` + `insurance_updates_locales`
```
insurance_updates: id, slug, thumbnail_id→media, author,
                   insurance_provider, insurance_contact_person,
                   insurance_contact_phone, insurance_contact_email,
                   effective_date, expiration_date,
                   status, _status, published_at
insurance_updates_locales: title, body (jsonb), excerpt, coverage_details (jsonb),
                            _locale, _parent_id
insurance_updates_insurance_plan_types: _parent_id, _order, plan_type
insurance_updates_required_documents: _parent_id, _order, document
```

---

### `media`
```
media: id, prefix, url, thumbnail_u_r_l, filename, mime_type,
       filesize, width, height, focal_x, focal_y,
       sizes_thumbnail_*, sizes_card_*, sizes_hero_*, sizes_og_*,
       updated_at, created_at
media_locales: alt, caption, _locale, _parent_id
media_tags: _parent_id, _order, tag
```

Image URL helper: `url` is full path. If `prefix` set, it's a storage bucket prefix (not usually needed directly).

---

### Globals
- `site_settings` + `site_settings_locales` — logo, contact email/phone, site name, tagline, emergency CTA text
- `operational_settings` — webhook targets, analytics report recipients
- `navigation` + sub-tables — main menu items (nested), footer menu items
- `social_links` — facebook, instagram, youtube, tiktok

---

### Analytics / Ops
- `analytics_events` — page views, scene visits, session tracking
- `kpi_snapshots` — daily/weekly metric snapshots
- `ga_reports` — cached Google Analytics report data
- `audit_logs` — CMS admin action log
- `content_search_index` — unified search index across all collections

---

## API Routes → Collections Mapping

| Route | Collection/Table |
|---|---|
| `/api/doctors` | `payload.doctors` + raw SQL |
| `/api/departments` | Payload `departments` |
| `/api/branches` | Payload `branches` |
| `/api/promotions` | Payload `promotions` |
| `/api/services` | Payload `services` |
| `/api/news` | Payload `news` |
| `/api/faqs` | Payload `faqs` |
| `/api/appointments` | `public.appointments` |
| `/api/purchases` | `public.purchases` |
| `/api/emergency` | `public.emergency_logs` |
| `/api/inquiries` | `public.inquiries` |
