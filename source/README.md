# Kinder Joy Preschool

Responsive website built with HTML, CSS and JavaScript only. No frontend framework. The JavaScript Worker backend uses a managed D1 database.

## Included

Home, Our Story, Programs, Admissions, enquiry privacy and protected School Desk pages. Responsive navigation, animated stickers, scroll reveals, reduced-motion support, keyboard-accessible activity tabs and dialogs, age filters, program details, and persisted enquiry forms. The staff inbox supports search, status filters and saved New / Contacted / Closed status.

## Build and verify

Use Node 24 or later. Run `npm ci`, `npm run build`, `npm run validate`, and `npm run check`. The check script uses isolated in-memory SQLite and never inserts enquiries into production.

HTML source is in `public/`. Shared fragments and program content are in `scripts/fragments.js`. CSS is in `public/styles.css`, browser behavior in `public/app.js`, and backend routes in `worker/index.js`. The build assembles the HTML and embeds local images, fonts and scripts into the Worker. Schema is in `db/schema.js`. Generate new migrations with `npm run db:generate`; never edit applied migrations.

## Staff access

School Desk uses platform-provided ChatGPT identity and a server-side ADMIN_EMAILS allowlist. The site owner is configured at deployment. Add additional authorized staff only through hosted environment settings. No application password is stored in client code. The example environment file documents configuration; it does not contain credentials.

## What the backend does

POST /api/enquiries saves valid parent enquiries with consent. GET /api/admin/enquiries returns the latest 500 records to authorized staff only. PATCH /api/admin/enquiries changes an enquiry status. Validation, bounded payloads, same-origin checks, retry deduplication, rate limiting and graceful failure messages are included. A saved request is not a confirmed visit or admission. Email/SMS notifications and payment processing are not configured.

## Confirm before public launch

The name, logo, tagline and establishment year are from the supplied logo. Program age ranges and other school copy are proposed editable content. Confirm actual programs, fees, timings, school address, contact details, admission rules and privacy/retention policy. No invented contacts, testimonials or statistics are shown. Classroom images are AI-generated illustrations and disclosed; replace them with authorized school photographs when available.

## Verification limits

The managed Worker ESM environment has no compatible supervised browser preview. Live browser screenshots and WebMCP runtime validation were unavailable. Route/asset checks and backend integration tests are included.
