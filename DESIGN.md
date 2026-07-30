# DESIGN.md — Tethered / "Expedition Field Guide"

<!--
THESIS: coordination reads as a led expedition, not a tech product — the
system refuses both the generic-AI-indigo dashboard and the twee "cute
travel app" pastel look.
OWN-WORLD: deep pine-ink + Expedition Green core, Trailmarker Amber as the
one signature "you are here" accent, Lake Teal for wayfinding/offline state.
Same tokens invert between a dark instrument-panel (guide) and warm paper
field-guide (traveler). Domine (journal-serif editorial voice) carries
headlines, Bevan (stamped trail-badge slab) carries marks/kickers/badges,
Public Sans (the U.S. federal government's own signage-grade humanist —
a deliberate nod to National Park Service wayfinding) carries UI and body,
JetBrains Mono carries GPS/measurement readouts only.
STORY: a guide opens a cockpit that feels like gear, not software; a
traveler opens a page that feels like a paper field guide, not a shrunken
dashboard. Same brand, opposite temperature, obvious within three seconds.
FIRST VIEWPORT: brand board — palette swatches, type scale, button states,
rendered side-by-side in both themes.
FORM: brief-pinned redesign, direct build (concept-seed tournament skipped
per new-work.md — palette, type direction, and motion doctrine were fully
specified in the brief; see chat).
-->

Replaces the prior transit-departure-board/indigo-navy world (evidence:
`git log`, prior `tokens.css`) — that world used a navy near-indigo field
that reads as the generic AI-dashboard default the new brief explicitly
bans, and is now anti-reference only.

## Palette

One hue family per role, each expanded to a full tint/shade ramp. Anchors
are the brief's pinned values; the ramp is new.

### Ink (pine-charcoal — dark surfaces, guide ground, all-theme text)

| Token | Hex | Use |
|---|---|---|
| `--ink-950` | `#0E1712` | Deepest recess (sunken wells, map chrome) |
| `--ink-900` | `#16211C` | Guide theme base surface (brief anchor) |
| `--ink-800` | `#1E2C25` | Guide raised surface (cards, sheets) |
| `--ink-700` | `#2B3B32` | Guide hairlines, borders |
| `--ink-600` | `#3D4F44` | Traveler secondary text (tinted, not gray) |
| `--ink-500` | `#576C5F` | Muted icons, disabled ink |
| `--ink-300` | `#A9B8AC` | Guide secondary text (tinted off ink, not gray) |

### Paper (warm topographic cream — light surfaces)

| Token | Hex | Use |
|---|---|---|
| `--paper-50` | `#FBF8F2` | Traveler raised surface / cards |
| `--paper-100` | `#F6F1E7` | Traveler base surface (brief anchor) |
| `--paper-200` | `#EDE4D2` | Traveler sunken wells, table stripes |
| `--paper-300` | `#E2D5BC` | Traveler hairlines, borders |
| `--paper-400` | `#C9B896` | Traveler disabled fills |

### Expedition Green (primary — brand core, wayfinding fills, success)

| Token | Hex | Use |
|---|---|---|
| `--green-900` | `#0F3324` | Text-on-paper emphasis |
| `--green-800` | `#14432E` | Deep fill (brief anchor — deep) |
| `--green-700` | `#195A3D` | Pressed state |
| `--green-600` | `#1F6B4A` | Primary fill (brief anchor) |
| `--green-500` | `#2C8560` | Hover state on dark |
| `--green-400` | `#4CA37D` | Icon-on-dark, active indicators |
| `--green-300` | `#7FC2A3` | Subtle fill on dark |
| `--green-200` | `#B5E0CB` | Tint fill on paper |
| `--green-100` | `#E1F3E9` | Success background wash |

### Trailmarker Amber (signature — CTAs, "you are here," key moments only)

| Token | Hex | Use |
|---|---|---|
| `--amber-900` | `#7A4E11` | Text-on-amber-tint |
| `--amber-800` | `#9C6818` | Pressed state |
| `--amber-700` | `#C08420` | Traveler CTA fill (contrast-safe on paper) |
| `--amber-600` | `#E8A13A` | Guide CTA fill / signature accent (brief anchor) |
| `--amber-500` | `#F0B155` | Hover glow on dark |
| `--amber-400` | `#F5C57E` | Subtle highlight |
| `--amber-300` | `#F9DBAC` | Tint fill |
| `--amber-200` | `#FCEBD1` | Announcement/callout background |
| `--amber-100` | `#FEF6E8` | Faintest wash |

Amber never carries body text or large fields — it is the scarce "signal
flare" color. Both themes pair amber fills with dark ink text, never white,
for contrast.

### Lake Teal (secondary — wayfinding, offline/nav, map chrome)

| Token | Hex | Use |
|---|---|---|
| `--teal-900` | `#123B42` | Text-on-teal-tint |
| `--teal-800` | `#185561` | Pressed state |
| `--teal-700` | `#1F7683` | Traveler wayfinding fill |
| `--teal-600` | `#2BAEBF` | Guide wayfinding fill (brief anchor) |
| `--teal-500` | `#45C2D2` | Hover on dark |
| `--teal-300` | `#A6E3EB` | Tint on dark |
| `--teal-200` | `#D2F1F5` | Offline-badge background |

### Semantic (warm-tuned — never neon/default)

| Token | Meaning | Guide value | Traveler value |
|---|---|---|---|
| `--success` | roll-call complete, on-time | `--green-400` | `--green-700` |
| `--success-bg` | success wash | `rgba(76,163,125,.14)` | `--green-100` |
| `--warning` | running late, attention | `--rust-500 #D97A34` | `--rust-700 #A65420` |
| `--warning-bg` | warning wash | `rgba(217,122,52,.16)` | `#FBE9D9` |
| `--danger` | missing traveler, alert | `--brick-500 #C24A3B` | `--brick-700 #963527` |
| `--danger-bg` | danger wash | `rgba(194,74,59,.16)` | `#FAE1DC` |

Warning/danger are deliberately *not* amber/red — rust and brick keep them
legible against the signature amber so a "you are here" moment and a "16/18
— 2 missing" alert never fight for the same visual register.

## Type

Every face chosen against the audience's own world, not training-data
defaults (Fraunces/Playfair/Space Grotesk/IBM Plex/DM Sans etc. — the prior
system's Space Grotesk + IBM Plex are the exact defaults this redesign
retires).

| Role | Face | Why |
|---|---|---|
| Display / editorial headlines | **Domine**, 500–700 | A sturdy book-printed serif — reads like an expedition journal or field-guide title page, not a SaaS landing page. Marketing hero, section heads, guide dashboard hero numerals context. |
| Badge / kicker / stamp | **Bevan**, 400, small sizes, tight tracking | A slab built like a rubber-stamped luggage tag or trail-badge — used sparingly for eyebrows, "YOU ARE HERE" marks, roll-call badges. Never body text. |
| UI / body | **Public Sans**, 400–800 | The U.S. federal government's own humanist sans (built for USWDS) — genuinely signage-grade legible at accessibility sizes, and an honest material link to National Park Service wayfinding rather than a costume. Carries all body copy, controls, traveler large-type screens. |
| Measurement / data | **JetBrains Mono**, 500–700 | GPS bearing, distance, countdown digits, roll-call tallies only — real measurement, not a "technical" costume. |

Scale (traveler body floor ≥18px per PRODUCT.md accessibility floor):

```
--text-3xl: clamp(2.5rem, 6vw, 4.5rem)   /* hero display */
--text-2xl: clamp(1.9rem, 3.4vw, 2.75rem) /* section head */
--text-xl:  1.5rem    /* card head, countdown label */
--text-lg:  1.25rem   /* traveler primary body */
--text-md:  1.125rem  /* base body, 18px floor */
--text-sm:  1rem      /* secondary */
--text-xs:  0.875rem  /* eyebrow/badge, uppercase only */
```

Tracking floor -0.03em on display; badges/eyebrows use +0.06em uppercase
(the one place tracking goes positive, by contrast with everything else).

## Theme mapping

Three `data-theme` values now exist (was two — `app` is retired and split
by role, since guide and traveler are visually opposite personalities):

- `marketing` — dark, cinematic, Persuade.
- `guide` — dark instrument-panel, Operate, rich/alive.
- `traveler` — light field-guide paper, Operate, calm/restrained.

| Token | `marketing` | `guide` | `traveler` |
|---|---|---|---|
| `--bg` | `--ink-950` | `--ink-900` | `--paper-100` |
| `--bg-raised` | `--ink-800` | `--ink-800` | `--paper-50` |
| `--bg-sunken` | `--ink-950` | `--ink-950` | `--paper-200` |
| `--text` | `--paper-100` | `--paper-100` | `--ink-900` |
| `--text-muted` | `--ink-300` | `--ink-300` | `--ink-600` |
| `--accent` (signature) | `--amber-600` | `--amber-600` | `--amber-700` |
| `--accent-hover` | `--amber-500` | `--amber-500` | `--amber-800` |
| `--accent-ink` (text on accent) | `--ink-950` | `--ink-950` | `--ink-950` |
| `--primary` (brand core) | `--green-600` | `--green-500` | `--green-600` |
| `--wayfind` (secondary) | `--teal-600` | `--teal-600` | `--teal-700` |
| `--line` | `rgba(246,241,231,.14)` | `rgba(246,241,231,.12)` | `rgba(22,33,28,.14)` |

## Shape

- `--radius-sm: 10px`, `--radius-md: 16px`, `--radius-lg: 28px` (cards stay
  12–16px per craft floor; 28px reserved for sheet/hero containers).
- `--tap-min: 64px` everywhere (accessibility floor applies to both roles,
  not just traveler — a guide mid-departure is also under time pressure).
- Signature shape motif: a single clipped corner (map-fold / trail-tag
  notch) on hero cards and badges only — never on every card, or it stops
  being a signature.

## Motion

"Purposeful, physical, confident" — feedback and place, never gatekeeping.

- Easing: `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)` (exponential
  ease-out, already-visible default) for all UI transitions.
- Guide: signature moments get orchestrated GSAP timelines (roll-call
  completion, countdown urgency); every live control (start roll-call,
  post announcement) fires on the input event itself, animation layers
  on top, never gates the tap.
- Traveler: one small delight only (the "I'm here" confirmation on
  roll-call). Everything else — countdown tick, compass arrow easing to
  point — is quiet and reassuring, no scroll spectacle, no ambient
  background motion.
- Marketing: full scroll-driven storytelling permitted; this is the one
  surface where motion is allowed to be the point.

## Component states (all require hover/press/disabled/loading/error/empty)

Documented per-component as they're built at each checkpoint; this file's
palette/type/motion sections are the durable contract. See the brand board
(`docs/brand-board.html`) for the rendered button/tile states in both
themes.
