<p align="center">
  <img src="branding/al-bassam-schools.svg" alt="Al-Bassam Schools – مدارس البسام" width="720" />
</p>

<h1 align="center">🛟 Save the School Tech Fair!</h1>
<p align="center"><strong>The Ultimate Digital Mission</strong> — an interactive classroom competition for primary ICT students</p>
<p align="center">Built for the <strong>Al-Bassam Schools</strong> Science &amp; Technology Fair</p>

---

## 🎮 What is this?

A story-driven, fully interactive digital game for the classroom projector. A computer crash has deleted the Tech Fair's **registration system** and **budget records**. Students become *Digital Rescue Teams* and complete two missions to save the event.

> **Important:** The game does **not** create or download Microsoft Forms or `.xlsx` files. It guides, motivates, times, evaluates and rewards students while they do the **real work** in Microsoft Forms and Microsoft Excel on their own computers. Mission 2 also includes an **in-website Excel-style practice worksheet** (a learning simulator, not a real workbook file) so the class can type data and formulas together on the projector.

### Mission 1 — Operation Perfect Registration (Microsoft Forms)
- Create a registration form with **Choice, Text, Rating and Date** questions
- Customise the theme, add **branching logic** (Robotics / Science Experiments)
- Swap forms with another team and test them
- 🕵️ **Special challenge:** a randomly generated *Secret Visitor* identity for each team

### Mission 2 — Operation Money Master (Microsoft Excel)
- Enter the fictional Tech Fair budget, use multiplication (`=B2*C2`) and `=SUM(D2:D5)`
- Format with borders, colours and currency, then insert a chart
- 🚨 **Special surprise:** the 20% budget cut emergency and a money-saving challenge
- 💻 **In-website practice spreadsheet:** a separate saved worksheet for **each team** with editable cells (type, arrow keys, Tab, Enter, Delete), a formula bar, a real formula engine (`=B2*C2`, `=SUM(D2:D5)`, `=D6*20%`, parentheses, cycle/error detection), Bold / Fill / Currency / Borders formatting, animated Column and Pie charts with editable titles, a "Check my work" auto-checker, teacher-only starter-data and clear-sheet helpers, and password-protected auto-award buttons for the formula and chart points

### Finale
Animated leaderboard (maximum **100 points**, 7 rubric categories with teacher-editable scores), a podium reveal with confetti, printable certificates for 🥇 Digital Champions, 🥈 Data Detectives and 🥉 Tech Stars.

---

## ✨ Teacher controls

| Control | What it does |
| --- | --- |
| Top navigation | Jump between Teams, Missions, Leaderboard and Awards |
| ⏱ Timer | 1–30 minute presets, start / pause / reset, beeps in the final 10 seconds |
| 🔒 Teacher Lock | **Every forward step needs a 4-digit teacher password** (numeric keypad or keyboard). Going back to review a previous step stays free. The PIN lives in `src/config.ts` – change it there before publishing |
| 🔊 / 🔇 | Mute or unmute all synthesised sound effects (no audio files needed) |
| ↺ Restart | Reset all teams, scores and progress (with confirmation) |
| Score panels | `+` / `−` buttons or type a number directly; totals recalculate instantly |
| Task trackers | Tick each task for each team; class progress bars update live |
| Secret Visitor generator | Shuffles identities across teams with a slot-machine animation |
| Progress saving | All state is saved in the browser automatically (`localStorage`) |

The checkpoint also protects teacher-only actions: **starting each mission, completing a mission, revealing Secret Visitors, showing the Excel answer key, launching the Budget Emergency, opening the Award Ceremony and restarting the game**. Scoring, task ticking and exploring earlier screens stay free so the class can play along. A wrong PIN shakes the keypad and plays an alarm; a correct PIN plays an unlock sound and continues.

> This is a classroom control, not cryptographic security — the PIN is bundled in the client-side app. Keep it private from students.

**Tip:** press `F11` for full-screen projection. Print certificates with the 🖨️ button (or save as PDF).

---

## 🚀 Run locally

Requires Node.js 18 or newer.

```bash
npm ci           # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # create the production build in dist/
npm run preview  # preview the production build
```

The build uses `vite-plugin-singlefile`, so **`dist/index.html` is completely self-contained** — all JavaScript, CSS and illustrations are inlined. You can copy that one file anywhere (a USB drive, an LMS, a school server) and simply open it in a browser. Fonts load from Google Fonts when online, with system font fallbacks offline.

---

## 🌐 Publish to GitHub Pages

This repository is ready to publish:

1. Create a new GitHub repository and push this folder (the included `.gitignore` keeps `node_modules/` and `dist/` out of Git).
2. The included workflow `.github/workflows/deploy.yml` automatically runs `npm ci` + `npm run build` on every push to `main` and deploys the `dist/` folder.
3. In your repository go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**. You can also run the workflow manually from the **Actions** tab.
4. Your game will be live at `https://<username>.github.io/<repository>/`.

Because the output is a single HTML file, you may also publish only `dist/index.html` to any static host (Netlify, Cloudflare Pages, school intranet) — no server configuration needed.

### Typical repository contents

```
├── branding/                 # Al-Bassam Schools SVG logo + emblem
├── src/
│   ├── assets/               # AI-generated illustrations (inlined at build time)
│   ├── components/           # All game screens and UI
│   ├── App.tsx               # Game state + navigation
│   ├── data.ts               # Rubric, teams, visitors, budget data
│   ├── sound.ts              # Web Audio sound effects
│   └── index.css             # Theme, animations, print styles
├── .github/workflows/        # GitHub Pages deploy workflow
├── .gitignore
├── README.md
├── index.html
├── package.json
└── vite.config.ts
```

---

## 🧰 Tech stack

React 19 · TypeScript · Vite 7 · Tailwind CSS 4 · Framer Motion · canvas-confetti · Web Audio API

No backend, no database, no API keys, no tracking — everything runs in the browser.

---

<p align="center">
  © Al-Bassam Schools · مدارس البسام · ICT Department<br />
  Created for the School Science &amp; Technology Fair. Educational use only.
</p>
