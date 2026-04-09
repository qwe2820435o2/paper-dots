# Design System — BeFunky-Inspired Light Theme

## 1. Visual Theme & Atmosphere

Paper Dots uses a bright, approachable design inspired by BeFunky's playful aesthetic. The landing page features warm cream/yellow hero backgrounds, clean white content sections, and indigo accent colors. Decorative elements — dot matrix patterns and pastel-colored blobs — add visual interest without overwhelming the content.

The `/decorate` application page retains a dark theme via `.theme-dark` CSS class scoping, ensuring the canvas-based editor maintains optimal contrast for photo editing.

**Key Characteristics:**
- Warm cream hero background (`#FFF9E0`) with white content sections
- Indigo (`#4338CA`) as the primary accent/CTA color
- Space Grotesk display font with moderate negative letter-spacing (-2px to -3px)
- Decorative dot matrix patterns and pastel blob shapes
- Soft shadows and rounded corners (12px-16px)
- Clean card-based layouts with subtle borders

## 2. Color Palette

### Primary
- **White** (`#FFFFFF`): Primary background for content sections
- **Dark Navy** (`#1A1A2E`): Primary text color — headings and important text
- **Indigo** (`#4338CA`): Primary accent — CTA buttons, links, interactive highlights
- **Deep Indigo** (`#3730A3`): Hover state for CTA buttons

### Secondary & Muted
- **Slate Gray** (`#64748B`): Secondary text, descriptions, body copy
- **Light Lavender** (`#F1F0FB`): Muted backgrounds
- **Very Light Indigo** (`#F5F3FF`): Secondary surface color
- **Light Slate** (`#F8FAFC`): Footer and step-section background

### Decorative
- **Hero Cream** (`#FFF9E0`): Hero section background
- **Pastel Yellow** (`#FEF3C7`): Decorative blobs
- **Pastel Teal** (`#CCFBF1`): Decorative blobs
- **Pastel Purple** (`#EDE9FE`): Decorative blobs

### Borders
- **Slate Border** (`#E2E8F0`): Standard borders throughout light theme

### Dark Theme (`.theme-dark` scope — DecorateApp only)
- **Background**: `#000000`
- **Foreground**: `#FFFFFF`
- **Card**: `#090909`
- **Accent**: `#0099FF` (Framer Blue)
- **Border**: `rgba(255, 255, 255, 0.1)`

## 3. Typography

### Font Family
- **Display**: Space Grotesk — geometric sans-serif for headings
- **Body/UI**: Inter — variable sans-serif with OpenType features
- **Monospace**: Azeret Mono — for code and technical labels

### Hierarchy

| Role | Font | Size | Weight | Letter Spacing | Line Height |
|------|------|------|--------|----------------|-------------|
| Hero Heading | Space Grotesk | 48-80px | 500 | -3px | 1.0 |
| Section Heading | Space Grotesk | 36-48px | 500 | -2px | 1.1 |
| CTA Heading | Space Grotesk | 42-72px | 500 | -3px | 1.0 |
| Card Title | Inter | 18px | 600 | normal | 1.2 |
| Body | Inter | 16-17px | 400 | normal | 1.6-1.7 |
| Small Body | Inter | 14px | 400 | normal | 1.6 |
| Label/Step Number | Inter | 13px | 600 | 0.02em | 1.0 |
| Nav Link | Inter | 15px | 400 | normal | 1.0 |

## 4. Component Styles

### Buttons
- **Primary CTA**: `bg-[#4338CA] text-white`, pill shape (`rounded-full`), `hover:bg-[#3730A3]`, padding 12-14px vertical, 28-32px horizontal
- **Hover**: Scale 1.02 + color darken
- **Tap**: Scale 0.96

### Cards
- White background, `border border-slate-200`, `rounded-2xl`
- Soft shadow: `shadow-sm` default, `shadow-lg` on hover
- Internal padding: 24-28px

### Header
- Sticky, white/90% opacity with backdrop-blur
- Bottom border: `border-slate-200`
- Logo left, nav center, CTA right
- Mobile: hamburger menu

### Footer
- Background: `#F8FAFC`
- 4-column grid (brand, products, support, legal)
- Top border: `border-slate-200`

### Decorative Elements
- **DotPattern**: SVG-based dot grid, indigo at low opacity (20-40%)
- **DecorativeBlob**: Large pastel circles, absolute positioned, `pointer-events-none`

## 5. Layout Principles

### Container
- Max width: 1200px, centered
- Horizontal padding: 20px mobile, 32px desktop

### Section Spacing
- Vertical padding: 80px mobile, 112px desktop

### Grid
- 2-column for feature showcases (image + text)
- 3-column for cards (steps, styles)
- Single column on mobile

### Responsive
- Mobile: stacked layouts, smaller headings
- Desktop: side-by-side grids, full-size typography

## 6. Animation

All animations use Framer Motion with consistent easing `[0.22, 1, 0.36, 1]`.

- **Stagger containers**: Children animate with 0.1-0.12s delay
- **Entrance**: `opacity: 0, y: 20-28` → `opacity: 1, y: 0`, duration 0.6-0.75s
- **Scroll trigger**: `whileInView` with `viewport={{ once: true, margin: "-80px" }}`
- **Button**: `whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.96 }}`

## 7. Theme Scoping

The CSS variable system uses a two-layer approach:
- `:root` declares light theme values (used by landing page)
- `.theme-dark` class overrides with dark theme values (used by DecorateApp)
- Utility classes (`.sketch-border`, `.framer-card`) have `.theme-dark` variants
