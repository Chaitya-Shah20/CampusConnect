# CampusConnect — React port

A full React (Vite + React Router) rewrite of the original multi-page
CampusConnect site (index/login/register/dashboard/... `.html` files +
`style.css`).

## What changed vs. the original static site

- **Routing**: every `.html` page is now a route via `react-router-dom`
  (see `src/App.jsx`), rendered inside a single-page app instead of full
  page reloads.
- **One design system**: all pages (including the older plain-card pages
  like Mentorship/Opportunities/Teammates/Project) now share the same
  `site-nav` / `page-wrap` / `panel` / `card` system the dashboard used,
  for a consistent look. All of the original CSS is preserved verbatim in
  `src/index.css`, with a small additive section at the bottom.
- **Auth**: `src/context/AuthContext.jsx` replaces the old
  `localStorage.getItem("campusUser")` checks and the missing `app.js`
  helpers (`setUser`, `loadUser`, `showMessage`) with a proper React
  context, backed by `GET /api/users/me` on load and mirrored into
  `localStorage` for instant reads.
- **API calls**: `src/api.js` is a small `fetch` wrapper standing in for
  the original (unshipped) `app.js#api()` helper. It hits `/api/...`,
  sends cookies, and throws `Error(message)` on failure so every page's
  `catch (error) { ... error.message }` pattern still works unchanged.
  A Vite dev proxy (`vite.config.js`) forwards `/api` to
  `http://localhost:5000` — point that at your real backend (the
  `/backend` folder from the original upload wasn't included in what was
  shared with me, so I couldn't wire it up beyond this).
- **Landing page interactivity**: the vanilla-JS image slider and the
  Leaflet campus map (with live geolocation) are now real React
  components — `src/components/CampusSlider.jsx` and
  `src/components/CampusMap.jsx` — using hooks (`useState`/`useEffect`/
  refs) instead of manual DOM queries. Behavior (autoplay, swipe, dots,
  hover-to-pause, map chips, "my location" pulsing marker) is preserved.
- **`alert()` guards**: pages that gated an action behind login
  (`Mentorship`, `Project`, `Teammates`) keep the same "please login
  first" `alert()` + redirect behavior via a small `useRequireAuth()`
  hook (`src/components/ProtectedAction.jsx`), just written as React
  instead of inline `<script>` tags.

## Project structure

```
src/
  api.js                 fetch() wrapper (was app.js's api())
  index.css              full design system (your original style.css + additions)
  context/AuthContext.jsx
  components/
    Navbar.jsx            was #app-nav + nav.js
    Footer.jsx
    AppLayout.jsx          shared shell for interior pages
    ProtectedAction.jsx    useRequireAuth() login-gate hook
    CampusSlider.jsx        "Life at Campus" slider
    CampusMap.jsx            Leaflet "Explore Your Campus" map
  pages/
    Home.jsx           (index.html)
    Login.jsx           (login.html)
    Register.jsx        (register.html)
    Dashboard.jsx        (dashboard.html)
    AIAssistant.jsx       (ai-assistant.html)
    Achievements.jsx      (achievements.html)
    Hackathons.jsx        (hackathons.html)
    Mentorship.jsx        (mentorship.html)
    Opportunities.jsx     (opportunities.html)
    QA.jsx                 (qa.html)
    Profile.jsx             (profile.html)
    ProjectShowcase.jsx      (project.html)
    Resources.jsx             (resources.html)
    Teammates.jsx              (teammates.html)
```

## Running it

```bash
npm install
npm run dev
```

Then point `vite.config.js`'s proxy target at wherever your backend
(the Express/Node API implied by all the `api('/auth/login')`,
`api('/hackathons')`, etc. calls) actually runs. If you don't have that
backend handy, every page still renders — it just shows its built-in
"log in to view / no data yet" fallback state, exactly like the original
pages did when `api()` failed.

## Note on what I could and couldn't verify

I don't have network access in this environment, so I wasn't able to run
`npm install` / `npm run build` here to confirm it compiles end to end —
please run `npm install && npm run build` on your machine as a first
check. I did structurally verify every file (matching braces/parens,
consistent imports/exports, one export per page matching its route in
`App.jsx`).
