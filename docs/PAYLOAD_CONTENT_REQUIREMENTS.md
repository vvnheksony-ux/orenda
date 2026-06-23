# Payload Content Requirements

This is the current frontend-facing content checklist for Orienda Web.

Use this to tell the Payload/content team what must exist so the site works correctly without empty states, dead buttons, or missing localized content.

## General Rules

- Every public content item should be `published`.
- `en` content should always exist.
- `km` and `zh` should be filled when those locales are meant to show localized content.
- If `km` or `zh` is missing:
  - `Health Tips` now falls back to `en`.
  - `Doctor Talks` already falls back to `en`.
- Images should be uploaded for cards/heroes whenever possible, otherwise the UI falls back to placeholders.
- Slugs must be unique and stable.

## Branch-Linked vs Global Content

Branch-linked in current frontend:
- `Departments`
- `Doctors` via department branch
- `Tour Scenes`

Not branch-linked in current frontend:
- `News`
- `Health Tips`
- `Doctor Talks`
- `Promotions`
- `Packages`
- `FAQs`
- `Insurance Updates`
- `Partners`
- `Pages`

Meaning:
- Switching branch should change doctors/departments/tour scenes.
- Switching branch should not change news, health tips, doctor talks, promotions, FAQs, insurance, partners, or static pages.

## Health Tips

Collection:
- `health-tips`

Required for good frontend output:
- `title`
- `slug`
- `excerpt`
- `publishedAt`

Strongly recommended:
- `thumbnail`
- `healthTipCategory`
- `readingTime`
- localized `title`, `excerpt`, `body`

Notes:
- Category buttons depend on `healthTipCategory` values:
  - `nutrition`
  - `exercise`
  - `mentalHealth`
  - `preventiveCare`
  - `chronicDisease`
- Search uses:
  - title
  - excerpt
  - category

## Doctor Talks

Collection:
- `doctor-talks`

Required for good frontend output:
- `title`
- `slug`
- `talkTopic`
- `eventDate`

Strongly recommended:
- `thumbnail`
- `excerpt`
- `featuredDoctor`
- `meetingLink`
- localized `title`, `talkTopic`, `excerpt`, `body`

Important behavior:
- If `meetingLink` exists:
  - card overlay button opens external watch link
  - card CTA shows `Watch`
- If `meetingLink` is empty:
  - card overlay goes to internal detail page
  - card CTA shows `Read More`

Best practice:
- `featuredDoctor` should point to a doctor that already has a department.
- The left-side filter on Doctor Talks is currently built from the featured doctor department name.
- If the doctor has no department, that talk will not contribute to department filter buttons.

## Doctors

Collection:
- `doctors`

Required:
- `name`
- `slug` or stable `id`
- `specialty`
- `department`

Strongly recommended:
- profile image
- localized doctor name/specialty if multilingual display is expected

Important:
- Doctors should be linked to the correct department.
- Department branch assignment controls branch filtering on the public site.

## Departments

Collection:
- `departments`

Required:
- `name`
- `slug`
- `branch`

Strongly recommended:
- `description`
- `icon`

Important:
- Branch assignment is required for branch-specific filtering.
- Missing branch assignment breaks the doctor/department branch experience.

## Promotions

Collection:
- `promotions`

Required:
- `title`
- `slug`

Strongly recommended:
- `image`
- `validTo`
- body/description content

## Packages

Collection:
- package content used by promotions/packages pages

Required:
- `title`
- `slug`

Strongly recommended:
- `image`
- `description`
- `price`

## News

Collection:
- `news`

Required:
- `title`
- `slug`
- `publishedAt`

Strongly recommended:
- `thumbnail`
- `excerpt`
- localized content

## Insurance Updates

Collection:
- `insurance-updates`

Should be filled if available:
- provider/company name
- logo
- summary/body
- contact person
- contact phone
- contact email

Important:
- The data model contains contact fields and the frontend/API should respect them.
- Empty contact fields make cards feel incomplete.

## Careers

Collection:
- `careers`

Required:
- `title` or `position`
- `slug`

Strongly recommended:
- department
- career location
- description

Important:
- `careerLocation` exists in schema and should be populated if location matters.

## Partners

Collection:
- `partners`

Required:
- `name`
- `logo`

Important:
- Missing logo weakens the partner marquee immediately.

## FAQs

Collection:
- `faqs`

Required:
- question
- answer

## Pages / Globals

Collections / globals:
- `pages`
- site/global content used in hero/footer/static sections

Need to confirm content exists for:
- About
- Inquiry
- Expect
- footer links/contact info

## Content Quality Checklist

Before marking content ready, verify:
- item is published
- `en` exists
- `km` and `zh` exist when needed
- slug works
- image exists for card-based sections
- no empty CTA target
- doctors are linked to departments
- departments are linked to branches
- doctor talks have either a valid `meetingLink` or enough detail content for the internal detail page

## Known Frontend Expectations

- `Health Tips` search/filter should always return real Payload items, not hardcoded cards.
- `Doctor Talks` search/filter should always return real Payload items, not hardcoded cards.
- `Doctor Talks` filter labels are derived from featured doctor department names.
- Empty `meetingLink` is allowed, but then the talk should still have meaningful detail content.
