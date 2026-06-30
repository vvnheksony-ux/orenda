# Orienda Hospital — Payload API Endpoints

Base URL: `http://localhost:3000/payload-api` (dev) · `https://<your-domain>/payload-api` (prod)

All Payload collections are exposed as REST resources at this path. Standard verbs:
- `GET /{collection}` — list
- `GET /{collection}/{id}` — read one
- `POST /{collection}` — create
- `PATCH /{collection}/{id}` — update
- `DELETE /{collection}/{id}` — delete

Query params: `?depth=N&limit=N&page=N&sort=field&where[field][equals]=value&locale=en|km|zh&draft=true|false`

---

## Hospital content

| Collection | Slug | Example |
|---|---|---|
| Doctors | `doctors` | `/payload-api/doctors` |
| Doctor Schedules | `doctor-schedules` | `/payload-api/doctor-schedules` |
| Doctor Talks | `doctor-talks` | `/payload-api/doctor-talks` |
| Departments | `departments` | `/payload-api/departments` |
| Branches | `branches` | `/payload-api/branches` |
| Services | `services` | `/payload-api/services` |
| Service Packages | `service-packages` | `/payload-api/service-packages` |
| Centers of Excellence | `centers-of-excellence` | `/payload-api/centers-of-excellence` |
| Partners | `partners` | `/payload-api/partners` |
| News | `news` | `/payload-api/news` |
| Announcements | `announcements` | `/payload-api/announcements` |
| Health Tips | `health-tips` | `/payload-api/health-tips` |
| Careers | `careers` | `/payload-api/careers` |
| Promotions | `promotions` | `/payload-api/promotions` |
| FAQs | `faqs` | `/payload-api/faqs` |
| Insurance Updates | `insurance-updates` | `/payload-api/insurance-updates` |
| Tour Scenes | `tourScenes` | `/payload-api/tourScenes` |

## Site content

| Collection | Slug | Example |
|---|---|---|
| Pages | `pages` | `/payload-api/pages` |
| Media | `media` | `/payload-api/media` |
| Navigation | `navigation` | `/payload-api/navigation` |
| Social Links | `socialLinks` | `/payload-api/socialLinks` |
| Site Settings | `siteSettings` | `/payload-api/siteSettings` |

## Operations

| Collection | Slug | Example |
|---|---|---|
| Inquiries | `inquiries` | `/payload-api/inquiries` |
| Appointments | `appointments` | `/payload-api/appointments` |
| Purchases | `purchases` | `/payload-api/purchases` |
| Feedback | `feedback` | `/payload-api/feedback` |
| Patients | `patients` | `/payload-api/patients` |
| Testimonials | `testimonials` | `/payload-api/testimonials` |

## Admin / auth

| Collection | Slug | Example |
|---|---|---|
| Users | `users` | `/payload-api/users` (login: `/payload-api/users/login`) |
| Audit Logs | `auditLogs` | `/payload-api/auditLogs` |
| Analytics Events | `analyticsEvents` | `/payload-api/analyticsEvents` |
| KPI Snapshots | `kpiSnapshots` | `/payload-api/kpiSnapshots` |
| GA Reports | `gaReports` | `/payload-api/gaReports` |
| Content Search Index | `content-search-index` | `/payload-api/content-search-index` |

## Globals (singular, no ID)

| Global | Slug | Example |
|---|---|---|
| Hero | `hero` | `/payload-api/globals/hero` |
| Operational Settings | `operationalSettings` | `/payload-api/globals/operationalSettings` |
| Content (homepage) | `content` | `/payload-api/globals/content` |

## Auth

| Action | Endpoint |
|---|---|
| Login | `POST /payload-api/users/login` |
| Logout | `POST /payload-api/users/logout` |
| Current user | `GET /payload-api/users/me` |
| Refresh | `POST /payload-api/users/refresh-token` |
| Forgot password | `POST /payload-api/users/forgot-password` |
| Reset password | `POST /payload-api/users/reset-password` |

## Examples

```bash
# List published doctors in English
curl 'http://localhost:3000/payload-api/doctors?locale=en&where[_status][equals]=published&limit=10'

# Get a single doctor with relations expanded
curl 'http://localhost:3000/payload-api/doctors/1?locale=en&depth=2'

# Active schedules for a department
curl 'http://localhost:3000/payload-api/doctor-schedules?where[active][equals]=true&where[department][equals]=3'

# Latest news
curl 'http://localhost:3000/payload-api/news?sort=-publishedAt&limit=5&depth=1'
```
