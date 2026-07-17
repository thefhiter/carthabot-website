# CarthaBot — website

Marketing site for the **CarthaBot** educational robot (FAB619) and its free
**CarthaBot Companion** app for Windows.

- **Design**: claymorphism (soft 3D, chunky, toy-like) — playful indigo `#4F46E5`
  - energetic orange `#EA580C`, Baloo 2 + Comic Neue (self-hosted).
- **3D hero**: the *real* CarthaBot model (exported from the Companion app's
  Blender pipeline, Draco-compressed GLB, 478 KB) on a fixed WebGL stage that
  travels with the scroll and parks next to the mode cards. Picking a mood
  recolours the robot's LED halo — like the real robot.
- **Languages**: English / French toggle (persisted).
- **A-grade care**: lazy-loaded WebGL (SVG mascot covers first paint), self-hosted
  woff2 fonts with `font-display: swap`, gzip static server, semantic HTML,
  skip-link, visible focus states, WCAG-checked contrast,
  `prefers-reduced-motion` honoured everywhere.

## Run

```bash
node server.js     # → http://localhost:9106
```

No dependencies — plain Node + static files. `public/` deploys as-is to any
static host (Vercel etc.).

## Structure

```
public/
  index.html            single page, EN strings inline + FR dictionary in JS
  css/style.css         claymorphism design tokens
  js/main.js            i18n, scroll reveals, mode picker, lazy 3D boot
  js/hero3d.js          Three.js stage (robot + halo + particles)
  lib/                  three.module.js r160 + GLTF/DRACO loaders + draco wasm
  assets/carthabot.glb  the real robot model (Draco)
  fonts/                Baloo 2 + Comic Neue woff2 (latin)
```
