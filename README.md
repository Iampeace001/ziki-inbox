# Ziki — Results & decisions

A responsive React + TypeScript prototype of an outcome-focused Issues Inbox.

## Run locally

```sh
npm install
npm run dev
```

## Check and build

```sh
npm run build
npm run preview
```

The build checks TypeScript before generating the production bundle in `dist/`.

## Interactions

- Filter between the overview, decisions, and completed outcomes.
- Approve a layout, authorize a bid, or skip an issue.
- Request design changes through an accessible modal with required feedback.
- Expand design comparisons and outcome evidence.
- Save demo decisions in browser local storage; reset them with **Reset demo**.

All data is illustrative, based on the supplied Ziki screenshots. Actions affect this browser demo only. There is no Ziki API integration and no agent registration. Original issue links open Ziki in a new tab. Result previews illustrate the concept and do not represent independently verified production evidence.

## Structure

- `src/App.tsx` — typed demo data, UI components, and local interaction state.
- `src/styles.css` — responsive layout and Ziki-inspired styling.
- `src/main.tsx` — React entry point.

React 19, TypeScript, Vite, and Lucide icons. The optional Google Fonts stylesheet falls back to system fonts when offline.
