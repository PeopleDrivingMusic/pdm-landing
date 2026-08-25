# PDM — Investor Deck

Self-contained, on-brand investor decks for **PDM (People Driven Music)**, matching the
landing page (dark + golden embers, Fraunces headlines). No build step, no dependencies.

| File         | What it is                                  |
| ------------ | ------------------------------------------- |
| `en.html`    | English deck (13 slides)                    |
| `ru.html`    | Russian deck (same structure, translated)   |
| `deck.css`   | Shared brand theme + slide/print layout     |
| `deck.js`    | Keyboard navigation + golden ember backdrop |

## View it

Just double-click `en.html` or `ru.html` — opens in any browser. An internet connection
is used once to load the fonts (Fraunces / DM Sans / Sora from Google Fonts).

- **Navigate:** `←` `→` `↑` `↓`, `Space`, `PageUp/Down`, `Home`, `End`, or scroll.
- Bottom-right shows the slide number; a gold progress bar runs along the top.

## Export to PDF (to send to investors)

1. Open the deck in **Google Chrome** (best print fidelity).
2. `Ctrl/Cmd + P` → **Destination: Save as PDF**.
3. **Layout: Landscape.**
4. **More settings → Background graphics: ON** (this keeps the dark background & gold).
5. Save. Each slide becomes one page.

> The live ember animation, slide counter and progress bar are automatically hidden in
> print; the static golden glows remain so the PDF still looks on-brand.

## Before you send — review these

All slides are now filled (no `[FILL IN]` placeholders remain). A few things to review /
adjust to taste:

- **Slide 12 — Team:** the solo founder (Ivan Izobov). Optional: swap the gradient avatar
  for a real photo, tweak the name/role wording.
- **Slide 13 — The ask:** currently **$150K pre-seed on a SAFE, $1.5M post-money cap,
  ~18-month runway**, use of funds 60 / 17 / 15 / 8 (Product / Artist acq / Growth /
  Ops). The cap is set intentionally low to leave room to negotiate up — adjust the
  amount/cap once terms with the lead investor firm up.
- **Slide 5/7 — payment mechanics:** the deck now describes a **$5-minimum wallet
  top-up** (batches a fan's spend across every artist they back) with the processor
  fee billed to the fan as its own checkout line, not carved out of the 80/20 split.
  If the actual product ships a different flow (different minimum, fee absorbed
  instead of passed through, etc.), update slide 5's muted line and slide 7's tier
  numbers to match — don't let the deck drift from what's actually built.
- **Slide 8 — competitive set:** Instagram was swapped for **Bandcamp** (a real direct
  competitor; Instagram was already covered by the Problem slide's fragmentation
  point). Bandcamp does have recurring artist subscriptions — the differentiation is
  retention/engagement (no feed/chat/reason to return), not payment mechanics. Don't
  overclaim "no subscriptions" there, it's checkable and wrong.

## Market slide — sources

The TAM/SAM/SOM figures (slide 3) are each sourced separately — verify the actual
report content before reusing a number, not just the title:

- **TAM $39.5B** — global recorded music revenue, 2025 (+9.4% YoY), **MIDiA Research**.
  Narrower than a generic "creator economy" TAM, but music-specific and directly
  defensible — this is the pie PDM's model actually competes for. (The broader
  all-content-types creator economy, ~$250B per Grand View Research/Precedence
  Research 2025, is cited only as context in the body copy now, not as the TAM row.)
- **SAM $400M** — PDM-addressable superfan spend, our own bottom-up estimate: ~10% of
  MIDiA's verified **8.2M** self-releasing-artist base (≈820k artists PDM could
  realistically reach) × ~40 avg. superfans/artist × $12/yr each (820k × 40 × $12 ≈
  $393.6M ≈ $400M — recompute this yourself before reusing it, the "$40/yr" phrasing
  in an earlier draft was wrong and didn't reconcile). This is narrower than
  Goldman Sachs' broader **$4.5B** "superfan monetization" figure ("Music in the Air"
  2024) on purpose — Goldman's number spans major-label artist fanbases too, which
  aren't PDM's beachhead segment. Cite Goldman's $4.5B as external validation/context,
  not as PDM's own SAM.
- **SOM $6.5M** — ≈1.6% of the $400M SAM by end of Y3. Bottom-up funnel (PDM's own
  planning assumption, not an external figure — label it as such):
  - Y1: ~400 artists × ~15 avg. paying superfans → ~6,000 subscribers → ~$72K GMV/yr
  - Y2: ~2,500 artists × ~30 avg. → ~75,000 subscribers → ~$900K GMV/yr
  - Y3: ~12,000 artists × ~45 avg. → ~540,000 subscribers → ~$6.5M GMV/yr
  At PDM's full 20% nominal take (processing fee is billed to the fan separately, see
  the Business Model slide's unit-economics breakdown), that's **~$1.3M PDM revenue
  run-rate by end of Y3**. Y2-Y3 implicitly assume a follow-on Seed round lands after
  this pre-seed — say so if asked, don't imply the $150K alone funds this trajectory.
- **8.2M** self-releasing artists earning **$2.0B** combined (a falling share) —
  **MIDiA Research** 2025/2024 reports (both linked in the deck).

## Editing copy

- Headlines/body live directly in the `<section class="slide">` blocks — edit the text
  in place. EN and RU are separate files; change both.
- Brand colors/fonts are CSS variables at the top of `deck.css` (mirrors
  `src/lib/styles/tokens.scss`). Change once, both decks update.

## Notes

- The deck is **static and standalone** — it is not wired into the SvelteKit app and has
  no effect on the website build.
- Source material: marketing voice from `src/lib/content.ts`, business vision from
  `PDM.md`, brand tokens from `src/lib/styles/tokens.scss`.
