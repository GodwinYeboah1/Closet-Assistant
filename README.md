# Closet Assistant

A wardrobe inventory app. You photograph the clothes you actually own, and the
app suggests outfits built **only** from that catalog — for everyday wear or for
a specific occasion ("job interview", "casual weekend", "date night").

Nothing is recommended that you don't already own. There is no shopping surface,
no resale integration, and no plan to add one.

## Why it's built this way

Reviews of existing wardrobe apps (Stylebook, Whering, Acloset, Indyx) converge
on the same complaints: cataloguing takes hours, auto-tagging is wrong often
enough that correcting it is slower than typing it, background removal fails
quietly, and outfit suggestions restyle the same few items. The full research
and the design direction are in [`docs/creative-brief.md`](docs/creative-brief.md).

The decisions that follow from it:

- **The camera stays alive between items.** Shutter → one-tap category → back to
  the viewfinder. Two taps per garment, so a shelf is a batch job.
- **Capture asks for one thing only.** Category. Colour is guessed from the
  pixels; everything else is editable afterwards, so a wrong guess never blocks
  the loop.
- **Clean-up is honest.** If background separation looks implausible the app
  keeps the photo as shot and says so, rather than shipping a mangled cut-out.
- **Suggestions rank for rotation.** Items you haven't worn in a while rank up;
  items already in heavy rotation rank down. Each suggestion says in one plain
  sentence why it was built that way, and names what the closet is missing
  instead of inventing a substitute.

## Design direction

"Workshop light" — warm paper ground for reading and browsing, near-black
edge-to-edge for the camera. One clay accent, used only for the shutter and
primary actions; the garment photos supply the rest of the colour.

- **Base reference:** [Cloud Closet App — UI/UX Case Study](https://dribbble.com/shots/21699983-Cloud-Closet-App-UI-UX-Case-Study)
  for structure, [Clothes Scanning App](https://dribbble.com/shots/6750416-Clothes-Scanning-App)
  for the capture flow.
- **Type:** Geist Sans for the interface, Geist Mono for metadata (wear counts,
  "worn 12 days ago") — the one deliberate signal that this is an instrument.
- **Palette tokens:** defined in `src/app/globals.css`, light and dark.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Then:

```bash
npm run build      # production build
npm run lint       # eslint
npx tsc --noEmit   # typecheck
```

The camera needs a **secure context**: `localhost` works, but on a phone over
LAN you'll need HTTPS (`next dev --experimental-https`, or a tunnel). Without a
camera the "Library" button runs the same flow from an existing photo.

## Project structure

```
src/
  app/
    page.tsx                 Today — suggestion + what you haven't worn lately
    capture/page.tsx         Full-screen camera flow
    closet/page.tsx          Catalog grid, filters, sorting
    closet/[id]/page.tsx     Item detail: edit tags/photo, mark worn, delete
    outfits/page.tsx         Occasion-based suggestions
    globals.css              Design tokens + keyframes
  components/
    camera/                  CameraCapture, CategoryStrip, SavedConfirmation
    closet/                  ClosetView, ItemCard, FilterBar, ItemEditor
    outfits/                 OutfitBoard, OutfitCard
    today/                   TodayView
    nav/, ui/                Bottom nav, page header, empty state
  lib/
    types.ts                 ClothingItem, Outfit, categories, colours, occasions
    store.ts                 Persistence (localStorage) — the swap point for an API
    useCloset.ts             useSyncExternalStore bindings over the store
    image.ts                 Auto-crop + background knockout, with bail-outs
    color.ts                 RGB → colour bucket
    suggest.ts               Deterministic outfit ranker
    format.ts                "Worn 12 days ago"
docs/creative-brief.md       Research and design decisions
```

## Data models (placeholder)

`ClothingItem` — `photoUrl`, `category` (shoes / shirt / pants / jacket /
accessory), `color`, `tags[]`, `occasions[]`, `name?`, `lastWornAt`,
`wearCount`, `createdAt`.

`Outfit` — `itemIds[]`, `occasion`, `note?`, `wornAt`, `createdAt`.

## How the photo clean-up works

`src/lib/image.ts` flood-fills inward from every frame edge within a colour
tolerance, treats what it reaches as background, makes it transparent, and crops
the remaining subject to a padded square.

It is deliberately conservative. If less than 12% or more than 94% of the frame
is classed as background — a busy backdrop, or a garment the same colour as the
wall — it discards the mask, falls back to a centre crop, and reports
`backgroundRemoved: false` so the UI can say so. Shooting against a plain,
contrasting surface gives the best results.

`processCapture()` is the seam: swap it for a real segmentation model and
nothing else changes.

## Known limits (deliberate, for this scaffold)

- **Storage is `localStorage` and photos are data URLs**, so the practical
  ceiling is a few dozen items. Moving to IndexedDB (or an API + object storage)
  means rewriting `src/lib/store.ts` and nothing else — every read and write in
  the app already goes through it.
- **No test runner is wired up yet.** The pure logic in `image.ts` (mask,
  bounds, crop geometry) and `suggest.ts` was verified headlessly during
  development; Vitest is the obvious next addition.
- **No auth, no sync, no backend.** Everything is per-browser.
