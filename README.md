# Better Taro 75

A faster, filterable UI for the **[Taro 75](https://www.jointaro.com/interviews/taro-75/)**
— the list of the 75 most frequently asked data-structures & algorithms interview
questions. Sort and filter by difficulty, topic and company, read the full approach
and reference solutions in 12 languages, and track your own progress locally.

🔗 **Live:** https://orkhan-huseyn.github.io/better-taro75/

> Problem data and explanations are sourced from [Taro](https://www.jointaro.com/).
> This is a personal-use reader with a nicer UI; all credit for the content and the
> "Taro 75" ranking goes to Taro. Each problem links back to its LeetCode source.

## Features

- **Filter & sort** the full list by difficulty, topic (14), company (134), search
  text, and solved/confidence status — all client-side and instant.
- **Rich problem pages** with the statement, a plain-English summary, clarifying
  questions, edge cases, brute-force vs optimal solutions, Big-O analysis, and
  syntax-highlighted code in 12 languages.
- **Progress tracking** stored entirely in your browser's `localStorage`: mark
  problems solved, rate your confidence, and keep per-problem notes. Export/import
  your progress as JSON.
- **Dark / light mode**, fully responsive, no backend.

## Tech

- Next.js (App Router) with `output: 'export'` — a fully static site.
- Tailwind CSS + Radix UI primitives.
- Zustand (+ `persist`) for local progress.
- [Monaco editor](https://microsoft.github.io/monaco-editor/) (read-only) to render
  the solution code. The JSON stores only raw source; highlighting happens at render
  time.

## Getting started

```bash
npm install
npm run collect   # fetch data + logos into src/data and public/logos
npm run dev       # http://localhost:3000/better-taro75
```

## Data collection

`npm run collect` (see `scripts/collect.mjs`) pulls everything from Taro's public
endpoints and bakes it into the repo, so builds need no network access:

- the ranked list from `/api/interview-insights-canonical/fetch-taro-75/`
- each problem's explanation from its public server-rendered page
- company logos, downloaded into `public/logos/`

Outputs land in `src/data/` (`problems.json`, `questions/*.json`, `companies.json`,
`topics.json`, `meta.json`). Re-run it to refresh the dataset.

## Build & deploy

```bash
npm run build     # emits static site to out/
npm run serve     # preview the exported out/ locally
```

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and deploys
to GitHub Pages. The site is served under the `/better-taro75` base path (configured
in `next.config.mjs`); keep the repo name and base path in sync.
