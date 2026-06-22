# Payload Feature Gaps

This is a frontend-driven list of Payload features or backend capabilities that would improve the website once Payload work resumes.

## High Priority

### 1. Real Email Delivery

- Current state: Payload warns that no email adapter is configured.
- Why it matters: appointment, inquiry, admin, and reporting flows should send real emails instead of console output.
- Needed:
  - choose provider
  - configure adapter
  - define recipients for operational emails

### 2. GA4 Admin Import Completion

- Current state: website GA4 tracking works, but Payload-side GA report import is incomplete.
- Why it matters: admin dashboard reporting cannot fully rely on GA4 yet.
- Needed:
  - install `@google-analytics/data`
  - configure `GA4_PROPERTY_ID`
  - configure `GA4_SERVICE_ACCOUNT_KEY`
  - verify scheduled import and dashboard display

### 3. Better Doctor Schedule / Availability Data

- Current state: appointment booking can choose doctor, department, and preferred time, but there is limited real scheduling intelligence.
- Why it matters: smoother booking and fewer manual corrections.
- Needed:
  - clear doctor availability model
  - branch-aware schedules
  - optional blocked dates / leave / unavailable periods
  - service-to-doctor compatibility rules

### 4. Appointment Workflow Management In Payload

- Current state: website submits appointments, but operational workflow can still be stronger.
- Why it matters: staff need a clearer pipeline after submission.
- Needed:
  - appointment status flow
  - assignment / owner
  - notes / follow-up history
  - optional notification rules

## Medium Priority

### 5. Better Branch-Aware Content Modeling

- Current state: branch-aware behavior exists in several frontend flows, but Payload content relationships can be made more consistent.
- Why it matters: reduces frontend workarounds and stale data risk.
- Needed:
  - consistent branch relation across departments, doctors, services, tours, and promotions
  - clearer publishing rules per branch
  - easier branch filtering in admin

### 6. More Complete SEO / Metadata Controls

- Current state: many pages rely on frontend defaults and code-level metadata decisions.
- Why it matters: marketing and content teams may want control without code edits.
- Needed:
  - per-page SEO title
  - per-page meta description
  - OG image support
  - canonical control where needed

### 7. Structured Homepage Section Management

- Current state: several homepage sections still depend on frontend shaping/filtering logic.
- Why it matters: content updates are easier if editors can manage section visibility and order in Payload.
- Needed:
  - section visibility toggles
  - ordering controls
  - editor-friendly featured content selection

### 8. Stronger Media Governance

- Current state: media works, but image quality and consistency depend heavily on frontend choices.
- Why it matters: better performance and cleaner content operations.
- Needed:
  - asset guidelines
  - required image dimensions for key content types
  - alt text enforcement where appropriate

## Lower Priority / Nice To Have

### 9. Better Content Review Workflow

- Needed:
  - draft review flow
  - approver roles
  - publish checklist for medical/public pages

### 10. More Operational Dashboard Metrics

- Needed:
  - branch-level appointment trends
  - inquiry conversion tracking
  - doctor interest ranking
  - service/package performance views

## Suggested Next Payload Discussion

When Payload work resumes, the best next conversation is:

1. Which operational flows must be fully managed inside Payload?
2. Which analytics must be visible in admin vs only in GA4?
3. Which content should be branch-aware by default?
4. Which parts of homepage and SEO should editors control without code changes?
