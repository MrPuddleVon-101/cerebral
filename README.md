# Cerebral

Public research platform for Cerebral — a long-term investigation into compact,
non-invasive, ear-based brain-computer interfaces.

Built as a foundation, not a launch: durable routes, structured content, reusable
templates, and explicitly labelled placeholders where work does not exist yet.

---

## Running it

```bash
npm install
npm run dev        # http://localhost:3111
npm run build      # static export to ./out
npm run typecheck
```

`npm run build` writes a fully static site to `out/`. It needs no server and
deploys to GitHub Pages, Netlify, Vercel or any static host. `public/.nojekyll`
is present so GitHub Pages serves the `_next` directory.

If you deploy to a GitHub **project** page (`user.github.io/cerebral`) rather
than a user page or custom domain, set `basePath` and `assetPrefix` to
`'/cerebral'` in `next.config.mjs`.

---

## Where the content lives

Nothing on the site is hard-coded into a page component. Everything is data in
`/content`, typed by `/lib/types.ts`.

| File | Holds |
| --- | --- |
| `content/site.ts` | Project name, tagline, thesis, phase, email, nav, footer, disclaimer |
| `content/journey.ts` | The nine beats of the homepage scroll narrative |
| `content/research.ts` | Studies — question, methods, results, limitations, artifacts |
| `content/models.ts` | Model cards and experiments |
| `content/prototypes.ts` | Hardware version log |
| `content/roadmap.ts` | Milestones and their states |
| `content/publications.ts` | Publications, posters, competitions, talks (currently empty) |
| `content/updates.ts` | Lab notes |

### Adding a study

Append an object to `studies` in `content/research.ts`. The route
`/research/<slug>/` is generated automatically, the index picks it up, its tags
join the filter bar, and the detail page renders every section it has data for
and omits the rest. No layout code changes.

### The placeholder rule

`Artifact` entries carry `available: boolean`. When `false`, the UI renders a
dashed **NOT YET** row with the `note` explaining what it is waiting on — never a
dead link, and never something that could read as a result.

`results: []` on a study renders an explicit "no results" panel. Do not put a
number in `results` unless it came out of the project's own analysis.

---

## Structure

```
app/                  routes (Next.js App Router, static export)
components/
  site/               nav, footer, shared UI primitives
  research/           research index with client-side filtering
  three/
    Journey.tsx       homepage scroll narrative + pinned copy
    JourneyCanvas.tsx React mount point for the WebGL scene
    AmbientField.tsx  quiet particle backdrop for inner pages
    journey/
      brain.ts        procedural brain point cloud + electrode sites
      noise.ts        3D simplex noise
      shaders.ts      all GLSL
      engine.ts       scene, camera timeline, act weights, post-processing
content/              all site content
lib/types.ts          content schema
public/brand/         logo, derived from the supplied wordmark
```

---

## The 3D layer

One persistent WebGL canvas behind the homepage. A normalised scroll position
(0 → 1) drives camera keyframes, object visibility and material state. Nine acts:

| Act | Subject |
| --- | --- |
| 00 | Cortex, three-quarter — the hero |
| 01 | Close on the cortex, activation wavefronts |
| 02 | Full scalp montage — the cumbersome case |
| 03 | Dive to a compact around-ear array |
| 04 | Signal streaming out of the sensors |
| 05 | EEG and EMG separating into two channels |
| 06 | Layered decoding lattice |
| 07 | Around-ear device concept geometry |
| 08 | Cortex reformed, pulling back |

Everything in the scene is drawn as points from one material family, because the
Cerebral mark is itself a cluster of particles in the shape of a brain.

**The brain is generated, not loaded.** `brain.ts` builds it from maths: an
ellipsoid deformed into a cerebrum silhouette, a carved Sylvian fissure and
longitudinal fissure, ridged-noise cortical folding, a cerebellum with folia, and
a brainstem — with real surface normals so the gyri can be lit rather than
rendered as static. No model file, no download, ~300 ms to build.

### Tuning it

- **Timeline** — `KEYS` (camera), `ROTATION` (subject angle), `COMPOSITION`
  (where the subject sits in frame) in `engine.ts`. Keep these in step with
  `PLACEMENT` in `Journey.tsx`, which decides which side the copy is on.
- **Act visibility** — the `ramp(p, [...])` calls in the frame loop.
- **Anatomy** — `shapeCerebrum`, `sylvianGroove`, `foldAt` in `brain.ts`.
- **Grade** — `gradeShader` in `shaders.ts` (vignette, grain, aberration). It
  runs *after* the sRGB conversion; grain added before it is amplified roughly
  twentyfold in the shadows.

### Performance and degradation

- Three quality tiers by viewport, pointer type and core count: 115k / 58k / 24k
  points, with bloom disabled on the lowest.
- Device pixel ratio capped per tier.
- Camera FOV and dolly adapt to aspect ratio, so portrait phones still frame the
  subject.
- `prefers-reduced-motion` disables smooth scrolling, easing and animation; the
  scene renders statically and the copy is shown in full.
- If WebGL is unavailable or the module fails to load, the canvas is removed and
  the page reads normally. **No information exists only inside the 3D layer** —
  every point the journey makes is written out across Research, Technology,
  Build and Adoption.

---

## Design constraints

Deliberately set against the defaults that most AI-built sites converge on:
zero border radius, no card shadows, no gradient fills or glass, no orb or
dot-grid backgrounds, no three-card feature rows, no stock icon set. Hairline
rules and corner ticks instead of boxes. Blinker for display, JetBrains Mono for
anything machine-produced.

Two chromatic colours exist on the entire site — `--eeg` and `--emg` — and only
because the science requires those two channels to be distinguishable.

---

## Before publishing

1. Set a real `email`, `url` and `repo` in `content/site.ts`.
2. Fill in the `links` (GitHub, Scholar, ORCID) or leave them blank — blank
   renders as "not yet" rather than a broken link.
3. Set `basePath` if deploying to a GitHub project page.
