This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Syncing content from Google Sheets

Site copy (Home, Contact, and the four Create-tool guide pages) is authored in a private
Google Sheet and pulled into the codebase by two scripts. Whenever the sheet changes,
re-run:

```bash
npm run sync:guides   # Photo Overlay Editor, Photo Quote Maker, Polka Dot Generator,
                       # Geometric Pattern Generator -> src/content/guides/generated/*.ts
npm run sync:site     # Home, Contact -> messages/{en,jp,id}.json
```

Add `:check` to either command (`npm run sync:guides:check` / `npm run sync:site:check`) to
preview whether anything would change without writing files. Neither script ever runs git —
review the diff (`git diff`) and commit it yourself.

Both scripts read the same spreadsheet, [DottyPic Website Content
v2](https://docs.google.com/spreadsheets/d/1qHeRinNDikBlDFwwkXQfxx4DBlzRKCycyGC5Y0Rwmhc/edit),
via a Google service account.

### One-time credential setup

Copy `.env.example` to `.env.local` and fill in:

```
GOOGLE_SHEETS_SPREADSHEET_ID=1qHeRinNDikBlDFwwkXQfxx4DBlzRKCycyGC5Y0Rwmhc
GOOGLE_SERVICE_ACCOUNT_EMAIL=guide-sync-bot@dottypic-guide-sync.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_B64=<base64-encoded private key>
```

The `guide-sync-bot` service account already exists (GCP project `dottypic-guide-sync`) and
is already shared as Viewer on the sheet — you only need to issue it a key:

1. [Cloud Console → IAM & admin → Service
   accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) → `guide-sync-bot` →
   **Keys** → **Add key** → **Create new key** → JSON. This downloads a JSON file — it's a
   live credential, so keep it out of the repo and out of any chat/log you don't fully
   trust. Google never lets you re-download a key's private material after this step, so if
   you lose the file you'll need to create a new key (the old one can stay active, unused).
2. Extract and base64-encode the private key (do this locally — never paste the raw key
   anywhere):
   ```bash
   python3 -c "import json;print(json.load(open('<downloaded-file>.json'))['private_key'])" | base64 -w0
   ```
3. Paste that output as `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_B64` in `.env.local`.

`.env.local` is gitignored and never leaves your machine, so a fresh checkout (new machine,
new container, new Claude Code session) needs this done again — see `docs/guide-pages.md`
§ M7 for the full one-time GCP project setup if the service account itself ever needs
recreating from scratch.

### What's not synced yet

- The sheet's `Header` and `Footer` tabs aren't read by either script.
- `Hero Image` / `Feature Image` (guide pages) hold Google Drive share links, which the
  `GuideImage` type can't use directly (it expects a `public/`-relative path) — not wired up.
- One `Meta::OG Image Alt` cell (Polka Dot Generator tab) currently contains a pasted-in
  Drive URL instead of alt text — fix that cell in the sheet before mapping it.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
