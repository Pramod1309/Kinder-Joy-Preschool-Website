# Kinder Joy Preschool — Complete Website Code

## Quick look at the website

1. Extract this ZIP.
2. Install Node.js 24 or later if it is not already installed.
3. Open a terminal in the extracted `Kinder_Joy_Website` folder.
4. Run `node preview.mjs`.
5. Open http://localhost:8080 in your browser.

This previews all pages, images, animations, filters, tabs and dialogs. The local preview does not save enquiries; it shows a clear message if a form is submitted. The actual server/database implementation is included in `source/` and works on the deployed website.

## What is included

- `frontend/`: complete assembled HTML pages, CSS, browser JavaScript, logo, photography and fonts.
- `source/public/`: editable HTML templates, styles, browser JavaScript and assets.
- `source/scripts/fragments.js`: shared header/footer, form markup and program content.
- `source/worker/index.js`: enquiry API and staff authorization backend.
- `source/db/schema.js`: database schema.
- `source/drizzle/`: versioned database migrations.
- `source/scripts/`: build and validation scripts.
- `source/package.json` and `package-lock.json`: development dependencies.
- `source/dist/server/index.js`: ready-built JavaScript Worker.
- `source/README.md`: technical setup, content notes and backend details.

## Build from source

From the `source` folder, run:

```sh
npm ci
node scripts/build.js
node scripts/validate-artifact.mjs
node scripts/check.js
```

These commands work with Node.js 24+. Using `node scripts/build.js` directly also works on Windows without Bash.

The backend targets Cloudflare Workers with the managed `DB` D1 binding. Staff access uses Sites-provided ChatGPT identity and the server-side `ADMIN_EMAILS` allowlist. To host somewhere else, a developer must configure an equivalent database and trusted authentication integration. No production credentials, enquiry records, dependencies folder or Git history are included.

The `frontend/` folder is an export of the current built site. Source changes take effect when rebuilt and deployed; they do not automatically update this exported preview folder.

Website: https://kinder-joy-preschool.neelsahu33.chatgpt.site
