# Summary — TV App (SolidTV)

> Summary of what was delivered and verified. Versions: [SUMARIO.md](SUMARIO.md) (pt-BR) · [SUMARIO.en.md](SUMARIO.en.md) (en) · [SUMARIO.es.md](SUMARIO.es.md) (es).

App built from scratch in `tv/` using the **SolidTV** framework (Canvas/WebGL rendering, remote-control navigation), consuming the API already deployed at `curso.ideias.casa`.

## What was delivered

- **SolidTV scaffolding**: `package.json`, `vite.config.js`, `tsconfig.json`, `index.html`, `styles.css`, `.env`, `.nvmrc`, `pnpm-workspace.yaml`, and Roboto (TTF) fonts in `public/fonts`.
- **Shell + left menu with exactly 3 items**: `Cursos`, `Categorias`, `Canais` (`src/components/Sidebar.tsx`, `src/pages/Shell.tsx`).
- **Login** by `XXX-YYY` code with an on-screen keyboard (`src/pages/Login.tsx`), token persisted in `localStorage`.
- **Courses** (`src/pages/Cursos.tsx`): "Continue watching" + "Recently added" + category shortcuts.
- **Categories** (`src/pages/Categorias.tsx`): category list + paginated course grid (10/page).
- **Channels** (`src/pages/Canais.tsx`): grid of the user's channels.
- **CourseDetail** + **Player** with shaka-player (`src/pages/Player.tsx`): resumes from progress, posts `POST /progresso` every 10s, marks `concluido` on finish, and offers the next episode.
- **READMEs** in pt/en/es and the `AGENTS.md` summary updated.

## Browser verifications (dev server at `http://localhost:5174/`)

- Login screen renders with correct Portuguese accents (MSDF atlas replaced by `CanvasTextRenderer` + TTF, since the demo's MSDF only covers ASCII).
- On-screen keyboard: typing, arrow navigation, and submit working.
- Real fetch against `curso.ideias.casa` (CORS OK) and 401 handling.
- Authenticated shell, 3-item menu, active item highlighted, sidebar navigation across Courses/Categories/Channels.
- Per-page `ErrorBoundary` and guarded reads of failed resources — a load failure no longer freezes the screen or hides the menu.

## Note

To see screens with real content you need a valid token: generate **one** token at `https://curso.ideias.casa/tv` and, without reloading the page afterwards, type it on the app's login screen. The token is one-per-user; each new token invalidates the previous one. The backend and contract were confirmed via `curl` (e.g. course "Aprenda React", category "Desenvolvimento").
