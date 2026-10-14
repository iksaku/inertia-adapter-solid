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
Chromium with the built-in native XHR client. Browser commands build the package and
fixture app, start the backend, and stop their servers automatically.

Earlier phase notes and the retained `browser-fetch` output directory call the
default profile "Fetch". Inertia 3.9.1 actually uses `XhrHttpClient`; those results
cover its built-in client, not the browser Fetch API. Existing output names remain
unchanged for compatibility.

| Command | Contract |
| --- | --- |
| `pnpm test:types` | Public TypeScript consumers, positive and negative cases |
| `pnpm test:fixtures:types` | Strict TSX fixture compilation |
| `pnpm test:unit:types` | Strict compilation of browser/server runtime consumers |
| `pnpm test:unit` | Solid browser primitives and real server rendering |
| `pnpm test:browser` | Shared upstream browser specs, Chromium/native XHR |
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
four contract layers independently, all three browser engines with the built-in client,
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
7. **InfiniteScroll startup and JSX:** remove the initialization blocker,
   preserve Solid's reactive memo return while exposing a JSX-compatible type,
   and rerun the complete matrix to expose later assertions.
8. **InfiniteScroll slots and SSR:** directional slots take priority over the
   loading fallback; server pagination flags initialize from page metadata;
   exercise held requests, reactive flags, and first/middle/last SSR boundaries.
9. **InfiniteScroll pagination and scroll:** preserve existing row elements
   during data updates without freezing reactive JSX children; exercise page
   tags, visible-page URLs, remembered lists, prepend anchors, and containers.
10. **Link callbacks and loading:** forward exception/flash callbacks as visit
    options, preserve exception suppression, and expose the native loading
    attribute through completion, cancellation, and overlapping async visits.
11. **Programmatic flash reactivity:** synchronize `router.flash()` through core's
    initialization callback, preserving merge, replacement, and clearing behavior
    in Solid's reactive page store.
12. **Factory-default forms:** cover `useForm` and `useHttp` construction, fresh
    full/selected resets, untouched defaults and errors, falsy data, rejection of
    manual defaults, and real server rendering without making factories live
    bindings to form edits.
13. **Shared-page declarations:** preserve configured shared props alongside
    explicit page generics, check positive/negative consumers, and keep strict
    browser/server unit-file compilation in the local runner and CI.
14. **Stored HTTP responses:** expose the latest successful `useHttp` response
    reactively, replace previous bodies before success callbacks, preserve it
    during pending/failed/cancelled requests, and clear it on an empty success.

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

## Phase 7: InfiniteScroll startup and JSX (2026-10-13)

This is the first adapter fix, limited to the InfiniteScroll startup exception
and public JSX return type. Its signals already initialize from the data
manager; an earlier synchronization call accessed their setters before they
existed. Removing that redundant call retains synchronization after requests
and resets. The returned memo stays an accessor, typed as `JSX.Element`, using
Solid's control-flow component pattern. It is not evaluated once or placed in
a new wrapper. All 31 obsolete return-type suppressions in the InfiniteScroll
fixtures are removed; browser assertions, skips, and timeouts are unchanged.

Validation uses the same pinned Node, pnpm, browsers, worker count, and no-retry
settings as Phase 6. Complete browser/SSR runs execute sequentially:

| Layer | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| Chromium / Fetch, all 1,108 cases | 985 | 56 | 67 |
| Firefox / Fetch, all 1,108 cases | 970 | 55 | 83 |
| WebKit / Fetch, all 1,108 cases | 986 | 58 | 64 |
| Chromium / Axios, all 1,108 cases | 985 | 56 | 67 |
| Manual/automatic SSR and Chromium hydration, all 32 cases | 19 | 2 | 11 |
| Public browser/server runtime consumers | 11 | 1 | 0 |
| Public TypeScript consumers | — | 1 diagnostic | — |
| Strict fixture TypeScript compilation | — | 1 diagnostic | — |

The complete Fetch matrix is **2,941 passed, 169 failed, 214 skipped**, with no
blocked serial followers or runner errors. Compared case by case with Phase 6,
**156 previously blocked engine/case combinations now pass**: 51 InfiniteScroll
cases per engine and the flash-with-InfiniteScroll case on each engine. The
known intermittent WebKit encrypted-history scroll case also passes this time;
that extra passing case is not attributed to the adapter fix. No previously
passing case fails in either the Fetch matrix or the complete Axios run.

The remaining InfiniteScroll results are **51 passed / 26 failed** in Chromium
and WebKit, and **51 passed / 25 failed / 1 skipped** in Firefox. Newly reachable
assertions show missing previous/next slot content, pagination attributes being
reassigned to earlier rows, additional previous-page requests, URL tracking,
and scroll-preservation discrepancies. These are observations, not a diagnosis
of 77 independent defects. Both SSR cases still fail because expected slot
labels are absent, rather than at the initialization exception. No assertions
are weakened and none of these failures is converted to a skip.

One remaining browser failure is a confirmed harness selector mismatch:
`div[style*="overflow-x: scroll"]` does not match Solid's static serialized
`overflow-x:scroll`. A DOM probe finds one genuinely scrollable container but
zero selector matches. That selector correction is left for the next patch;
the current count must not be described entirely as adapter defects.

The unchanged runtime failure is factory-default form construction. The
remaining consumer and fixture diagnostics concern shared-page augmentation;
both InfiniteScroll JSX diagnostics are gone, with no unused suppressions.
Package, client, and both SSR builds, changed-file formatting, and
`git diff --check` pass. The browser, runtime, and type layers still exit nonzero.

Chromium rendering probes exercise initial content, hold a real next-page
request while loading content is visible, and release it to observe 15 → 30
rows. Default loading appears below the cards; reverse loading appears above
them. Captured default/loading/reverse states are visually inspected, and these
probes report no JavaScript page errors. This verifies those rendering and
loading transitions, not the still-failing pagination and scroll contracts.

The historical Phase 6 results remain above. The manual playground is unchanged.
Validation is local; nothing has been pushed and CI has not run remotely.

## Phase 8: InfiniteScroll slots and SSR (2026-10-13)

Directional slots now remain selected during loading, ahead of the generic
loading fallback. The previous expressions grouped the conditional after the
directional slot, selecting the fallback even when a directional slot existed.
Slot objects keep their reactive getters and the component keeps its memo
accessor return; neither becomes a one-time snapshot.

Core initializes pagination state only in the browser. Server flags now seed
from `usePage().scrollProps[data]`, following the pinned Vue adapter's server
contract. Browser initialization still uses the data manager, including restored
pagination state and request counts. No core runtime patch is needed.

The existing manual-loading test holds real previous and next requests, verifies
directional loading labels while a generic fallback is also supplied, then
checks data and flags after each response. A deliberately loading-first selector
fails this regression. It passes five repeats per engine, **15/15** in total.
The horizontal fixture/spec uses a stable test ID rather than CSS serialization
whitespace; its original loading and pagination assertions remain enabled.

SSR tests now cover first, middle, and last pages, both as raw server HTML and
after hydration. Raw HTML assertions parse inert documents and compare each
label's text independently: an intentionally wrong previous flag on page 2
passes the old greedy regex by matching the later next flag, but fails the new
assertion. Both public server renderers also check distinct prop names, opposite
pagination boundaries, numeric/cursor identifiers, and absent metadata. These
runtime assertions failed before server initialization was corrected.

The complete local matrix uses the same pinned environment, four workers, and
no retries as Phase 7. Builds and browser/SSR runs execute sequentially:

| Layer | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| Chromium / Fetch, all 1,108 cases | 995 | 46 | 67 |
| Firefox / Fetch, all 1,108 cases | 979 | 46 | 83 |
| WebKit / Fetch, all 1,108 cases | 994 | 50 | 64 |
| Chromium / Axios, all 1,108 cases | 995 | 46 | 67 |
| Manual/automatic SSR and hydration, all 36 cases per engine | 75 | 0 | 33 |
| Public browser/server runtime consumers | 11 | 1 | 0 |
| Public TypeScript consumers | — | 1 diagnostic | — |
| Strict fixture TypeScript compilation | — | 1 diagnostic | — |

Fetch totals are **2,968 passed / 142 failed / 214 skipped**, with no blocked
serial followers or runner errors. Case-by-case comparison identifies **30
previously failing InfiniteScroll engine/case combinations now passing**:
manual loading, `manualAfter`, direct navigation, filtering, validation errors,
deferred data, and optional visible data. Axios gains the same ten cases with
no previously passing case failing. Each engine's InfiniteScroll result is now
61 passing; Chromium/WebKit retain 16 failures and Firefox 15 failures/1 skip.
The 18 InfiniteScroll SSR/boundary/hydration combinations all pass. SSR's 33
skips are the same eleven capability exclusions per engine, not hidden failures.

Three previously passing Fetch combinations fail in this run: back navigation
while a page chunk is loading in Firefox/WebKit, and encrypted document-scroll
restoration in WebKit. Ten focused repeats per engine compare this patch with
an archived, unchanged Phase 7 adapter and fixtures:

| Case | Phase 7 failures / 10, Chromium / Firefox / WebKit | Phase 8 failures / 10, Chromium / Firefox / WebKit |
| --- | --- | --- |
| Back while the next page chunk loads | 1 / 0 / 3 | 3 / 2 / 3 |
| Encrypted document-scroll restoration | 0 / 0 / 1 | 0 / 1 / 0 |

Both cases show pre-existing timing sensitivity, not identical failure rates or
a settled cause. The Phase 7 control uses the same dependencies and browsers,
port 13723, direct build commands to bypass pnpm's copied-workspace installation
check, and `sendFile`'s `dotfiles: 'allow'` for its hidden scratch path. Its adapter
and assertions are unchanged. No timeouts are increased or assertions weakened.

Remaining InfiniteScroll failures concern row pagination tags, URL tracking,
extra previous-page requests, and scroll preservation. The horizontal test now
loads all three pages before failing at a row's incorrect pagination tag. These
are left for the next phase, not diagnosed or fixed by this patch. Remember-state
cases were executed but still include these failures; this is not a claim that
all remembered InfiniteScroll behavior works.

The runtime failure remains factory-default form construction; the two type
diagnostics remain shared-page augmentation. Package, client, both SSR builds,
changed-file formatting, backend syntax, and `git diff --check` pass. Browser,
runtime, and type layers still exit nonzero; SSR exits zero.

Inspected Chromium captures show default controls and held previous/next loading
states. These are native boundary crops with a gray separator, not adjacent
full-page content. Executed probes verify 15 → 30 → 40 rows and zero page errors.
First/middle/last hydrated SSR captures show the correct flags and 15/15/10 rows,
with zero console/page errors. The manual playground remains unchanged.
Validation is local; nothing has been pushed and CI has not run remotely.

## Phase 9: InfiniteScroll pagination and scroll (2026-10-13)

Core tags untagged direct children with the newly loaded page and retains an
existing element as the prepend scroll anchor. Repeatedly evaluating the JSX
children getter recreated Solid's `For` instance, disconnecting every earlier
row. The replacement rows then received the newest page's tag, and the old
anchor no longer measured the visible content. A minimal public `router.replace`
append reproduces the identity loss without any network request: the original
row disconnects in 3/3 baseline probes and survives in 3/3 corrected probes.

The children getter now uses the existing lazy memo primitive. This preserves
the constructed list while its reconciled data updates, but still reevaluates
genuinely changing JSX expressions. Slot callbacks retain their reactive loading
getters. No core patch, additional waits, or upstream assertion changes are
needed. Three original Chromium pagination/scroll cases fail before the change
and pass afterward.

One Solid-specific regression toggles the JSX child expression twice in manual
mode, checks 15 → 0 → 15 rows and the first/last names, and requires zero fetches
and unchanged underlying data. A deliberate one-time children snapshot still
passes the page-tag case but fails this new reactive-expression case. The mutant
is restored before final builds and validation.

The complete matrix uses the same pinned environment, four workers, and no
retries as Phase 8. Package/client builds and each browser/SSR profile execute
sequentially, rebuilding assets before switching clients:

| Layer | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| Chromium / Fetch, all 1,109 cases | 1,012 | 30 | 67 |
| Firefox / Fetch, all 1,109 cases | 995 | 31 | 83 |
| WebKit / Fetch, all 1,109 cases | 1,012 | 33 | 64 |
| Chromium / Axios, all 1,109 cases | 1,011 | 31 | 67 |
| Manual/automatic SSR and hydration, all 36 cases per engine | 75 | 0 | 33 |
| Public browser/server runtime consumers | 11 | 1 | 0 |
| Public TypeScript consumers | — | 1 diagnostic | — |
| Strict fixture TypeScript compilation | — | 1 diagnostic | — |

Fetch totals are **3,019 passed / 94 failed / 214 skipped**, with no blocked
serial followers or runner errors. Case-by-case comparison identifies **all 47
previously failing InfiniteScroll engine/case combinations now passing**, plus
the new regression on each engine. InfiniteScroll itself is **233 passed / 0
failed / 1 existing Firefox skip**: 78 Chromium, 77 Firefox, and 78 WebKit passes.
All 78 Chromium InfiniteScroll cases also pass with Axios. Page tags, visible-page
URLs, remembered lists, prepend preservation, horizontal scrolling, and container
scrolling are now exercised without failures. Four focused tag/URL/prepend/JSX
cases pass five repetitions per engine, **60/60**, without retries. SSR remains
75/0/33, including all 18 InfiniteScroll boundary/hydration combinations.

The three previously intermittent history failures from Phase 8 pass in this
Fetch run; those extra passes are not attributed to this fix. Two previously
passing Fetch cases fail: Firefox's link-prefetch quick-hover assertion and
WebKit's post-render scroll test timeout. Axios also times out in Chromium's
post-render scroll case. Focused comparisons use the archived, unchanged Phase 8
adapter and assertions, with ten repetitions and the same browsers/dependencies:

| Case / profile | Phase 8 failures / 10 | Phase 9 failures / 10 |
| --- | ---: | ---: |
| Post-render scroll / Firefox Fetch | 0 | 0 |
| Post-render scroll / WebKit Fetch | 5 | 2 |
| Link-prop prefetch / Firefox Fetch | 6 | 8 |
| Link-prop prefetch / WebKit Fetch | 6 | 4 |
| Post-render scroll / Chromium Axios | 0 | 0 |
| Link-prop prefetch / Chromium Axios | 0 | 0 |

The two Fetch failures reproduce before this patch. The WebKit trace times out
before completing ten navigations; Firefox fails the assertion that a quick hover
makes no request. Their causes and differing failure rates remain unsettled.
The Chromium/Axios timeout does not reproduce in either version's ten focused
repetitions; it remains an observed full-suite failure, not a confirmed regression
or a passing result. Controls use port 13723, direct build commands, and
`sendFile`'s `dotfiles: 'allow'` solely for their hidden scratch path. No timeouts,
assertions, or skips are changed, and unrelated adapter behavior is left alone.

The runtime failure remains factory-default form construction; consumer and
fixture diagnostics remain shared-page augmentation. Package, client, both SSR
builds, changed-file formatting, and `git diff --check` pass. Browser/runtime/type
layers still exit nonzero; SSR and the focused InfiniteScroll runs exit zero.

Inspected native captures show the default cards and reactive hidden state.
Executed probes restore 15 rows without fetching, preserve every original row
during real 15 → 30 → 40 pagination, require page-tag counts of 15/15/10, and
report zero page errors. The preview is restored to Fetch assets. The manual
playground remains unchanged; validation is local and CI has not run remotely.

## Phase 10: Link callbacks and loading (2026-10-13)

Link already declares `onHttpException`, `onNetworkError`, and `onFlash` through
core's public types, but omitted them from prop splitting and visit options.
They now stay out of DOM attributes, receive the existing no-op default pattern,
and flow directly through the reactive visit-parameter memo. Direct forwarding
preserves a synchronous `false` return that suppresses exception handling;
flash remains a notification. This follows the pinned React/Vue callback contract,
not Svelte's adapter-specific cancelable DOM-event bridge.

The loading getter now uses the literal `data-loading` key rather than
`dataLoading`, which Solid serialized as `dataloading`. Its existing signal-based
request count, start/finish wrappers, and separate prefetch parameters are
unchanged. Loading remains an empty attribute while requests are in flight and
is removed afterward; this is not a new boolean loading implementation.

All seven original callback/loading cases fail on all three engines before the
fix, **21/21 red**. Callback forwarding alone makes its five cases per engine
pass, including both exception-suppression cases. One additional public browser
regression starts two async visits from the same Link, holds real backend
responses, cancels the first through its public cancel token, and requires
loading to remain until the other visit finishes. The fixture uses a Solid signal
to observe finish callbacks and explicitly preserves page state. No backend
substitute or router mock is introduced.

The new regression fails with the old attribute spelling. It also fails at the
post-cancellation assertion when a deliberate mutant resets the count to zero
on every finish. That mutant is restored before final builds. The eight cases
pass **24/24** across the three engines and five repeats each, **120/120**, with
no retries. Repetitions are stability checks, not additional unique contracts.

The complete matrix uses the same pinned Node, pnpm, browsers, four workers, and
no-retry settings as Phase 9. Browser/client/SSR builds and runs are sequential:

| Layer | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| Chromium / Fetch, all 1,110 cases | 1,020 | 23 | 67 |
| Firefox / Fetch, all 1,110 cases | 1,003 | 24 | 83 |
| WebKit / Fetch, all 1,110 cases | 1,020 | 26 | 64 |
| Chromium / Axios, all 1,110 cases | 1,020 | 23 | 67 |
| Manual/automatic SSR and hydration, all 36 cases per engine | 75 | 0 | 33 |
| Public browser/server runtime consumers | 11 | 1 | 0 |
| Public TypeScript consumers | — | 1 diagnostic | — |
| Strict fixture TypeScript compilation | — | 1 diagnostic | — |

Fetch totals are **3,043 passed / 73 failed / 214 skipped**, with no blocked serial
followers or runner errors. Case-by-case comparison identifies all **21 original
Link callback/loading combinations now passing**, plus the new regression on each
engine. Axios gains the same seven original contracts and the new regression.
InfiniteScroll stays at 233/0/1 with Fetch and 78/0/0 with Axios; SSR stays 75/0/33.
Original assertions, timeouts, and skips are unchanged.

WebKit's post-render scroll timeout from Phase 9 passes this time, as does the
Chromium/Axios version; these extra passes are not attributed to the fix. Firefox's
quick-hover prefetch assertion remains red, and WebKit now fails that same
assertion at `prefetch.spec.ts:97`. The Phase 9 focused controls already reproduced
it on WebKit in 4/10 runs, before this patch. This establishes a pre-existing
failure, not a settled cause or unchanged failure rate. No previously passing
Fetch case becomes red outside that known prefetch scenario; no previously
passing Axios or SSR case becomes red.

The factory-default form runtime failure and shared-page type diagnostics remain.
Programmatic `router.flash()` reactivity, other scroll failures, forms,
Precognition, layouts, deferred props, and `useHttp.response` are outside this fix.
Package, client, both SSR builds, formatting, and `git diff --check` pass;
browser/runtime/type layers remain nonzero on their recorded failures.

Inspected native captures show idle, one-canceled/one-pending, and fully finished
states. Executed DOM checks require the correct loading attribute, absence of
the misspelled attribute, finish counts 0 → 1 → 2, and zero page errors. A final
spacing-only adjustment to the new controls is rebuilt, visually reinspected,
and rechecked with all nine loading combinations. The preview uses Fetch assets.
The manual playground is unchanged; nothing is pushed and CI has not run remotely.

## Phase 11: Programmatic flash reactivity (2026-10-13)

The pinned React, Vue, and Svelte adapters synchronize imperative flash through
`router.init({ onFlash })`. Core replaces its flash data before calling this
initialization callback, then emits the global flash event only for nonempty
data. A global-event subscription would therefore miss clearing flash. Solid
now reconciles only the existing page store's `flash` field; component, props,
layout, and page-key handling are unchanged. No additional store, event listener,
initial-page normalization, or core patch is introduced.

Object and key-value updates still merge in core, while a function's returned
object replaces flash completely. `router.flash({})` remains a no-op;
`router.flash(() => ({}))` clears it. Reconciliation removes omitted keys instead
of retaining them through Solid's default object-merge setter behavior.

The four original programmatic flash cases fail before the bridge on all three
engines, **12/12 red**. One additional public browser regression requires exact
rendered data after removing root and nested keys, changing a nested boolean to
false, merging an object update, and submitting an empty-object no-op, with zero
requests. It also fails before the bridge, **3/3 red**. Existing tests retain
coverage of function-form clearing. No fixture or existing upstream assertion is
changed.

A deliberate plain-store-merge mutant retains the obsolete root key and cannot
clear flash. Both the replacement regression and original clearing case reject
it on every engine, **6/6 red**. The mutant is restored before final builds.
All 20 flash cases then pass on all three engines, **60/60**, and with Chromium
Axios, **20/20**. The five programmatic cases pass five repetitions per engine,
**75/75**, without retries. Repetitions are not additional unique contracts.

The complete matrix uses the same pinned environment, four workers, and no
retries as Phase 10. Package/client builds and browser/client/SSR runs execute
sequentially, rebuilding assets before switching clients:

| Layer | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| Chromium / Fetch, all 1,111 cases | 1,025 | 19 | 67 |
| Firefox / Fetch, all 1,111 cases | 1,009 | 19 | 83 |
| WebKit / Fetch, all 1,111 cases | 1,026 | 21 | 64 |
| Chromium / Axios, all 1,111 cases | 1,025 | 19 | 67 |
| Manual/automatic SSR and hydration, all 36 cases per engine | 75 | 0 | 33 |
| Public browser/server runtime consumers | 11 | 1 | 0 |
| Public TypeScript consumers | — | 1 diagnostic | — |
| Strict fixture TypeScript compilation | — | 1 diagnostic | — |

Fetch totals are **3,060 passed / 59 failed / 214 skipped**. Comparison keys use
file, nested suite titles, test title, and project, not shifted line numbers.
All **12 original flash engine/case failures now pass**, plus the new regression
on each engine. Axios gains the same four original contracts and new regression.
No previously passing Fetch, Axios, or SSR case becomes red, no case disappears,
and there are no blocked serial followers or runner errors. InfiniteScroll stays
233/0/1 with Fetch and 78/0/0 with Axios; SSR stays 75/0/33.

Firefox and WebKit's previously intermittent quick-hover prefetch cases both
pass in this Fetch run. Those two additional passes are not attributed to the
flash fix; prior unchanged-code controls established their timing sensitivity.
Original assertions, timeouts, capability exclusions, and skips are unchanged.

The factory-default form construction failure remains, along with the consumer
type diagnostic for missing shared `account` and fixture diagnostic for unknown
`auth`. Package, client, manual/automatic SSR builds, changed-file formatting,
and `git diff --check` pass. Browser, runtime, and type layers remain nonzero on
their recorded failures; focused flash and SSR runs exit zero.

Inspected native Chromium captures show the initial empty state and function
replacement with only `profile.enabled: false` and `message: 'replacement'`.
An executed public-API probe verifies merging, no-op, and both clearing paths,
zero requests or console/page errors, an unchanged URL/history length, and the
same rendered flash node. Both clearing calls update the DOM without another
global flash event. The preview uses Fetch assets; the manual playground remains
unchanged. Validation is local; nothing is pushed and CI has not run remotely.

## Phase 12: Factory-default forms (2026-10-13)

Core's argument parser passes a data factory through unchanged. The pinned
[React](https://github.com/inertiajs/inertia/blob/e36ead235b3d395e0857ade3793b000175622ae2/packages/react/src/useFormState.ts),
[Vue](https://github.com/inertiajs/inertia/blob/e36ead235b3d395e0857ade3793b000175622ae2/packages/vue3/src/useFormState.ts),
and [Svelte](https://github.com/inertiajs/inertia/blob/e36ead235b3d395e0857ade3793b000175622ae2/packages/svelte/src/useFormState.svelte.ts)
form-state implementations call that factory directly and reject every manual
defaults overload for function data. Solid previously called the factory's
returned object as another function, producing `dataOption(...) is not a
function`. The shared form-state constructor now invokes the supplied function
directly, fixing both `useForm` and `useHttp`. Public `defaults()` gains the same
upstream guard and error message; internal automatic default setters remain
separate and allowed. Object-data behavior and the reset implementation are
unchanged. No memoization, core patch, helper layer, or dependency is added.

The existing factory unit case is extended to both public hooks, using an owned
render root and post-render interactions. Its mutable ordinary-variable source
deliberately has no signal dependencies: resetting must reread any factory input,
not just inputs tracked by a memo. A native browser fixture complements it with
signal-provided defaults. Both require source changes to leave current edits
alone, selected nested resets to preserve sibling data/errors and their default
baseline, all-field resets to restore fresh empty-string/zero/false values and
mark clean, and errors to persist until explicitly cleared. The unit cases also
reject all three manual defaults overloads without changing rendered state.
The existing real-server App case keeps its object-data control and adds a
factory variant. These are public consumers, not router or store mocks.

Before the fix, the original factory unit case fails during construction.
After correcting construction alone, both extended unit cases still fail
because manual defaults do not throw. With the guard, all **14 runtime cases
pass**. Restoring the original constructor as a negative control makes all
**six native browser combinations fail**, plus both public-hook unit cases and
the new server case. A memoized-resolver mutant makes both nonreactive-source
unit cases fail, while all six signal-source browser combinations still pass;
this demonstrates the complementary coverage rather than claiming the browser
cases detect caching. Updating every default during a selected reset makes both
unit cases and **all six browser combinations fail** at the clean-state check.
All mutants are restored before final builds. The six native browser cases pass
five repetitions per engine/hook, **30/30**, without retries; these are repeated
executions of two unique contracts, not 30 additional contracts.

The complete matrix uses the same pinned Node, pnpm, browsers, four workers, and
no-retry settings as Phase 11. Package/client builds and browser/client/SSR runs
are sequential, rebuilding assets before changing clients:

| Layer | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| Chromium / Fetch, all 1,113 cases | 1,027 | 19 | 67 |
| Firefox / Fetch, all 1,113 cases | 1,010 | 20 | 83 |
| WebKit / Fetch, all 1,113 cases | 1,028 | 21 | 64 |
| Chromium / Axios, all 1,113 cases | 1,027 | 19 | 67 |
| Manual/automatic SSR and hydration, all 36 cases per engine | 75 | 0 | 33 |
| Public browser/server runtime consumers | 14 | 0 | 0 |
| Public TypeScript consumers | — | 1 diagnostic | — |
| Strict fixture TypeScript compilation | — | 1 diagnostic | — |

Fetch totals are **3,065 passed / 60 failed / 214 skipped**. Comparison uses file,
nested suite titles, test title, and project, not shifted line numbers. All six
new factory combinations pass with Fetch, and both pass with Chromium Axios.
No existing red browser case becomes green; the two extra passes per engine are
the added contracts, not evidence that other form failures were resolved.
InfiniteScroll remains 233/0/1 with Fetch and 78/0/0 with Axios; SSR stays 75/0/33.
No case disappears, and there are no blocked serial followers or runner errors.

The only previously passing Fetch case to become red is Firefox's quick-hover
prefetch assertion at `prefetch.spec.ts:97`, expecting zero requests and receiving
one. Phase 9's unchanged-code controls reproduced it in 6/10 runs before that
patch. This is a previously observed intermittent failure, not a newly diagnosed
factory regression; its cause and failure rate remain unsettled. No previously
passing Axios or SSR case becomes red. Original assertions, timeouts, capability
exclusions, and skips are unchanged.

The consumer diagnostic still concerns missing shared `account`; the fixture
diagnostic still concerns unknown `auth`. An additional strict compile of the
two edited unit files reports one existing synthetic SSR `Page` fixture missing
`rescuedProps`, `flash`, and `rememberedState`. The same compiler against the
unchanged HEAD server test reports the identical diagnostic; the new unit code
adds none. This additional probe is not a new maintained test command. Package,
client, manual/automatic SSR builds, changed-file formatting, and
`git diff --check` pass. Browser and maintained type layers remain nonzero on
their recorded failures; runtime, focused factory, and SSR runs exit zero.

Inspected native Chromium captures cover initial data, edited data after changing
the factory source, selected reset, and full reset/error clearing with the manual
defaults rejection visible, for both public hooks. Executed DOM checks require
exact data, dirty flags, and errors at every step, with zero requests or
console/page errors. The preview is left running with Fetch assets. The manual
playground remains unchanged; validation is local and CI has not run remotely.

## Phase 13: Shared-page declarations (2026-10-13)

The pinned [React hook](https://github.com/inertiajs/inertia/blob/e36ead235b3d395e0857ade3793b000175622ae2/packages/react/src/usePage.ts)
and [Vue signature](https://github.com/inertiajs/inertia/blob/e36ead235b3d395e0857ade3793b000175622ae2/packages/vue3/src/app.ts#L277)
return `Page<TPageProps & SharedPageProps>`;
[Svelte's page alias](https://github.com/inertiajs/inertia/blob/e36ead235b3d395e0857ade3793b000175622ae2/packages/svelte/src/page.svelte.ts#L3-L7)
also includes that intersection. Solid previously returned `Page<TPageProps>`,
discarding configured shared props for default and explicitly typed consumers.
The public return type now includes both. The function still returns the same
context store and keeps its existing outside-App guard; a type assertion replaces
the broad `@ts-expect-error`. No wrapper, clone, signal, provider, or runtime
branch is added.

The existing public declaration consumer now checks direct shared-field inference
without a generic and configured account fields alongside a custom count generic.
Negative cases require numeric shared IDs, known nested shared keys, and the
existing custom-field type. The translated upstream `TypeScriptProps` fixture
remains unchanged and independently checks shared auth alongside page-specific
posts, nullable users, unknown keys, and core event/visit callbacks. Consumer and
fixture checks are red before the signature fix and green afterward.

A deliberate default-generic-only mutant makes the default call pass but leaves
the custom-account consumer and shared-auth fixture red; it also makes the
existing usePage fixture's explicit/default page identity comparisons fail to
compile. A `Page<any>` return mutant makes all three consumer negative directives
unused and causes fixture type errors. Both controls are restored before final
builds. These checks verify the public declaration contract, not the spelling
of the implementation's type expression.

Strict compilation of all three unit files exposes both existing synthetic Page
fixtures missing required `rescuedProps`, `flash`, and `rememberedState` metadata.
They now provide those empty fields, without changing any runtime assertions.
`test:unit:types` makes this a maintained layer in `pnpm test` and an independent
CI contract job. Its tiny config inherits the strict consumer options but selects
unit files, keeping consumer `account`, fixture `auth`, and unaugmented unit
programs separate. A red declaration layer still does not prevent later runtime,
browser, or SSR layers from executing.

Final validation executes the complete default `pnpm test` entrypoint with the
same pinned environment and no retries. Client assets are rebuilt explicitly
before opting into backend reuse. The runner reaches every one of its six layers:

| Layer | Result |
| --- | --- |
| Public TypeScript consumers | Pass, zero diagnostics |
| Strict fixture TypeScript compilation | Pass, zero diagnostics |
| Strict unit TypeScript compilation | Pass, zero diagnostics |
| Public browser/server runtime consumers | 14 passed / 0 failed |
| Chromium / Fetch, all 1,113 cases | 1,027 passed / 19 failed / 67 skipped |
| Chromium manual/automatic SSR and hydration, all 36 cases | 25 passed / 0 failed / 11 skipped |

Case-by-case comparison against Phase 12's Chromium results finds exactly the
same browser and SSR outcomes: no added/removed cases, no newly red or newly green
cases, no blocked serial followers, and no runner errors. The default command
still exits 1 because of those 19 supported browser failures, not declaration or
runtime failures; it runs SSR afterward. No assertions, timeouts, or skips change.

SHA-256 checks before and after the final builds confirm all three package
JavaScript entrypoints (`index.js`, `server.js`, and `vite.js`) are byte-identical
to Phase 12. This is a declaration correction plus typed test data and harness
wiring, not a runtime reactivity change. Firefox, WebKit, and Axios matrices are
not rerun for this phase; their Phase 12 results remain the historical baseline,
not new executions. No visual UI change or new screenshot is needed.

A temporary subprocess-stub probe separately verifies the CLI summary/exit
contract: all six green layers exit 0; a failing `test:unit:types` alone exits 1
and still reports the later runtime/browser/SSR layers. This probe checks only
orchestration, not real browser compatibility. The real default run above is
the integration evidence. The CI contract matrix references four existing
package commands, but remote CI has not run. Formatting of the hook, unit
fixtures/config, and runner, plus `git diff --check`, pass. The existing compact
consumer style is preserved. A standalone Fetch preview is left on port 13721;
the manual playground is unchanged and nothing is pushed.

## Phase 14: Stored HTTP responses (2026-10-14)

The existing upstream GET case returned the correct JSON through its Promise but
never rendered `search.response`. Two unchanged-code repetitions and a smaller
native-browser probe reproduce this: HTTP 200, the expected three-item body, and
zero stored-response nodes. Inspection of the public form shows a plain `null`
value rather than an accessor. `Object.assign` evaluates the source getter during
construction; the success path already updates its signal correctly. This is an
existing baseline failure, not a regression introduced by Phase 13.

The response property now installs that existing signal accessor directly with
`Object.defineProperty`, preserving enumeration/configurability and the original
form object. Other getters, fluent methods, Precognition, response parsing,
submission, error/cancellation handling, and the success setter are unchanged.
No extra memo, cloned form, core patch, or dependency is needed. The pinned
[Vue](https://github.com/inertiajs/inertia/blob/e36ead235b3d395e0857ade3793b000175622ae2/packages/vue3/src/useHttp.ts)
and [Svelte](https://github.com/inertiajs/inertia/blob/e36ead235b3d395e0857ade3793b000175622ae2/packages/svelte/src/useHttp.svelte.ts)
success branches store the full body before calling `onSuccess`, including null
for an empty success, while their failure branches retain the last success.

One additional browser contract exercises the same owned Solid hook across
initial null, two disjoint successful JSON bodies, reads inside `onSuccess`,
Promise results, pending state, 422/500/network failures, cancellation, and 204
clearing. Its fixture reads `form.response` directly in reactive JSX; independent
signals record callback-time reads and Promise results. A held real backend
response removes the pending-state speed race; only the network-failure step
injects an abort. Existing endpoints and the generic component resolver suffice,
so the backend is unchanged. Expected bodies come from its literal API data.

The new contract is red before the fix at stored null after successful GET.
Afterward it passes five repetitions per engine, **15/15 without retries**.
A setter-after-callback mutant fails the callback-time assertion even though
the final stored body is correct; an ignore-null-success mutant fails the 204
clearing assertion. Both are restored before final builds. The original GET case
also passes in all engines. A final focused rerun after the test's lint-only
adjustment passes in all three engines.

The full matrix uses the same pinned Node, pnpm, browsers, four workers, and
no-retry settings as Phase 12. Package/client/SSR builds and browser profiles run
sequentially, explicitly rebuilding assets when switching HTTP clients:

| Layer | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| Chromium / native XHR, all 1,114 cases | 1,029 | 18 | 67 |
| Firefox / native XHR, all 1,114 cases | 1,013 | 18 | 83 |
| WebKit / native XHR, all 1,114 cases | 1,030 | 20 | 64 |
| Chromium / Axios, all 1,114 cases | 1,029 | 18 | 67 |
| Manual/automatic SSR and hydration, all 36 cases per engine | 75 | 0 | 33 |
| Public browser/server runtime consumers | 14 | 0 | 0 |
| Public, fixture, and unit TypeScript programs | Zero diagnostics | 0 | — |

Built-in-client totals are **3,072 passed / 56 failed / 214 skipped**. All **43
useHttp cases pass** in each engine and in Chromium Axios. Case-by-case comparison
against Phase 12 finds only the original GET becoming green in each profile,
the added response contract, and Firefox's previously intermittent quick-hover
prefetch case passing this time. That prefetch pass is not attributed to this
fix. No previously passing case becomes red; no case disappears; no serial
follower is blocked; and there are no runner errors. Axios otherwise matches its
baseline, and SSR outcomes are unchanged. Assertions, timeouts, exclusions, and
skips in existing cases are unchanged. The complete browser profiles still exit
1 on their remaining supported failures; type/unit, focused, and SSR runs exit 0.

Executed native-browser probes verify the original minimal scenario now has one
stored-response node, and the lifecycle fixture has the expected JSON/flags at
every step with no uncaught page errors. Inspected captures cover the original
GET result, initial null, JSON, pending retention, replacement, each failure,
cancellation, and empty success. A transport probe also corrects the historical
"Fetch" label: pinned core's [default HTTP client](https://github.com/inertiajs/inertia/blob/e36ead235b3d395e0857ade3793b000175622ae2/packages/core/src/http.ts#L5-L35)
uses [native XHR](https://github.com/inertiajs/inertia/blob/e36ead235b3d395e0857ade3793b000175622ae2/packages/core/src/xhrHttpClient.ts#L92-L122),
so an assertion expecting `resourceType: 'fetch'` correctly fails. Both clients
report `xhr`; that observation cannot distinguish them. Probes instead check the
actual served entry's default/`axiosAdapter()` branch, its matching hashed build
asset, and the exact successful JSON/stored-response projection in both profiles.
The preview is restored to built-in-client assets. Source/new-fixture lint, spec formatting,
and `git diff --check` pass. Whole-spec lint retains one pre-existing diagnostic
for upstream's unchanged global `parseInt` call; no new diagnostic remains.
Temporary probes are removed. The preview stays on port 13721; the manual
playground is unchanged. This phase is local and uncommitted for review; nothing
is pushed and remote CI has not run.
