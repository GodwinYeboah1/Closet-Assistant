# Closet Assistant — research and creative brief

_Prepared 29 Aug 2026, before any app code was written._

> **Research caveat, stated up front.** Dribbble blocks server-side fetching
> (every request returns a Cloudflare `202` with an empty body) and the Claude
> Chrome extension was not connected during this session, so the shots below
> could **not** be viewed as images. Each entry is characterised from the shot's
> own title, designer description and indexed metadata, plus the category it
> sits in. Treat the visual reads as provisional and worth a five-minute
> confirm pass in a browser before locking the direction. Everything in the
> market-research and brief sections is sourced from pages that were readable
> and is cited.

---

## 1. Design research

### 1.1 Shortlist

**A. Cloud Closet App — UI/UX Case Study** (Akash Ahmed)
<https://dribbble.com/shots/21699983-Cloud-Closet-App-UI-UX-Case-Study>

- **Why it fits.** It is the only shortlisted piece that is a full case study
  rather than a single screen, and its stated scope is almost exactly ours:
  organising a closet, creating looks, planning outfits, packing lists, and
  "how to style something in their wardrobe for any occasion." That means the
  screens we actually need — catalog grid, item detail, occasion-driven
  suggestion — already exist in one consistent system, so we inherit spacing
  and component decisions rather than inventing them per screen.
- **What to change.** Case-study presentations lean on hero photography and
  large aspirational imagery. For a daily tool the imagery should be the
  user's own garments on a neutral plate, not editorial shots, and the type
  scale should come down a step: a tool is read at arm's length, repeatedly,
  not admired once.

**B. Clothes Scanning App** (Ilya Sablin)
<https://dribbble.com/shots/6750416-Clothes-Scanning-App>

- **Why it fits.** This is the camera-capture reference. A scanning flow puts a
  full-bleed viewfinder with a framing guide and a single dominant shutter at
  the centre of the interaction — the pattern we want for "open camera, snap,
  tag, save" with minimal chrome.
- **What to change.** Scanner UIs usually terminate in a product lookup —
  "here's where to buy this." Ours terminates in a save to the user's own
  catalog. The result screen must confirm ownership, not surface commerce.

**C. Personal Stylist Mobile App UI** (Ronas IT, Aug 2025)
<https://dribbble.com/shots/26412350-Personal-Stylist-Mobile-App-UI>

- **Why it fits.** Recent, from a studio with a consistent house style; useful
  as a reference for how a styling app presents a recommendation as a
  composed set of garments rather than a list of rows.
- **What to change.** "Personal stylist" framing tends toward a boutique
  register — serif display type, high-contrast fashion photography, lots of
  negative space. We want the composed-set layout without the boutique voice.

**D. AI Wardrobe Planner App — Smart Outfit Calendar** (Feb 2026)
<https://dribbble.com/shots/27112926-AI-Wardrobe-Planner-App-Smart-Outfit-Calendar-Mobile-App-UI>

- **Why it fits.** Closest to the current market convention for AI wardrobe
  apps: a dated outfit card as the home surface. Useful as a check on what
  users will already recognise.
- **What to change.** Calendar-first is a heavier commitment than most people
  sustain; the calendar is a v2 surface. And "AI" as a visual motif (gradients,
  sparkles, glow) is exactly the trendy register the brief rules out.

**E. Pocket Closet** (Grace Frey)
<https://dribbble.com/shots/15188747-Pocket-Closet-Figma-App-Design>

- **Why it fits.** Its stated intent is to act "as an encouraging friend" —
  a warmer, less clinical tone than the rest of the shortlist, which is a
  useful counterweight to a purely utilitarian grid.
- **What to change.** Encouragement shades easily into gamification. Keep the
  warmth in the colour temperature and copy, not in badges or streaks.

### 1.2 Recommendation

**Base direction: A (Cloud Closet case study) for structure and system,
with B (Clothes Scanning) as the capture-flow reference.**

Reasoning: Closet Assistant lives or dies on two surfaces — a fast capture
loop and a catalog you can actually scan. A is the only reference that covers
the full set of surfaces coherently, so it minimises the number of independent
design decisions. B supplies the one interaction A doesn't foreground, and the
two combine cleanly because a full-bleed camera surface is a natural inversion
of a light catalog: the camera goes near-black and edge-to-edge, everything
else stays paper-light.

D is the honest runner-up — it is the most current and the most recognisable —
but calendar-first planning and an "AI" visual register both pull away from
"practical daily tool."

---

## 2. Market and concept research

### 2.1 How existing apps handle capture and cataloguing

| App | Capture and cataloguing | What works | What's clunky |
| --- | --- | --- | --- |
| **Stylebook** | Fully manual: photograph each item, remove background, tag across several fields. Roughly **6–8 hours for a 100-item wardrobe**. One-time $4.99, iOS only. | Deep data, outfit collaging, packing lists, cost-per-wear. | The setup cost is the product's biggest barrier; images can't be cropped when replaced, so items are resized by hand each time. |
| **Whering** | Auto background removal plus a scan that auto-tags the photo. | Strong cost-per-wear analytics and resale integration. | Background removal often leaves artefacts (hangers). Auto-tagging "can be quite frustrating when Whering gets it wrong." Outfit generation is rule-based, not really AI. |
| **Acloset** | AI auto-tags on upload, removing much of the manual entry. | Removes a real chunk of data entry; manual erase tool for background clean-up. | Upload "can be a bit glitchy" and may need several attempts; background removal is incomplete; suggestions produce "nonsensical outfit pairings" and keep restyling the same few items. |
| **Indyx** | Automates onboarding via **receipt scanning** rather than photos. | Genuinely attacks the setup-cost problem from a different angle. | Some features "nudge you toward buying more, not wearing what you have." |

### 2.2 Recurring complaints and gaps

1. **Setup cost is the #1 barrier.** One user logged 50+ items into Whering and
   found photographing each one "really tedious and time consuming." Every
   comparison article treats manual entry as the thing to be solved.
2. **Auto-tagging that's wrong is worse than no auto-tagging.** "The
   auto-tagging is inconsistent, getting the category right more often than
   colour, and users end up correcting entries as they go… correcting a
   machine's guesses can feel slower than just entering it yourself."
3. **Background removal fails quietly.** It leaves hangers and partial
   backdrops, and users can't always tell it went wrong until the catalog looks
   inconsistent.
4. **Suggestions are shallow and repetitive.** Both leading apps restyle the
   same handful of items and produce combinations disconnected from the user's
   actual taste — "a fun toy, but not a real solution."
5. **Commerce creep.** Several apps drift toward resale and shopping prompts,
   which cuts against "help me wear what I already own."

### 2.3 How occasion suggestions are usually presented

The dominant pattern is a **dated outfit card on the home screen** carrying
weather and temperature, regenerating when you change the date. Beyond that:
swipe-to-browse alternatives, and conversational input in newer apps ("I'm
feeling a bit autumnal but it's still warm outside"). Occasion coverage is
usually a preset list — wedding, formal dinner, going out.

### 2.4 Where Closet Assistant can differentiate

- **Batch capture as the default.** The camera never tears down between items:
  shutter → one-tap category → straight back to the viewfinder. This attacks
  complaint #1 directly, and it's a capture-loop decision, not a feature.
- **Ask for exactly one thing at capture time.** Category only. Colour is
  guessed from the pixels and everything else is editable later, so a wrong
  guess never blocks the loop — which is complaint #2's actual sting.
- **Say when clean-up didn't work.** If background separation looks
  implausible, keep the honest photo and say so on the review screen rather
  than silently shipping a mangled cut-out (complaint #3).
- **Rank for rotation, not novelty.** Suggestions favour items the user hasn't
  worn recently and penalise the ones already in heavy rotation, which is the
  concrete fix for "keeps restyling the same items" (complaint #4).
- **No commerce surface, ever.** Nothing is recommended that the user doesn't
  already own (complaint #5). This is also the honest interpretation of the
  brief's "not shopping-brand-like."

---

## 3. Creative brief

### 3.1 Direction

**"Workshop light."** A warm paper ground for everything the user reads and
browses; a near-black, edge-to-edge surface for the camera. Reference: the
Cloud Closet case study for structure, the Clothes Scanning shot for capture.
The register is a well-made tool — a good tape measure, not a lookbook.

### 3.2 Colour

Neutral-dominant, one accent, used sparingly (shutter, primary action, active
filter). Full light and dark palettes are defined as CSS custom properties in
`src/app/globals.css`.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `paper` | `#F7F6F2` | `#121316` | Page ground |
| `card` | `#FFFFFF` | `#1A1C20` | Item plates, panels |
| `ink` | `#14161A` | `#EDEBE6` | Text, primary buttons |
| `muted` | `#6E6A62` | `#9A968D` | Secondary text, metadata |
| `line` | `#E5E2DA` | `#2A2D33` | Borders, dividers |
| `clay` | `#B4613F` | `#C9714C` | Shutter, active state — accent only |
| `shell` | `#101114` | `#0A0B0D` | Camera surface |

Clay is warm and slightly dusty rather than saturated: it reads as considered
rather than promotional, and it doesn't fight the garment photos, which supply
all the real colour on screen.

### 3.3 Typography

**Geist Sans** for the interface and **Geist Mono** for metadata — wear counts,
"worn 12 days ago", session counters. The mono detail is the one deliberate
signal that this is an instrument rather than a catalogue; it costs nothing
(both ship with the Next.js scaffold, self-hosted via `next/font`) and it keeps
numeric columns aligned. No display serif — that's the boutique register we're
avoiding.

### 3.4 Camera capture UX pattern

Full-bleed viewfinder, minimal chrome, square framing guide as a hint (not a
crop box). One dominant clay shutter, flanked by a library picker and Done.

```
viewfinder → shutter (flash) → auto clean-up → category strip (one tap)
    → saved confirmation (~1.1s) → back to viewfinder
```

- **Two taps per item**, and the camera stays alive between items.
- **Retake** available on the review screen; **Escape** closes, **Space** fires
  the shutter on desktop.
- The saved beat is a real transition, not a toast: the cut-out settles, a
  check strokes in, a running session count appears. Then it's gone.
- All motion respects `prefers-reduced-motion`.
- If the camera is unavailable, the library picker still runs the whole flow —
  the app is usable on a desktop with no webcam.

### 3.5 Priorities for v1

1. **Batch capture loop** — the flow above, with auto-crop and background
   knockout, and an honest fallback when clean-up can't be trusted.
2. **Catalog you can scan** — square plates on a checkerboard so transparency
   reads as intent; filter by category and colour; sort by newest, least-worn,
   or longest-unworn.
3. **Full post-hoc editing** — name, category, colour, occasions, free-form
   tags, replace photo, delete. Nothing captured is locked in.
4. **Occasion suggestions from your own closet only** — a deterministic ranker
   that favours occasion-tagged and long-unworn items, shows its reasoning in
   one plain sentence, and names what's missing from the closet instead of
   inventing a substitute.
5. **Wear tracking** — one tap to log an item or a whole outfit as worn today.
   It's what makes "last worn" and the rotation ranking real rather than
   decorative.

Explicitly **not** in v1: calendar planning, weather, social sharing, resale,
any purchase or shopping surface.

---

## Sources

- [Acloset vs. Whering — Indyx](https://www.myindyx.com/versus/acloset-vs-whering)
- [Stylebook vs. Whering — Indyx](https://www.myindyx.com/versus/stylebook-vs-whering)
- [7 Best Whering Alternatives in 2026 — Nouva](https://www.nouva.app/blog/best-whering-alternatives-2026)
- [Stylebook App Review: 10+ Years of Wardrobe Tracking — Cotton Cashmere Cat Hair](https://www.cottoncashmerecathair.com/blog/2020/4/10/how-i-catalog-my-closet-and-track-what-i-wear-with-the-stylebook-app-review)
- [Acloset vs Whering 2026 — StylePal](https://stylepal.app/news/acloset-vs-whering)
- [Acloset — AI Fashion Assistant (Google Play)](https://play.google.com/store/apps/details?id=com.looko.acloset)
- [Fits — AI Stylist](https://www.fits-app.com/ai-stylist)
- Dribbble shots A–E, linked inline in §1.1
