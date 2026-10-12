# Testing the Solid adapter

This is a dedicated test application, independent of `playground/`. Tests import
the built package's public exports. The browser suite uses the official Inertia
Express backend, real requests, and Solid fixtures; it needs no Laravel, PHP,
database, or service worker.

## Run

Use Node 22.12+ and pnpm 11. CI uses Node 22 and pnpm 11.20.0.

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium firefox webkit
pnpm test
```

`pnpm test` builds the package and runs every layer even when an earlier layer
fails. It returns a nonzero exit code if any layer fails. The default browser is
Chromium with the native Fetch client. Browser commands build the package and
fixture app, start the backend, and stop their servers automatically.

| Command | Contract |
| --- | --- |
| `pnpm test:types` | Public TypeScript consumers, positive and negative cases |
| `pnpm test:fixtures:types` | Strict TSX fixture compilation |
| `pnpm test:unit` | Solid browser primitives and real server rendering |
| `pnpm test:browser` | Shared upstream browser specs, Chromium/Fetch |
| `pnpm test:browser:axios` | Same browser contracts with the Axios client |
| `pnpm test:browser:all` | Chromium, Firefox, and WebKit |
| `pnpm test:ssr` | Manual SSR, Vite automatic SSR, and browser hydration |

Build first when running the type or unit commands individually: `pnpm build`.
Run one browser spec with, for example:

```sh
pnpm test:browser tests/upstream/remember.spec.ts
pnpm exec playwright test --project=firefox tests/upstream/links.spec.ts
pnpm exec playwright show-report
```

The backend listens on **13721**; the manual and automatic SSR renderers use
**13714** and **13722**. Keep these ports free and run browser/SSR commands
sequentially in one checkout: they share generated fixture assets. Server reuse
is disabled by default to avoid testing stale builds. `TEST_REUSE_SERVER=true`
is an explicit development opt-in; rebuild the assets yourself when using it.
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` optionally selects an existing Chromium
binary; normal runs use Playwright's pinned browser revision.

Failure traces, screenshots, and JSON results are in `test-results/`; the HTML
report is in `playwright-report/`. These outputs are ignored by Git. CI runs the
three contract layers independently, all three browser engines with Fetch,
Chromium with Axios, and Chromium SSR. It uploads browser failure artifacts and
does not turn known failures into passing jobs.

## Coverage phases

1. **Navigation and page state:** links, methods, request data/files/headers,
   redirects, cancellation, client-side visits, reactive `usePage`, resolver page
   arguments, remember, nested/component layouts, flash, and preservation.
2. **Forms and HTTP:** `useForm`, `<Form>`, context and refs, nested defaults,
   dirty/errors/reset, submission methods, uploads/progress, cancellation,
   `useHttp`, HTTP handlers, network failures, Precognition, optimistic updates
   and rollback.
3. **Loading and history:** deferred and nested props, cancellation, merge/deep
   merge/key matching, once props, polling and cleanup, prefetch/SWR, visibility,
   InfiniteScroll, encrypted history, quota/throttling, scroll regions,
   fragments, view transitions, XSRF, progress, errors, events, and BigInt.
4. **Rendering and declarations:** manual/automatic bootstrap, Vite page
   shorthand and custom Solid framework transform, SSR HTML and page JSON,
   hydration and SPA navigation, request isolation, escaping, metadata,
   `WhenMounted`, both server renderers, and consumer types.
5. **Integration:** reproducible commands, capability audit, CI matrix, upstream
   provenance, and a documented baseline. This is coverage infrastructure,
   not an adapter bug-fix pass.

The fixtures use Solid accessors, stores, reactive props and slot objects,
`For`/`Show`, callback refs, and owned lifecycle cleanup. React whole-component
re-render counts are not a Solid contract. The unit runner separates browser
module conditions from actual server conditions; it does not mock the router.

## Capability exclusions, not hidden failures

Shared specs keep their upstream assertions for supported APIs. Explicit skips
identify contracts the Solid adapter does not expose:

| Upstream contract | Solid disposition |
| --- | --- |
| Vue plugin globals, Options API, `v-model` | Framework-specific; Vue plugin spec excluded |
| Svelte compiler/top-level-await options | Framework-specific; Svelte spec excluded |
| React StrictMode and `React.memo` render counts | Framework-specific; skipped |
| Inertia `Head`, head-key, title callback, `serverHead` | Not exported / options type `never`; native `@solidjs/meta` tests cover reactive metadata, cleanup, and SSR escaping instead |
| App-level default layout | Not implemented in `createInertiaApp`; page component layouts remain tested |
| Layout tuples/names/`setLayoutProps` | No public Solid API; skipped |
| Deferred rescue/reloading slots | No public Solid API; skipped; readiness and nested deferred data stay enabled |
| WhenVisible fetching slot | No public Solid API; skipped; visibility/reload behavior stays enabled |

LayoutProps and nested rescued-deferred fixture sources are retained as upstream
reference material but excluded from client glob resolution and fixture
typechecking because they require nonexistent exports/props. Do not enable them
by writing substitute adapter behavior into the fixtures.

Existing upstream unconditional skips and browser-specific exclusions remain
unchanged. Chromium alone cannot exercise WebKit's history quota test or prove
Firefox/WebKit compatibility. See the pinned baseline below for what was actually
executed locally; a configured CI job is not evidence of a passing run.

## Upstream provenance and updates

Source: [inertiajs/inertia v3.9.1](https://github.com/inertiajs/inertia/tree/e36ead235b3d395e0857ade3793b000175622ae2),
commit [`e36ead2`](https://github.com/inertiajs/inertia/commit/e36ead235b3d395e0857ade3793b000175622ae2).
Playwright is pinned to the upstream version, **1.58.2**. The package lock records
the runtime and Vite versions used for this port.

- `tests/upstream/*.spec.ts` and `support.ts`: official shared browser suite,
  with capability gates and native metadata assertions documented above.
- `tests/app/*.js`: official backend, adapted only for Solid, local paths/ports,
  CommonJS exports, and the matching automatic-SSR client template.
- `tests/test-app/`: React fixture catalogue translated to Solid; `UsePage` uses
  the Vue reactive-page fixtures, and metadata uses native Solid equivalents.
- `tests/unit/` and `tests/types/`: additional public Solid runtime/type consumers.

Upstream's MIT copyright and permission notice are retained in
[`upstream/LICENSE.md`](upstream/LICENSE.md) and apply to all copied/adapted
backend, spec, and fixture code. These resources are not published in upstream
npm tarballs; this is a vendored, pinned port, not a runtime dependency patch.

For an update, check out the new upstream revision separately, compare shared
specs/support/backend against this pinned revision, and review changed React
fixtures alongside Solid API declarations. Preserve capability notes, selectors,
and assertions. Run type/unit checks, all browser engines/clients, and SSR. Record
the new revision and results here; do not mark supported failures as skips.

## Initial baseline

The adapter source and manual playground remain unchanged. Supported-contract
failures are deliberately red, not `fixme`, expected failures, or weakened
assertions. The initial combined run and its limitations are recorded here after
integration verification.
