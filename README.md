# ReLoop — e-waste assessment (frontend prototype)

A single-page, white, typography-led journey through five workflow stages:
**01 Upload → 02 Analyze → 03 Review → 04 Functionality → 05 Results**.

This is a **demo**: no real AI inference, authentication, payments or backend.
Findings come from a replaceable mock service, and the UI labels them clearly as sample data.

Stack: React 19 · TypeScript · Vite · Tailwind CSS v4 · Motion for React · Radix Dialog · Lucide icons · `@google/model-viewer` (lazy-loaded).

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build
npm run typecheck
npm run lint       # oxlint
npm test           # vitest — recommendation rules + state reducer
```

## Project layout

```
src/
  content/
    sections.ts       # section order, anchors, sidebar labels, editorial copy, media placement
    assets.ts         # editorial images / 3D models (empty until you add them)
    labels.ts         # functional English labels (statuses, outcomes, answers)
  types/assessment.ts
  services/
    assessmentService.ts      # the AssessmentService interface + active implementation
    mockAssessmentService.ts  # sample findings fixtures
  rules/recommendations.ts    # deterministic outcome rules
  state/                      # reducer, selectors, providers (assessment, navigation, announcer)
  components/
    layout/      # AppSidebar, MobileNavigation, JourneySection, SectionHeading, NavList…
    media/       # MediaSlot, ParallaxMedia, ModelViewer, EmptyMedia
    assessment/  # PhotoUploader, AnalysisStatus, ReviewPanel, EvidenceViewer,
                 # DamageOverlay, FindingsList, FunctionalityForm, ResultsSummary
```

## Replacing Lorem ipsum

All editorial copy lives in `src/content/sections.ts`:

- `heading` / `intro` for each section
- `resultsCopy.explanation` and `resultsCopy.alternativesIntro` for the results report

Edit the strings — no component changes needed. Functional text (buttons, validation,
disclosures, accessibility labels) is already final English and lives next to its component
or in `src/content/labels.ts`.

## Adding static images

1. Put the file in `public/assets/images/` (PNG, JPEG, WebP or AVIF; transparent PNG/WebP renders work well on the white page).
2. In `src/content/assets.ts`, set the slot's `src`:

```ts
'upload-visual': {
  id: 'upload-visual',
  type: 'image',
  src: '/assets/images/upload.webp',
  alt: 'Laptop photographed from above',
  aspectRatio: '4 / 5',     // keep this close to the file's real ratio
  objectFit: 'contain',
  parallaxStrength: 36,     // px, clamped to 0–48; reduced on mobile; 0 with reduced motion
},
```

Slots with no `src` show a quiet, size-stable empty box with no text. Images that fail to load fall back to the same state.

To add a slot to another section, add an entry to `editorialAssets` and reference it from that section's `mediaId` in `sections.ts`. `mediaSide` controls the desktop alternation.

## Adding GLB / glTF models

1. Put the model in `public/assets/models/`. For `.gltf`, keep its `.bin` and texture files next to it with the same relative paths.
2. Set the slot to `type: 'model'`:

```ts
'analyze-visual': {
  id: 'analyze-visual',
  type: 'model',
  src: '/assets/models/laptop.glb',
  poster: '/assets/images/laptop-poster.webp', // optional: shown while loading and as fallback
  alt: '3D model of a laptop',
  aspectRatio: '1 / 1',
  parallaxStrength: 40,
},
```

How the viewer behaves:

- `<model-viewer>` is loaded only when a model slot with a `src` gets near the viewport. Nothing loads if no model is set.
- The background is transparent.
- Models are display-only. They turn slowly on their own (`rotation-per-second="18deg"` in `ModelViewer.tsx`), and users can't drag, zoom or click them. The page always scrolls normally over the model, on touch screens too.
- With `prefers-reduced-motion`, the model stays still at its starting camera angle.
- Set a camera radius below 100% (e.g. `cameraOrbit: '-45deg 55deg 62%'`) to render a model larger than the automatic framing. For wide scenes, set `mediaWide: true` on the section in `sections.ts`. The media then takes half the row and extends slightly into the outer margin.
- Set `autoRotate: false` to keep a model still. Section 02's `retro-landfill.glb` scene uses this.
- If WebGL is unavailable or the file fails to load, the poster is shown. Without a poster, a neutral “3D preview unavailable.” slot is shown.

## Motion

All transitions share tokens in `src/lib/motion.ts`, so they move with the same feel. Adjust them there.

- **Section reveal:** heading then content cascade in (0.8s, 24px rise, soft ease-out). The media column fades in slightly later.
- **Parallax:** scroll progress passes through a spring (`SCROLL_SPRING`), so layers glide into place instead of locking to each scroll tick.
- **State changes:** `FadeSwap` re-enters content with a short fade and rise. Used for analysis status, review findings (including on category change) and the results report (when the outcome changes).
- **3D models:** crossfade with a slight scale-up when switching devices.
- **Reduced motion:** with `prefers-reduced-motion`, all of the above is instant.

## Progress pipeline

`ProgressRail.tsx` draws a line linking the five sections. On desktop it winds between the alternating columns, turning in the whitespace at the top of each section. On mobile it's a straight line down the left.

- **Completed step:** green node with a check
- **Current step:** green ring with a soft pulse
- **Upcoming step:** grey node

The green line draws itself up to the current step. Progress comes only from workflow completion (`selectCompleted`), never from scrolling. Steps that become invalid (for example, after changing photos) retract the line again.

Node positions are measured from each section header with `ResizeObserver`, so the line follows layout changes. The rail is decorative (`aria-hidden`) because the sidebar exposes the same state, and it's hidden when printing.

## Typographic parallax

Each section heading has three layers that scroll at different speeds (`SectionHeading.tsx`):
a large faint section number (up to 64px of travel), the heading (14px) and the intro (6px).
Travel is reduced to 40% on mobile and turned off with `prefers-reduced-motion`. Tune the `TRAVEL` values to change it.
Controls, form fields, uploaded photos and result text never move.

## Device types and their 3D models

The device picker at the top of **01 Upload** is driven by `src/content/devices.ts`. Each entry sets:

- the label and GLB model (`public/assets/models/retro-*.glb`)
- the camera angle (`cameraOrbit`, as `theta phi radius`, e.g. `'30deg 72deg auto'`). It sets the viewing height and starting side, and the model turns from there
- whether the display question applies (`hasDisplay`)
- the device-specific wording for the controls question (and an optional power hint)

Laptop is selected by default (`DEFAULT_CATEGORY` in `src/state/assessmentReducer.ts`). The selected device's model appears in the right-hand column on desktop and directly below the picker on smaller screens. It appears again in **05 Results**. The choice also pre-fills the category in **03 Review**, filters the sample findings, and adapts the questions in **04 Functionality**. Keyboards, mice, printers and routers skip the display question.

To add a device:
1. Add its id to `DeviceCategory` in `src/types/assessment.ts` and a label in `src/content/labels.ts`.
2. Put the `.glb` in `public/assets/models/` and add an entry to `devices.ts`.
3. Add sample findings and an `unassessed` list in `src/services/mockAssessmentService.ts`.

**Model orientation fix.** The original `retro-*.glb` exports are mirrored on the Z axis: text reads backwards and the front faces −Z. The copies in `public/assets/models/` were corrected with:

```bash
python3 scripts/fix-glb-mirror.py public/assets/models/retro-*.glb
```

The script adds a root node scaled `[1, 1, -1]` and doesn't touch geometry, materials or the originals. It's safe to run twice. If you re-export a model, run it again, or fix the axis conversion in the exporter.

Editorial assets are separate from user-uploaded device photos. Uploaded photos live only in in-memory state as object URLs. They are never written to `localStorage`, and their URLs are revoked when photos are removed or replaced, or when the assessment is reset.

## Connecting a real analysis API

The UI depends only on the `AssessmentService` interface in `src/services/assessmentService.ts`:

```ts
analyze(request: { source; photos: { id, file, view }[] },
        options: { signal: AbortSignal; onStage?(i): void }): Promise<AnalysisResult>
```

1. Create e.g. `src/services/httpAssessmentService.ts`. POST the photos as `multipart/form-data`, pass `signal` to `fetch`, and map the response to `AnalysisResult` with `origin: 'model'`.
2. Change the last line of `assessmentService.ts` to export it, and set `isLive: true`.
3. To draw damage boxes, return `box: { imageId, x, y, width, height }` (0–1, relative to the natural image size). `imageId` must equal the uploaded photo's `id`. `DamageOverlay` handles `object-fit: contain` letterboxing and resizing. Boxes are drawn only when ids match.
4. Update the demo disclosures in `PhotoUploader`, `AnalysisStatus`, `ReviewPanel` and `ResultsSummary` once results are real.

Requests are de-duplicated. Changing photos aborts any in-flight request, and stale responses are ignored by request id.

## Recommendation rules

`src/rules/recommendations.ts` is pure and unit-tested. Key guarantees:

- Working and wanted → **Reuse** (repair offered for visible damage). Working and not wanted → **Resell** with condition disclosure.
- Localized damage or partial faults → **Repair** assessment. A device that doesn't power on → **Repair** assessment. A photo never rules repair out.
- Unknown power or untested core functions → **Further Assessment Needed**. Functionality is never inferred from missing damage.
- Visible damage alone, however severe, never leads to **Recycle**. Recycle is primary only when the user reports nothing works *and* they no longer want the device.
- Findings the user marks as incorrect are excluded.
- Price is always **“Estimate unavailable”**. Any future fixture prices must be flagged `illustrative`.

## Current mock limitations

- Photos are validated (type, 10 MB limit, decodability, 6 max) but never analyzed. Findings are fixed sample fixtures for laptop and smartphone.
- The suggested category is a fixed sample value, so users must confirm it.
- The “Demo controls → Simulate an analysis failure” toggle exists only to exercise Retry.
- Feedback (“Mark as incorrect”) lives in memory and isn't sent anywhere.
- No damage boxes are drawn, because no fixture image + annotation pair is supplied.
- No persistence: reloading the page clears the assessment.
- Eight device types are supported (laptop, smartphone, tablet, desktop computer, keyboard, mouse, printer, router). Each has its own fixed sample findings.

## Printing

**Print / Save as PDF** prints only the Results report and its demo disclosure. Navigation, other sections, media slots and animation transforms are removed.
# AIMS-Demo
