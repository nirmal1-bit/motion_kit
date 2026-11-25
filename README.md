# Animation Template

A Vite + React + TypeScript playground for web animation, with Framer Motion, GSAP, and Three.js examples.

## Getting started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — start the local development server
- `npm run build` — type-check and create a production build
- `npm run preview` — preview the production build
- `npm run typecheck` — run the TypeScript project checks

## Structure

- `src/components` — reusable interface and motion components
- `src/sections` — focused animation demos
- `src/styles` — global styles and design tokens

The overview tab demonstrates Framer Motion. The GSAP tab uses the `useGSAP` hook for scoped, automatically cleaned up animations. The Three.js tab uses React Three Fiber and Drei for a small interactive 3D scene.

## 3D model credits

The exploded vehicle study loads the Electric Grand Tourer by [tevy](https://tevy.dev/models/electric-gt), licensed CC0 1.0. The demo uses the pinned LOD1 GLB endpoint so the model remains stable across revisions.
