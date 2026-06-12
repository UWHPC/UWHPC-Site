# UWHPC Site Redesign — Design Spec

Date: 2026-06-11
Status: implemented in this session (autonomous run — content frozen, visuals replaced)

## Goal

Full visual redesign of uwhpc.com. Constraints from the team:

- Dark scheme, using the dark brand asset variants
- Minimal and clean — not flashy for no reason
- Unique and modern; avoid the generic dark-cards-with-glow look the old site had
- **All content stays identical**: copy, links, sections, project list, contact channels

## Aesthetic direction: "Engineering datasheet"

The brand logo is a microchip with speed-trails (red #CD393C traces + silver #C8C8C8
package on near-black #1D1D1D). The redesign treats the whole page like a precision
engineering document — part datasheet, part PCB silkscreen:

- **Hairline rules instead of cards.** Sections are separated and structured by 1px
  borders, like rows of a technical drawing. No rounded glowing cards.
- **Numbered sections** with monospace indices (`01`, `02`, …) echoing silkscreen
  reference designators.
- **Speed-trail motif** from the logo (rounded-cap horizontal strokes + trailing dots)
  used as the single decorative element: hero ornament, section accents, hover states.
- **Chip-pin ticks** as small repeated rectangles on framed elements (team avatars,
  join banner) echoing the logo's package pins.
- **Title-block footer** styled like an engineering drawing's title block: a bordered
  grid of fields (project, copyright, links).
- Red is the only signal color, used sparingly: indices, status dots, CTA, hover.
  Silver/gray carries secondary information. Everything else is near-black.

## Tokens

- Backgrounds: `#111111` page, `#161616` raised, `#1d1d1d` (brand dark) panels
- Ink: `#e6e6e6` text, `#9a9a9a` muted, `#666` faint
- Accent: `#cd393c` (brand red), hover `#e04a4d`
- Border: `#2a2a2a` hairlines, `#3a3a3a` strong
- Radius: 0 (sharp corners everywhere — part of the datasheet identity; the only
  rounded things are dots/status indicators)

## Typography

- **Archivo** (variable, `wdth` axis) — display + body. Headlines set wide
  (expanded width, tight tracking, uppercase for section titles) for an industrial feel.
- **Fragment Mono** — all metadata: indices, labels, stats, tags, dates, nav links.
- Inter is removed.

## Layout per section (content unchanged)

- **Nav**: hairline-bottom bar, SVG logo mark + UWHPC wordmark, mono links with
  two-digit indices, red "Get Involved" square-corner button. Mobile: full-width
  bordered dropdown.
- **Hero**: asymmetric, left-aligned. Mono kicker row (status dot + team line),
  oversized Archivo headline with red emphasis, same subtext, same two CTAs.
  Large logo SVG on the right with speed-trail ornament. Bottom hairline strip of
  mono "spec" fields (existing About stats data: HPC/UW///++).
- **Projects**: ledger rows (index / title+description / tags / status / arrow)
  instead of cards. Scales to more projects as list grows.
- **Focus**: three columns divided by vertical hairlines, big mono indices, no boxes.
- **Team**: grid of framed members with chip-pin ticks on the frame; same
  placeholder names/roles; link to /team.
- **Blog**: same ledger-row treatment as projects; same placeholder post.
- **Contact**: definition-table rows: mono label / value / arrow; same 4 channels.
- **Join**: full-width framed banner with pin ticks and corner fiducials; same copy
  and buttons (Contact Us, Discord).
- **Footer**: title block — bordered field grid: logo + copyright, link fields
  (Email, GitHub, LinkedIn).
- **/team page**: same framed-member grid, full list.
- **About** stays commented out on the page, but the component is restyled to match
  (stats absorbed into hero spec strip remain duplicated in About for when it returns).

## Motion (restrained)

- One orchestrated hero load: staggered fade/translate via CSS animation delays.
- Scroll reveals: existing IntersectionObserver hook, smaller 12px translate.
- Hover: arrow nudges, row background tint, trace underline draw on links.
- Blinking status dot in hero kicker. No floating, no glow pulses, no shimmer.

## Assets

- SVG variants copied from /Users/selyss/Downloads/UWHPC-Assets/svg into `public/`
  (kebab-case). SVGs replace PNG usage in components for crispness; PNGs kept for
  OG/social images. Old PNG files left in place (no deletions).

## Out of scope

- No content edits, no new pages, no CMS, no analytics changes.
- `next.config.ts`, metadata, and deployment untouched (favicon/OG references as-is).
