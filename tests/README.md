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
pnpm exec playwright show-report playwright-report/browser-fetch
```

The backend listens on **13721**; the manual and automatic SSR renderers use
**13714** and **13722**. Keep these ports free and run browser/SSR commands
sequentially in one checkout: they share generated fixture assets. Server reuse
is disabled by default to avoid testing stale builds. `TEST_REUSE_SERVER=true`
is an explicit development opt-in; rebuild the assets yourself when using it.
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` optionally selects an existing Chromium
binary; normal runs use Playwright's pinned browser revision.

Failure traces, screenshots, and JSON results are in `test-results/`; HTML reports
are in `playwright-report/`. Both keep separate `browser-fetch`, `browser-axios`,
and `ssr` directories so later layers do not overwrite earlier evidence.
These outputs are ignored by Git. CI runs the
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
6. **Baseline validation:** pinned browsers and Node 22, full client/engine/SSR
   runs, repeated timing cases, official React controls, and correction of
   proven fixture/backend/assertion errors without changing adapter behavior.

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
| `withApp` receives the page object | Solid receives `{ ssr }` instead; separate context/CSR/SSR/hydration tests cover that contract |
| Inertia `Head`, head-key, title callback, `serverHead` | Not exported / options type `never`; native `@solidjs/meta` tests cover reactive metadata, cleanup, and SSR escaping instead |
| App-level default layout | Not implemented in `createInertiaApp`; page component layouts remain tested |
| Layout tuples/names/`setLayoutProps` | No public Solid API; skipped |
| Deferred rescue/reloading slots | No public Solid API; skipped; readiness and nested deferred data stay enabled |
| WhenVisible fetching slot | No public Solid API; skipped; visibility/reload behavior stays enabled |
| Form progress reset value | Solid declares `Progress \| undefined`; start/progress/reset assertions require its exact empty value rather than upstream's `null` |

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
  CommonJS exports, the matching automatic-SSR client template, and the Multer
  avatar lookup correction documented in Phase 6 below.
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

## Historical initial baseline (2026-10-12)

The adapter source and manual playground remain unchanged. Supported-contract
failures are deliberately red, not `fixme`, expected failures, or weakened
assertions. All five layers were executed together with `pnpm test`, followed by
final reruns after fixture review. The final results on **2026-10-12** are:

| Layer | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| Chromium / Fetch, all 1,108 cases in 56 spec files | 927 | 114 | 67 |
| Chromium / Axios, 63 HTTP-focused cases | 62 | 1 | 0 |
| Manual and automatic SSR / Chromium hydration, all 32 cases | 19 | 2 | 11 |
| Public browser and server runtime consumers | 11 | 1 | 0 |
| Public TypeScript consumers | — | 1 diagnostic | — |
| Strict fixture TypeScript compilation | — | 3 diagnostics | — |

The Axios selection covers `http-client`, `http-handlers`, `http-cancellation`,
`network-error`, `xsrf`, and `use-http`. It is a subset of the shared browser
suite, not 63 additional unique contracts. The final bootstrap/context recheck
also passed all four supported cases in `configure-inertia-app.spec.ts`, with
three framework/callback-contract exclusions.

Observed failures cluster around InfiniteScroll (77 browser cases and both SSR
failures), persistent layouts, flash reactivity, Link event forwarding, deferred
and nested loading, polling timing, uppercase Form methods, Precognition, and
the exposed `useHttp` response. The runtime failure occurs when constructing a
factory-default form. Declaration diagnostics concern shared-page augmentation
and the InfiniteScroll JSX return type. These are observations from this
baseline, **not a completed diagnosis**: timing, environment, and fixture causes
must still be ruled out before treating every red case as an adapter bug.

Verification used Linux, Node **26.5.1**, pnpm **11.20.0**, and an existing
Chrome-for-Testing **151.0.7922.34** binary through
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. The pinned Playwright browser download
stalled, so its Chromium revision, Firefox, WebKit, and the complete Axios suite
were **not executed locally**. CI configures those runs with Node 22, but the
workflow has not been pushed or executed; its matrix is not a compatibility
claim. WebKit-only exclusions such as the history quota case still need that
browser's run.

Frozen-lockfile installation, package/client/SSR builds, backend/runner syntax
checks, and `git diff --check` passed. `pnpm test` and the corresponding CI jobs
remain nonzero on the supported failures above. Fixing those contracts is a
separate task; do not replace this baseline with expected failures to make CI
green.

## Phase 6: validated baseline (2026-10-13)

This supersedes the initial baseline's unverified-browser limitations, not its
historical results. Validation uses Linux/Debian 13, Node **22.23.3**, pnpm
**11.20.0**, four workers, no retries, and Playwright **1.58.2** with its pinned
browsers: Chromium **145.0.7632.6** (revision 1208), Firefox **146.0.1** (1509),
and WebKit **26.0** (2248). No Chromium executable-path override is used. The
Node 26 installation remains the host default; Node 22 is selected for these
commands only. Browser, Axios, and SSR commands run sequentially.

On this runner, the downloaded browsers are in the ignored
`.amp/in/browsers-phase6/` cache. To reuse that cache and the installed Node 22
without changing the default Node version:

```sh
export PLAYWRIGHT_BROWSERS_PATH="$PWD/.amp/in/browsers-phase6"
fnm exec --using=22.23.3 pnpm test:browser:all
fnm exec --using=22.23.3 pnpm test:browser:axios
fnm exec --using=22.23.3 pnpm test:ssr
```

| Layer | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| Chromium / Fetch, all 1,108 cases | 933 | 108 | 67 |
| Firefox / Fetch, all 1,108 cases | 918 | 107 | 83 |
| WebKit / Fetch, all 1,108 cases | 933 | 111 | 64 |
| Chromium / Axios, all 1,108 cases | 933 | 108 | 67 |
| Manual/automatic SSR and Chromium hydration, all 32 cases | 19 | 2 | 11 |
| Public browser/server runtime consumers | 11 | 1 | 0 |
| Public TypeScript consumers | — | 1 diagnostic | — |
| Strict fixture TypeScript compilation | — | 3 diagnostics | — |

The final Fetch matrix is one complete run: **2,784 passed, 326 failed, 214
skipped, zero blocked serial followers** out of 3,324 engine/case combinations.
Before harness corrections, the same pinned environment produced 2,771 passed,
334 failed, 214 ordinary skips, and five blocked optimistic serial followers.
Nine original failures are corrected; one additional intermittent WebKit scroll
failure remains in the final count. Passing focused reruns do not replace that
result. All optimistic cases executed in the final matrix, and all four WebKit
quota cases passed. Axios ran the complete shared suite, not the historical
63-case selection, with the same failed contracts as Chromium/Fetch.

Package, client, and both SSR builds passed. Backend syntax, changed-spec
formatting, and `git diff --check` passed. Browser/runtime/type checks still
return nonzero because the supported failures below remain observable.

### Harness corrections keep the intended contract

- **Shorthand layouts:** pages now share `SiteLayout` or
  `[SiteLayout, NestedLayout]`, matching upstream component shorthand. Separate
  per-page wrapper functions have different identities in Solid and are not
  shorthand. Both shorthand scenarios pass on all engines. The separate
  render-function scenarios remain enabled and red.
- **Precognition uploads:** Multer's `upload.any()` supplies an array, not
  `req.files.avatar`. The backend now checks the `avatar` field name. A raw
  uploaded avatar returns 204; a missing file or a file named `portrait` returns
  422. Browser assertions await the exact `name,avatar` validation request and
  require the positive `Avatar is valid!` state. Previously, name-only blur
  validation could make the upload tests falsely pass. Strengthened official
  React cases failed before the backend correction and passed after it; their
  missing-file controls remain green.
- **Polling rest mode:** stop after three completed requests, drain in-flight
  work, then check a minimum 200ms gap from completion to the next start. Live
  started/finished counts are not equal while a correct poll is in flight.
  Negative controls reject overlap mode on every engine.
- **Pending deferred history:** hold initial deferred requests until navigating
  away, then release them and assert actual refetches after going back. This
  guarantees the pending state rather than racing a fast response.
- **Tag invalidation:** count requests for the intended user/product/untagged
  URL, retaining positive user-refetch and zero cached-target assertions. Move
  the pointer away before going back; incidental hover prefetches for unrelated
  links are not product-cache misses.
- **Optimistic overlap:** hold real backend responses until both optimistic
  updates are visible, then release them in the tested order. A 100ms response
  could previously complete before the second browser click. Both hardened
  scenarios passed 10 repeats per engine (60/60); the original intermediate
  and final values remain asserted.
- **WebKit quota:** allow 30s for the payload-heavy history suite instead of
  its explicit 10s budget. Reload, subsequent navigation, back/forward, and
  deferred-payload assertions remain unchanged.

The hardened polling, pending-history, and upload scenarios also passed 90/90
repeated cases across the three engines. These repetitions are stability checks,
not additional unique API coverage.

### Failure classification, not production fixes

The same InfiniteScroll initialization exception occurs on every engine:
`setRequestCount` is accessed before initialization. It prevents the fixture
from mounting, so 77 Chromium/WebKit cases, 76 Firefox cases, a flash case, and
two SSR cases cannot exercise their later assertions. Those are blocked contract
checks, not that many independently diagnosed defects, and remain failures.

Other source-backed failures concern Link forwarding of `onHttpException`,
`onNetworkError`, and `onFlash`; `dataloading` instead of `data-loading`;
the missing reactive bridge for `router.flash`; getters copied by
`Object.assign` freezing `validating` and `useHttp.response`; Form reset not
clearing validator touched fields; the all-errors override shadowing global
configuration; legacy Precognition constructors not initializing a validator;
uppercase Form methods; and dotted nested Deferred keys being treated as
literal top-level keys. Successful deferred HTTP responses do not make their
gated nested content render.

The mount-time partial-reload case never requests `bar`: Solid failed 10/10
repeats while the official React control passed 10/10. This is a lifecycle or
initial-dispatch discrepancy, not merely a missed loading indicator; its deeper
cause is not settled here. The factory-default runtime test fails during form
construction with `dataOption(...) is not a function`. Declaration diagnostics
concern shared-page augmentation and InfiniteScroll's JSX return type.

Two render-function layout cases need a Solid API/identity decision: upstream
React retains the inner layout across distinct per-page render functions, while
Solid treats these functions as different layout components. Do not silently
replace them with shorthand, weaken the identity assertion, or skip them.

Two WebKit scroll cases reproduce with the same values in the pinned official
React fixture: Link's preserve-scroll callback changes document X from 5 to 0,
and manual visit's untracked slot changes from 10/15 to 76/0. Solid also failed
each case in three focused repeats. These remain enabled; the controls establish
that the failures are not uniquely Solid, not whether browser behavior, upstream
core, or the test interaction is responsible.

The final matrix also failed WebKit's encrypted-history document-scroll
restoration check at its explicit 1,000ms wait. It passed in the earlier matrix
and all 10 focused Solid repeats; official React passed 9/10 and failed at the
same assertion once. This is an intermittent upstream-reproducing failure of
unsettled cause, not a confirmed Solid defect or a removed failure. Its assertion
and timeout remain unchanged.

Official controls use a separate checkout pinned to the provenance commit above,
the same Node/browser versions, and port 13716. Express's `sendFile` required
`dotfiles: 'allow'` solely because that scratch checkout is under hidden `.amp/`.
The upload controls also use the documented Multer/assertion corrections. No
upstream runtime patches are used to obtain the control results.

Adapter source and the manual playground remain unchanged. Supported failures
are not skips, `fixme`, or expected failures. CI is configured but has not been
pushed or run remotely; local validation is not evidence of a green CI job.
