# Orienda Hospital — Page Tracker

## Public Pages

| Page | Route | Status | Notes |
|---|---|---|---|
| Homepage | `/` | ✅ Done | All sections implemented |
| About | `/about` | ✅ Done | |
| Doctors List | `/doctors` | ✅ Done | |
| Doctor Detail | `/doctors/[doctorId]` | ✅ Done | |
| Departments | `/departments` | ✅ Done | |
| Department Detail | `/departments/[departmentId]` | ✅ Done | |
| Clinics | `/clinics` | ✅ Done | |
| Clinic Detail | `/clinics/[clinicId]` | ✅ Done | |
| Centers of Excellence | `/centers-of-excellence` | 🔧 Check | Modified recently, needs QA |
| Promotions List | `/promotions` | ✅ Done | |
| Promotion Detail | `/promotions/[promoId]` | ✅ Done | |
| Promotion Purchase | `/promotions/[promoId]/purchase` | ✅ Done | Telegram + branch_payload_id fixed |
| News List | `/news` | ✅ Done | |
| News Detail | `/news/[newsId]` | ✅ Done | |
| Health Tips | `/health-tips` | ✅ Done | |
| Doctor Talks | `/doctor-talks` | ✅ Done | |
| 360 Tour | `/360-tour` | ✅ Done | |
| 360 Room View | `/360-tour/[roomId]` | ✅ Done | |
| Testimonials | `/testimonials` | ✅ Done | |
| FAQ | `/faq` | ✅ Done | |
| Insurance | `/insurance` | ✅ Done | |
| Emergency | `/emergency` | ✅ Done | |
| Contact Us | `/contact` | ✅ Done | Simple form → /api/inquiries |
| Send Inquiry | `/inquiry` | ✅ Done | Full medical inquiry form → /api/inquiries |
| Career List | `/career` | ✅ Done | |
| Career Detail | `/career/[jobId]` | ✅ Done | |
| What to Expect | `/expect` | 🔧 Check | Modified recently, needs QA |
| Book Appointment | `/appointments` | ✅ Done | |
| Login | `/login` | ⚠️ Untested | Auth flow not QA'd |
| Register | `/register` | ⚠️ Untested | Auth flow not QA'd |
| Forgot Password | `/forgot-password` | ⚠️ Untested | |
| Reset Password | `/reset-password` | ⚠️ Untested | |

## API Routes

| Route | Status | Notes |
|---|---|---|
| `/api/departments` | ✅ Fixed | Payload + overrideAccess |
| `/api/branches` | ✅ Fixed | Payload + overrideAccess |
| `/api/doctors` | ✅ Done | Raw SQL (localized fields) |
| `/api/doctor-schedules` | ✅ Fixed | Payload + overrideAccess |
| `/api/services` | ✅ Fixed | Payload + overrideAccess |
| `/api/service-packages` | ✅ Fixed | Payload + overrideAccess |
| `/api/packages` | ✅ Fixed | Payload + overrideAccess |
| `/api/promotions` | ✅ Done | Payload |
| `/api/news` | ✅ Fixed | Payload + overrideAccess |
| `/api/faqs` | ✅ Fixed | Payload + overrideAccess |
| `/api/tour-scenes` | ✅ Fixed | Payload + overrideAccess |
| `/api/appointments` | ✅ Done | Supabase insert + Telegram |
| `/api/purchases` | ✅ Done | Supabase insert + Telegram |
| `/api/inquiries` | ✅ Done | Supabase insert + Telegram |
| `/api/emergency` | ✅ Done | Supabase insert |
| `/api/careers` | ✅ Done | Payload |
| `/api/testimonials` | ✅ Done | Payload |
| `/api/partners` | ✅ Done | Payload |
| `/api/health-tips` | ✅ Done | Payload |
| `/api/doctor-talks` | ✅ Done | Payload |
| `/api/globals` | ✅ Done | Payload globals |
| `/api/auth/callback` | ✅ Done | Supabase OAuth |

## Known Gaps / Next Tasks

- [ ] Login / Register / Google OAuth — auth flow untested end-to-end
- [ ] `/centers-of-excellence` — QA after recent edits
- [ ] `/expect` — QA after recent edits
- [ ] i18n QA — Khmer (km) + Chinese (zh) visual check all pages
- [ ] Vercel deployment — env vars configuration
- [ ] Mobile responsive QA — all pages
