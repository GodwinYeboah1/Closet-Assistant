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

"Gallery" — dark by default, built around real garment photography. The grid is
made of full-bleed image tiles on a near-black ground with no card borders, so
the photos carry all the colour and the chrome recedes. One warm ember accent,
used only for the shutter, primary actions and active filters. Light mode is the
override rather than the default; the camera surface stays dark in both.

This replaced an earlier warm-paper direction built around transparent cut-outs
on a checkerboard plate — a treatment that reads well for knocked-out PNGs and
badly for photographs.

- **Base reference:** [Cloud Closet App — UI/UX Case Study](https://dribbble.com/shots/21699983-Cloud-Closet-App-UI-UX-Case-Study)
  for structure, [Clothes Scanning App](https://dribbble.com/shots/6750416-Clothes-Scanning-App)
  for the capture flow.
- **Type:** Geist Sans for the interface, Geist Mono for metadata (wear counts,
  "worn 12 days ago") — the one deliberate signal that this is an instrument.
- **Palette tokens:** defined in `src/app/globals.css`, light and dark.

## The sample closet

On a first run the app seeds **55 items**: 17 wardrobe staples as examples,
plus a catalogued collection treated as yours (not demo filler, and untouched by
"Clear examples") — seven Air Foamposite One colourways, seven Jordan retros,
six Yeezy silhouettes, Nike Dunks, two Timberland 6" boots, varsity and bomber
jackets, oversized earth-tone hoodies, cargo and parachute pants, several pairs
of jeans, a Yankees cap and a Louis Vuitton scarf.

The wardrobe staples are the **example items**, and the banner at the top of the
closet clears them in one tap.

Photography is **real product and garment photography referenced by URL**, not
bundled into the repo. Staples and streetwear come from Unsplash; sneakers and boots come from StockX's
product CDN, because no free-licensed Foamposite or Yeezy photography exists on
Unsplash, Pexels or Wikimedia and labelling a picture of a different shoe as a
Foamposite would be a lie the catalog repeats forever. Two items — a Louis
Vuitton scarf and a New York team jacket — carry no photo at all for the same
reason: nothing verifiable exists, so they are catalogued with their tags and a
"no photo yet" tile that opens the camera. StockX shots are a
retailer's copyrighted images — fine for a personal catalog, worth replacing
with your own captures before this is ever public. Referencing by URL also means
the samples — which means the samples exercise the same
remote-`photoUrl` path a real item will once there's object storage behind it.
Unsplash photos are free to use commercially and need no attribution; every
image was reviewed individually before being added. Item names describe what is
in the photograph and are not a claim about who made or owns the garment.

Each sample is flagged `isSample`, and the banner at the top of the closet
clears them all in one tap; once cleared they don't come back, and they never
mix into anything you add. To change them, edit `SAMPLES` in `src/lib/seed.ts`.

Because the photos are remote, the sample closet needs a network connection;
anything you capture yourself is stored locally and works offline.

## Mobile

Every interactive control meets a 44px minimum touch target, the bottom nav and
the camera controls respect `env(safe-area-inset-bottom)` so nothing sits under
the home indicator, and no page scrolls horizontally at 390px. Filter and
occasion rows scroll horizontally on purpose, inside their own containers.

Verified with Chrome device emulation at 390×844: the audit script checks
`scrollWidth` against `clientWidth` and measures every button, link and input.

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
    samples/                 First-run seeding + "clear examples" banner
    closet/                  ClosetView, ItemCard, FilterBar, ItemEditor, PhotoPending
    outfits/                 OutfitBoard, OutfitCard
    today/                   TodayView
    nav/, ui/                Bottom nav, page header, empty state
  lib/
    types.ts                 ClothingItem, Outfit, categories, colours, occasions
    store.ts                 Persistence (localStorage) — the swap point for an API
    useCloset.ts             useSyncExternalStore bindings over the store
    image.ts                 Auto-crop + background knockout, with bail-outs
    color.ts                 RGB → colour bucket
    seed.ts                  Starter closet: staples + the sneaker collection
    suggest.ts               Deterministic outfit ranker
    format.ts                "Worn 12 days ago"
docs/creative-brief.md       Research and design decisions
```

## Data models (placeholder)

`ClothingItem` — `photoUrl` (`null` for an item catalogued but not yet
photographed), `category` (shoes / shirt / pants / jacket /
accessory), `color`, `tags[]`, `occasions[]`, `name?`, `lastWornAt`,
`wearCount`, `createdAt`.

`Outfit` — `itemIds[]`, `occasion`, `note?`, `wornAt`, `createdAt`.

Seeded examples carry `isSample: true`; nothing else distinguishes them, so they
behave exactly like real items until you clear them.

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
