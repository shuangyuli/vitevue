# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development

```bash
npm run dev       # Start Vite dev server (HMR)
npm run build     # Type-check with vue-tsc then build for production
npm run preview   # Preview production build locally
```

No test runner is configured.

## Architecture

Vue 3 admin dashboard SPA with TypeScript, built on Vite. Uses `<script setup>` Composition API throughout.

**Entry point:** `src/main.ts` — creates the Vue app, installs Pinia, Element Plus, and Vue Router, then mounts to `#app`.

**Router** (`src/router/index.ts`):
- `/` → redirects to `/login`
- `/login` — public (redirects to `/home` if already authenticated)
- `/home` — protected layout shell with nested children: `dashboard`, `orders`, `customers`, `profile`, `mytab`
- Auth guard (`beforeEach`) checks `useAuthStore().isAuthenticated` and redirects accordingly

**State management** (Pinia): `src/stores/auth.ts` is the only store. Mock auth — hardcoded credentials `admin` / `admin123`. Token persisted to `localStorage` (when "remember me" checked) or `sessionStorage`. `restoreSession()` checks both storages on route navigation.

**UI library:** Element Plus (global install in `main.ts`). Components use `el-card`, `el-table`, `el-form`, `el-menu`, `el-container` layout system, etc.

**Charts:** ECharts 6, used in `Dashboard.vue` for the line/bar/map visualizations. Map requires a `china.json` GeoJSON file served from `/public`.

**Styling:** Scoped styles in `.vue` SFCs. Less is available as a preprocessor. `src/style.css` contains unused Vite template boilerplate.

**Key components:**
- `Login.vue` — form with Element Plus validation, calls `authStore.login()`
- `Home.vue` — layout shell: sidebar (`el-menu`), top bar with username + logout, `<router-view>` for child content
- `Dashboard.vue` — data visualization screen with ECharts charts and live-updating metrics/stream
- `Mytab.vue` — dynamic tab switching using `shallowRef` + `<component :is>`, a pattern for tab-based UIs

**TypeScript:** Project references pattern — `tsconfig.app.json` (app source) and `tsconfig.node.json` (vite config). Strict lint options enabled: `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `noFallthroughCasesInSwitch`. `src/shims-vue.d.ts` provides the `.vue` module declaration.
