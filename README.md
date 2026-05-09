# Dottypic

> Free online dot image generator and photo collage maker — no sign-up required.

**Live site:** https://dottypic.com

---

## What is Dottypic?

Dottypic lets users turn ordinary photos into polka-dot art in seconds. Upload a photo, choose a dot pattern, pick a layout, and download a high-resolution result. Everything runs in the browser — no server, no account.

The app ships two tools:

| Tool | Route | Description |
|---|---|---|
| **Decorate** | `/decorate` | Full-featured photo + dot canvas editor |
| **Moment Card** | `/moment-card` | 4:5 card with photo, auto color, and custom text |

---

## Features

### Decorate Tool

- **Photo upload** — drag-and-drop or file picker
- **Layouts** — 5 split modes: main-left, main-right, main-top, main-bottom, border frame
- **Background masks** — Plain, Kraft, Grid, Dot Grid, Noise, Lined
- **Dot customization**
  - Shapes: circle, heart, star, flower, diamond, crown, leaf, crescent, snowflake, character (emoji/text)
  - Count, size, size variance, opacity
  - Color modes: Auto (follows background), Single, Palette preset, Gradient (horizontal / vertical / radial)
- **Export** — downloads the canvas as a PNG

### Moment Card Tool

- Upload a photo and auto-extract dominant color for the card background
- Add custom title and subtitle text
- Export as a 4:5 portrait card PNG

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Components | [shadcn/ui](https://ui.shadcn.com) + Radix UI |
| Canvas | [react-konva](https://konva.js.org) / Konva.js |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| State | Redux Toolkit + React-Redux |
| Fonts | Nunito (body), Space Grotesk (headings), Inter, Azeret Mono |
| Toasts | Sonner |
| Deployment | Vercel |

---

## Project Structure

```
paper-dots/
└── paper-dots-frontend/       # Next.js application
    ├── public/
    │   └── papers/            # SVG background mask assets
    ├── src/
    │   ├── app/
    │   │   └── (public)/
    │   │       ├── page.tsx           # Landing page
    │   │       ├── decorate/          # Decorate tool
    │   │       ├── moment-card/       # Moment Card tool
    │   │       ├── faq/
    │   │       ├── contact/
    │   │       ├── privacy/
    │   │       └── terms/
    │   ├── components/
    │   │   ├── decorate/      # Canvas editor panels
    │   │   ├── moment-card/   # Moment Card panels
    │   │   ├── landing/       # Hero, features, CTA sections
    │   │   ├── layout/        # Header, Footer
    │   │   └── ui/            # shadcn/ui primitives
    │   ├── lib/
    │   │   ├── dotGenerator.ts        # Deterministic dot layout (Mulberry32 PRNG)
    │   │   ├── dotShapes.ts           # Konva shape draw functions
    │   │   ├── extractDominantColor.ts # Canvas-based color extraction
    │   │   └── papers.ts              # Background mask registry
    │   └── store/
    │       └── slices/
    │           ├── decorateSlice.ts
    │           └── momentCardSlice.ts
    └── package.json
```

---

## Local Development

### Prerequisites

- Node.js >= 20
- npm >= 10

### Setup

```bash
cd paper-dots-frontend
npm install
npm run dev        # starts at http://localhost:3000
```

### Build

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

---

## Environment Variables

Create `paper-dots-frontend/.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

In production set `NEXT_PUBLIC_SITE_URL=https://dottypic.com` in the Vercel dashboard.

---

## Deployment

The frontend deploys to Vercel automatically on push to `master`.

```bash
# Manual deploy via Vercel CLI
cd paper-dots-frontend
vercel --prod
```

Build config (`vercel.json`):
- Build command: `npm run build`
- Output: `.next`
- Framework: `nextjs`

---

## Design System

See [`paper-dots-frontend/DESIGN.md`](paper-dots-frontend/DESIGN.md) for the full design token reference including color palette, typography scale, component styles, and animation guidelines.

**Theme overview:**
- Landing page — light, warm cream (`#FFF9E0`) hero with indigo (`#4338CA`) accents
- Decorate editor — dark theme (`.theme-dark` CSS scope, black background, Framer Blue accents)

---

## License

Private — all rights reserved.
