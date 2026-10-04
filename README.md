# 90-Day Career OS

**Learn. Build. Track. Become Interview Ready.**

A personal, data-driven execution system that turns the static PDF
`90_Day_Career_Development_Plan_Improved.pdf` into a working application: daily tasks,
DSA pattern tracking, Core CS / AI-ML / GenAI / agent learning states, projects,
certifications, weekly reviews, milestones, analytics and a smart priority engine.

The PDF is the **source of truth** for the curriculum — every phase, week, checkpoint,
project, certification rule and success-checklist item is transcribed from it and lives in
`src/lib/seed/`.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

No sign-up, no login — the app opens straight on the Dashboard. On first launch the full
90-day roadmap (3 phases, 13 weeks, ~500 daily tasks, learning tracks, projects,
certifications, milestones, checklist) is seeded automatically. Pick your start date in
**Settings** and Day 1 of the plan becomes today.

```bash
npm run typecheck    # tsc --noEmit
npm run build        # typecheck + production build
npm test             # unit/seed/store smoke tests
npm run test:browser # headless-Chrome end-to-end smoke test
```

### PWA — install it as an app

The app is a full progressive web app: `public/manifest.webmanifest` + `public/sw.js`
(service worker, registered in `src/main.tsx`). On desktop Chrome/Edge click
**Install** in the address bar; on Android use **Add to Home screen**. Installed, it
launches standalone, starts on the Dashboard, and the shell works offline (progress is
stored locally anyway). Icons: `public/icons/` (192, 512, maskable 512).

### Theme

Light is the default (full dark mode is still available via the toggle in the header).
Existing installs are migrated to light once, on load.

### Data & storage

Everything lives in this browser's `localStorage` under a single local profile — no
account, no server, works offline. Progress survives refreshes. Use **Settings → Export
data (JSON)** for a backup, **Reset progress** to re-seed the roadmap.

---

## Architecture

```
src/
  lib/
    seed/         ← the PDF, transcribed (roadmap, learning tracks, projects, daily planner)
    types.ts      ← domain model
    repo.ts       ← single-user repository over browser localStorage
    compute.ts    ← progress, streaks, DSA/learning/project stats, milestones, insights
    priority.ts   ← "Next best action" engine (max 3 recommendations)
  store.ts        ← zustand store: boot + all actions, optimistic writes with rollback
  components/     ← UI kit, app shell (sidebar + mobile bottom nav), shared cards
  pages/          ← 12 screens
```

### Screens

Dashboard · 90-Day Roadmap (weeks, milestones, success checklist) · Daily Plan · DSA ·
Core CS · AI/ML · GenAI & Agents · Projects · Certifications · Weekly Reviews ·
Analytics · Settings.

### Notes on correctness

- Progress values are **computed from tracked data only** — the seed provides curriculum
  content, never progress numbers.
- Task completion updates the UI instantly and persists afterwards; a failed write rolls
  the UI back with an error toast (handles offline / duplicate submissions).
- Every screen has loading, empty and error states — no blank screens.
- Light-first design with a dark mode, responsive down to a phone (bottom
  navigation + drawer, one-tap task completion, fast DSA logging).
