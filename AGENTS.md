# Repository Guidelines

## Project Structure & Module Organization
The Vite-powered admin console lives in `src/`. `main.jsx` mounts `<App />` and configures Ant Design styling. Feature-specific screens and logic are grouped beneath `src/features/<domain>` (e.g. `products`, `orders`, `auth`) with colocated components and hooks; add new domains as sibling folders. Shared utilities belong in `src/lib` (see `http.js` for the Axios client) and reusable media in `src/assets`. Static HTML and icons reside in `public/`, while `mock/db.json` seeds the optional JSON Server during local development.

## Build, Test, and Development Commands
Install dependencies with `npm install`. Use `npm run dev` for the Vite dev server (defaults to http://localhost:5173). `npm run mock` starts the mock API on port 4000; keep it running when working on data-bound views. Run `npm run build` for a production bundle and `npm run preview` to smoke-test that bundle locally. Always execute `npm run lint` before opening a pull request to catch ESLint violations early.

## Coding Style & Naming Conventions
Components are written in modern React (19) with functional components and hooks. Follow a 2-space indent, trailing commas where valid, and single quotes for strings to match existing files. Name components and exported hooks in PascalCase (`ProductTable`) or camelCase (`useOrdersQuery`), and keep file names lowercase except for React components (`Products.jsx`). Reuse the configured Axios client in `src/lib/http.js` for API calls, and prefer Ant Design primitives for layout and form inputs.

## Testing Guidelines
Automated tests are not yet wired into the toolchain; prioritize adding Vitest + React Testing Library when you introduce new surface areas. Co-locate tests next to the implementation as `*.test.jsx` files (e.g. `src/features/orders/Orders.test.jsx`) and document any manual verification in the PR until a test script is in place. Include screenshots or recordings for UI changes touching critical flows (auth, checkout, inventory).

## Commit & Pull Request Guidelines
The current checkout lacks Git history; please adopt Conventional Commit prefixes (`feat:`, `fix:`, `chore:`) followed by an imperative summary (≤72 chars). Reference GitHub issues with `(#123)` when applicable. Pull requests should describe the business context, list functional changes, call out testing evidence, and attach UI captures when visual output changes. Mention any required environment variables (`VITE_INVITE_CODE`) or mock data updates so reviewers can reproduce your setup.
