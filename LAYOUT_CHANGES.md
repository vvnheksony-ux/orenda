# Responsive Layout Standardization — Change Log

Branch: `fix/about-vision-mission-layout`
Scope: public pages only (admin/Payload untouched). Changes are **class-string only** (no logic).

## How to revert

All changes are uncommitted. To undo everything in one shot:

```bash
git restore src/app/globals.css \
  "src/components/home/NewsSection.tsx" \
  "src/components/home/FaqSection.tsx" \
  "src/components/home/PartnersSection.tsx" \
  "src/components/home/WhySection.tsx" \
  "src/components/home/FacilitiesSection.tsx" \
  "src/components/home/CentersSection.tsx" \
  "src/components/home/ClinicSection.tsx" \
  "src/app/[locale]/contact/page.tsx" \
  "src/app/[locale]/career/[jobId]/page.tsx" \
  "src/app/[locale]/emergency/page.tsx" \
  "src/app/[locale]/expect/page.tsx" \
  "src/app/[locale]/doctors/[doctorId]/page.tsx" \
  "src/app/[locale]/360-tour/page.tsx"
```

To revert a **single** file: `git restore <path>`.
To preview any change first: `git diff <path>`.

---

## 1. globals.css — the central change (most impactful)

The three shell helper classes (`.page-shell` 1512px, `.content-shell` 1352px, `.narrow-shell` 1200px) got a smoother responsive horizontal-padding ramp.

| Breakpoint | Before | After |
|---|---|---|
| base (mobile) | 1rem (16px) | 1rem (16px) — unchanged |
| sm ≥640 | 2rem (32px) | 1.5rem (24px) |
| md ≥768 | — (none) | 2.5rem (40px) ← new tablet step |
| lg ≥1024 | 5rem (80px) | 3.5rem (56px) |
| xl ≥1280 | 5rem (80px) | 5rem (80px) |

Net effect: phones unchanged; tablets get a sensible middle step instead of jumping straight to 80px; desktop still resolves to 80px. This improves **every** page already using a shell class.

## 2. Home/about section wrappers → `page-shell`

Replaced the repeated inline string `max-w-[…] mx-auto w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-[80px]` with the `page-shell` class (extra flex/gap classes kept). Files:

- `NewsSection.tsx` (2 wrappers)
- `FaqSection.tsx`
- `PartnersSection.tsx`
- `WhySection.tsx`
- `FacilitiesSection.tsx`
- `CentersSection.tsx` — also widened cap 1280 → 1512 (unified to page-shell)
- `ClinicSection.tsx` — also widened cap 1280 → 1512 (unified to page-shell)

> Note: `CentersSection`/`ClinicSection` content is now slightly wider on large desktops (1512 vs 1280). If you preferred the narrower look, change `page-shell` → `content-shell` in just those two files.

## 3. Route pages

| Page | Before | After |
|---|---|---|
| `contact/page.tsx` | `px-5 lg:px-[80px]` + inner `max-w-[1320px]` | `content-shell` (dropped the 1320 cap) |
| `career/[jobId]/page.tsx` | `max-w-[1168px]/[1144px] mx-auto px-5 xl:px-0` (not responsive) | `narrow-shell` (×3 wrappers) |
| `emergency/page.tsx` | outer `px-5` (flat) | `px-4 sm:px-6 md:px-10 lg:px-14 xl:px-[80px]` |
| `expect/page.tsx` | outer `px-5` (flat) | `px-4 sm:px-6 md:px-10 lg:px-14 xl:px-[80px]` |
| `doctors/[doctorId]/page.tsx` | `px-4 sm:px-8 lg:px-[80px]` / `px-5 sm:px-8 lg:px-[120px]` (no tablet step) | added `md:px-12` / `md:px-16` — all other breakpoints unchanged |
| `360-tour/page.tsx` | `px-4 sm:px-8 lg:px-[80px]` (no tablet step) | added `md:px-12` — all other breakpoints unchanged |

## 4. Large-screen fix

- `NewsSection.tsx`: side news panel was fixed `lg:w-[632px]`, which squeezed the featured image to ~240px at the lg breakpoint. Changed to proportional `lg:w-[44%]` (both the real panel and its loading skeleton).

---

## Left intentionally untouched
- Auth pages (login/register/forgot/reset), profile, complete-profile, mobile — already responsive (centered cards).
- `news/page.tsx` `xl:w-[632px]` — gated at xl and stacks below, not broken.
- `SpecialistSection` full-bleed carousel, Hero/Tour/Map sections, CentersSection gallery column — deliberate designs.
- Admin panel & Payload CMS — out of scope.
