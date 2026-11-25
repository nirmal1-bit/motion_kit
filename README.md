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

## 3D scene

The exploded product assembly is built from procedural Three.js geometry and does not depend on an external model or asset download.
