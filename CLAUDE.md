# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Single-file static landing page for Dr. Ítalo Saffe Scio, dentist in Juiz de Fora, MG. No build tools, no dependencies, no framework. Everything lives in `index.html` — markup, inline `<style>`, and inline `<script>`.

To preview: open `index.html` directly in a browser (`file://` works fine).

## Design system: Refined Geometric Minimalism

- **Colors** (CSS custom properties in `:root`): `--color-bg #FFFFFF`, `--color-text #1C1C1C`, `--color-accent #C9A882`, `--color-accent-dark #A67C52`, `--color-surface #F4F4F2`
- **Fonts**: Plus Jakarta Sans (headings, UI) + Instrument Sans (body), loaded from Google Fonts
- **Layout**: 12-column grid via `.grid-12`; fluid spacing with `clamp()`
- **Border-radius rule**: zero radius on all elements except buttons (pills use `border-radius: 999px`)
- **Separators**: use `·` (middle dot U+00B7) — never `—` (em-dash U+2014)

## Key CSS classes

| Class | Purpose |
|---|---|
| `.display` | Hero H1, weight 300, `clamp(2.5rem, 6.5vw, 5.25rem)` |
| `.heading-lg` | Section headings, `clamp(2rem, 4vw, 3.25rem)` |
| `.section-title` | Small uppercase label above each section heading |
| `.megafigure` | Giant editorial number, `clamp(6rem, 14vw, 12rem)` |
| `.eyebrow` | Small uppercase tag with accent dot |
| `.lead` | Muted intro paragraph |
| `.btn--primary` / `.btn--ghost` | CTA buttons (pill shape) |
| `.reveal` | Elements animated via IntersectionObserver (adds `.is-visible`) |
| `.cases` / `.case` | Casos gallery wrapper / a single slide (`[data-case]`) |
| `.case__photo` / `.case__body` | Slide photo (`aspect-ratio 4/5`) / text column |
| `.case__text` / `.case__meta` | Ítalo's case text (paragraphs) / patient name + `Reabilitação Oral` |
| `.cases__arrow` / `.cases__dot` | Nav pill arrows / jump-to dots (in `.cases__controls`) |

## Hero structure

`.hero__main` is a 2-column CSS grid (1.2fr / 1fr). The smile SVG and eyebrow span live inside `.hero__copy` (left column) so the photo column aligns vertically with them. `.hero__top` is hidden (`display: none`) — it was the previous home for the eyebrow before the refactor.

Hero stagger animation: elements with `data-hero="N"` attributes are revealed sequentially via `setTimeout` calls spaced 80ms apart.

## Copy rules (strict — apply to all text edits)

- **Never use**: travessão `—`, "excelência", "renomado", "vasta experiência", "altamente qualificado", "comprometido", "dedicado", "missão", "transformar vidas", "sorrisos perfeitos", "equipe multidisciplinar"
- **Never mention**: years of experience, academic titles (Especialista, Pós-graduação), patient counts
- **Address patients as**: "você" — never "nosso paciente"
- **Tone**: human, direct, first-person where natural, like a knowledgeable friend
- **CTAs**: all point to WhatsApp (primary conversion goal)
- **Focus**: Reabilitação Oral only — no implant references anywhere on the page
- **Location**: Juiz de Fora, MG (not Recife, PE)
- **CRO**: keep `CRO-PE 00.000` as placeholder (legal requirement) in both hero and footer

## Page sections

`01 · Hero` → `02 · Sobre` → `03 · Especialidades` → `04 · Casos` (`#casos`) → CTA agendamento (`#agendar`) → `06 · Contato` → Footer

The `id="ano"` in the footer is updated dynamically by the inline `<script>` at the bottom.

## Casos gallery (`#casos`)

Editorial gallery of real cases. **These are not patient testimonials** — Ítalo himself writes a short text about each case (foto do paciente + esclarecimento dele), so copy is first-person from Ítalo, never a patient quote.

- Structure: `.cases` → `.cases__viewport` → `.cases__track` (flex, `translateX` via inline JS) → one `<article class="case" data-case>` per case. Controls (`.cases__controls`) sit below: prev arrow · dots · next arrow.
- **Navigation is manual only** (arrows + dots) — no auto-play (blocks are tall, so hover-to-pause made it never advance).
- **Adding a case** = paste a new `<article class="case" data-case>` (photo + text + `.case__meta`) into `.cases__track`, and drop the image in `depoimentos/<nome>.jpeg`. Dots regenerate automatically from the number of `[data-case]` slides.
- Images live in `depoimentos/` (named by patient, e.g. `depoimentos/lorraine.jpeg`).

## Screenshots / verificação visual (run after any layout change)

There is a Puppeteer script `screenshots.mjs` for desktop + mobile visual checks. **Puppeteer is NOT a project dependency** (keeps the "zero dependencies" rule) — the script reuses an install already on disk (sibling projects under `~/Desktop/Projects/*/node_modules/puppeteer`, Chrome in `~/.cache/puppeteer`).

Workflow after any change that affects layout/CSS/markup:
1. Ensure the server is up: `python3 -m http.server 3000`.
2. Run `node screenshots.mjs` — outputs to `screenshots/` (gitignored): `desktop-*` and `mobile-*` for header, full page, `#casos`, `#agendar`, `#contato`.
3. Review both breakpoints. Watch especially for mobile regressions: header CTA compact ("WhatsApp") and not touching edges, `#contato` values not overflowing (rows stack < 768px), and the Casos gallery intact.

The script forces `.reveal`/`[data-hero]` to `.is-visible` before capturing (otherwise sections shoot at `opacity: 0`). Desktop = 1440×900, mobile = 390×844 @2x.
