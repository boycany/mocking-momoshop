# AGENTS.md

Shared guidelines for every AI agent working on this repo (Claude Code, Codex, Gemini, Cursor, Copilot, ...).
This file is the single source of truth. `CLAUDE.md` only imports it via `@AGENTS.md`; do not duplicate rules elsewhere.

Read `docs/plan.md` and `docs/decisions/` for design context before starting work.

## Project overview

Mocking momoshop: an Angular recreation of the core pages of the momoshop desktop site.
Frontend only. **Never call any real momo API or external data source.** All data comes from `src/mocks/`.

## Commands

| Purpose             | Command                     |
| ------------------- | --------------------------- |
| Dev server          | `npm start`                 |
| Lint                | `npm run lint`              |
| Unit tests (Vitest) | `npm test -- --watch=false` |
| Production build    | `npm run build`             |

## Definition of done

A task is done only when **all** of the following pass:

1. `npm run lint` reports no errors.
2. `npm test -- --watch=false` passes.
3. The app builds.

If any check fails, fix it before reporting the task as done. Never disable a lint rule or skip a test to make a check pass without asking the human first.

A pre-commit hook (husky + lint-staged) runs Prettier and ESLint on staged files. Do not bypass it with `--no-verify`.

## Language

- Everything under `docs/` is written in Traditional Chinese (繁體中文).
- Everything else is written in English: `README.md`, `AGENTS.md`, code comments, commit messages, identifiers and test names.
- Exception: user-facing UI copy and mock data mirror the real momoshop site, so they are in Traditional Chinese.

## Tech stack

Angular 22 (standalone, zoneless), Angular Material / CDK 22, @ngrx/signals 22, Vitest, SCSS, ESLint (angular-eslint), Prettier.

## Folder structure and dependency direction

```
src/app/
├─ core/          # layout (header, nav, sidebar, footer), observability
├─ data-access/   # models, CatalogApi abstraction + mock implementation, stores
├─ features/      # home, goods, search (each a lazy route)
└─ shared/ui/     # stateless, reusable presentational components (product-card, price, carousel, ...)
src/mocks/        # fixtures and generator
```

Dependencies only point downward: `features → shared/ui, data-access` and `core → shared/ui, data-access`.

- Features must **not** import each other. Move shared code into `shared/` or `data-access/`.
- `shared/ui` must not inject stores or `CatalogApi`. It communicates only through `input()` / `output()`.
- Pages get data only through the `CatalogApi` abstraction. Never import fixtures directly.

These boundaries are **enforced by ESLint** (`no-restricted-imports` in `eslint.config.js`). When adding a new feature folder, add it to the `FEATURES` list there.

## Angular conventions

- Standalone components only. No NgModules.
- Use `inject()`, not constructor injection.
- Use signal APIs: `input()`, `output()`, `model()`, `computed()`, `linkedSignal()`. Decorator `@Input()` / `@Output()` are lint errors.
- Use built-in control flow (`@if`, `@for`, `@switch`, `@defer`). `@for` must have `track`. Structural directives (`*ngIf`, `*ngFor`) are lint errors.
- OnPush is the default change detection in Angular 22. Do not set `changeDetection` explicitly, and never use `ChangeDetectionStrategy.Eager`.
- Bind route params with `withComponentInputBinding()`. Do not subscribe to `ActivatedRoute` manually.
- Do not access `window`, `document` or `localStorage` directly. Use `afterNextRender` or wrap them in a service, so the app stays SSR-ready.
- File naming follows the current Angular style guide: `product-card.ts`, `product-card.html`, `product-card.scss`.

## State management

- Cross-page shared state uses `signalStore` from `@ngrx/signals` (e.g. `CartStore`, `RecentlyViewedStore`).
- Search criteria (keyword, sort, page, filters) live **only in URL query params**, never in a store. See ADR 0002.
- Local UI state uses a component-level `signal()`. Do not create a store for it.

## Styling

- Brand primary color: `--momo-primary: #e4007f`, defined in `src/styles.scss`.
- Angular Material provides behavior only (sidenav, menu, snackbar, badge, autocomplete, paginator). Brand-heavy areas (header, hero banner, category nav, product card) use custom SCSS. See ADR 0001.
- Desktop first: content width is fixed at 1200px and centered. No responsive layout.
- Images are local SVG placeholders. Never reference external image URLs. See ADR 0005.

## Testing

- Must test: store logic (methods and computed state) and pure logic such as price and discount calculation.
- Component tests cover key interactions only (add to cart, spec selection). Coverage is not a goal.

## Commits

- One task per commit, using Conventional Commits: `feat(goods): ...`, `fix(search): ...`, `docs: ...`.
- Commits with agent-produced work end with a `Co-Authored-By` trailer.
- Never commit `node_modules/`, `dist/` or stray `*.lock` files (`package-lock.json` is the exception).

## How agents should work

- Before coding, state which files you plan to change.
- Stop and ask the human before adding a dependency, crossing a dependency boundary, or changing lint rules.
- If you are unsure how the real momoshop lays something out, ask. Do not invent large amounts of UI.
- Log notable rounds (human instruction → agent output → human correction and why) in `docs/agent-log.md`.
