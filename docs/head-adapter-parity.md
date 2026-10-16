# Head adapter parity and manual-test tracker

Audit date: 2026-10-12. Initial snapshot: `feat/head-component`, commit `13e2717`.
Initial dependencies: `@inertiajs/core` 3.4.0 and Solid 1.9.13. After the local
merge from `main`, installed versions are core 3.9.1 and Solid 1.9.17; JSX
regressions use the installed Solid compiler. Pre-upgrade gap fixes are checkpointed
locally; server-head integration changes remain uncommitted.
Baseline observations and baseline line citations below remain historical evidence;
the status table and resolution paragraphs describe the current working tree.
Do not push the branch until the owner authorizes it after manual testing.

## Acceptance concerns the adapter, not fixes to shared core

The owner's acceptance criteria are plug-and-play Head integration, CSR-only and
SSR → hydration support, and Solid reactivity. Match the official adapters where
possible; shared-core behavior is the compatibility baseline, not a migration
blocker. H06/H08 remain documented for awareness, but their candidate corrections
are outside this adapter's scope and are not installed.

Importing `Head` requires no separate provider or Head-specific bootstrap.
`createInertiaApp` supplies the manager, collects SSR output, and automatically
selects client rendering or hydration with the normal Inertia v3 bootstrap.
Signal-driven title/attribute updates, conditional removal and provider restoration
are exercised in both modes. Resource creation inside deferred Head children
remains a hydration-cache caveat, not a loss of Signal reactivity; helpers returning
Head preserve normal resource hydration.

## The reference adapters do not have one identical implementation

- **React 3.4.0:** [Head][react-head] serializes React elements into core provider
  strings. Its [App][react-app] creates a manager per App and refreshes it on
  `navigate`; its [SSR setup][react-ssr] captures `onHeadUpdate` snapshots.
- **Vue 3.4.0:** [Head][vue-head] serializes VNodes, updates its provider during
  rendering, and disconnects before unmount. Its [App][vue-app] exports the current
  manager through module state and also refreshes on `navigate`; its
  [SSR setup][vue-ssr] captures `onHeadUpdate` snapshots.
- **Svelte 3.4.0:** its [exports][svelte-exports] contain no Inertia `Head`.
  [SSR setup][svelte-ssr] returns the native renderer's head string as `[head]`.
  Native `<svelte:head>` is not a reference implementation of core provider
  precedence, `head-key`, or the React/Vue title callback.
- **Solid:** [Head](../src/Head.ts) resolves owned JSX nodes on mount, observes
  their detached DOM, and publishes strings to core. [SSR](../src/serverHead.ts)
  extracts only surviving templates from completed HTML, using numeric Head
  registration order and request-local scalar title snapshots.

Compare the Inertia protocol with React/Vue, and Solid lifecycle behavior with
ordinary Solid controls. Do not reproduce a reference serializer bug merely to
make its output identical.

## Shared core behavior is already shared, not reimplemented

Solid matches the React/Vue serializers' title fallback and delegates the remaining
collection and DOM behavior to the same [core collector][core-collect] and
[DOM updater][core-dom]:

- A truthy `title` prop is a fallback; a child title, including an empty one,
  suppresses it. Whitespace titles are not trimmed. Solid's empty-child probe
  produced an empty title in both CSR and SSR, not the prop fallback.
- Nonempty `head-key` values deduplicate across tags and providers. Omitted and
  empty keys do not deduplicate. Prototype-looking keys are not raw accumulator
  property names: core uses the complete serialized marker attribute as identity.
- Later-created providers override earlier providers with the same identity.
  Updating an existing provider does not raise its priority. Child order breaks
  ties within one provider; final output order is not necessarily JSX order.
- Core retains equal managed DOM nodes, replaces changed ones, and removes
  abandoned managed nodes. It generally leaves unmarked server elements alone,
  except that an incoming managed title removes unmarked titles.
- Equal scripts are retained; changed or inserted scripts are recreated for
  execution. Nonce hiding under CSP can defeat equality (H06). Core does not
  reorder retained keyed DOM nodes into new JSX order.
- Head strings are not sanitized by core. Its title callback receives serialized
  title content, and its callback result is interpolated without escaping.

Local owners in the initial snapshot: `src/Head.ts:28–55,76–106`,
`src/serverHead.ts:61–116,126–135`, and `src/HeadContext.ts:15–45`.

## Findings keep stable IDs as their status changes

| ID | Status | Priority | Finding |
| --- | --- | --- | --- |
| H01 | Fixed locally; manual approval pending | Medium | Missing explicit navigation refresh for non-Signal title formatters |
| H02 | Fixed locally; manual approval pending | High for affected renderers | Solid asset output can cross concurrent requests after a yielding renderer |
| H03 | Fixed locally; manual approval pending | Medium for CSP deployments | Configured nonce did not reach Solid's generated scripts |
| H04 | Fixed locally; manual approval pending | Low | Directly nested Head differed between client and server |
| H05 | Fixed locally; manual approval pending | Low | Title-prefixed custom tags suppressed only the client fallback |
| H06 | Shared-core baseline; outside adapter scope | Informational | Equal nonced Head scripts can execute again under CSP |
| H07 | Fixed locally on core 3.9.1; manual approval pending | Medium | New server-head API lacked option forwarding, initial state, SSR precedence and client-visit synchronization |
| H08 | Shared-core baseline; outside adapter scope | Informational | Single- and double-quoted identities do not deduplicate together |

### H01: refresh formatters on qualifying Inertia navigation

React/Vue 3.4.0 call `headManager.forceUpdate()` on `navigate`
([React][react-app], [Vue][vue-app]). Core's [event registration][core-events]
listens on `document` for `inertia:navigate`; it does not independently refresh
head managers. The baseline invalidated its owned collector through Signal
dependencies and provider operations, with no corresponding listener
(`src/App.ts:44–64`, `src/HeadContext.ts:15–45`).

**Observed:** a page without Head, using `title: () => window.parityLocale ||
'Before'`, remained `Before` after changing the global to `After`, emitting the
public event, and separately swapping the page URL. An in-memory control adding
the official navigation-listener pattern changed the title to `After`.
No production source was modified for that control.

This does not mean Signal-based formatters are broken. It exposes the absence of
the event-based fallback for non-reactive data such as browser location or globals.
The original probe mocked the component-swap callback. Follow-up validation also
used the real router with browser-intercepted Inertia JSON responses: HTTP visit
`/a` → `/b`, reactive client replacement, history back, and history forward all
produced the expected title, without browser errors. This is not a real backend
deployment test.

**Resolved locally:** App subscribes to `navigate` and unsubscribes on cleanup.
The wrapper's `forceUpdate` invalidates its owned effect, preserving dependency
retracking after the callback selects a different Signal/store branch. A deliberately
unowned-refresh mutation changed the first title but failed the subsequent reactive
update. Do not attribute newer `clientVisit` listeners
to 3.4.0: [page setting][core-page] normally emits `navigate` only for non-replacing
visits, not every reload, replacement, or hash change.

After upgrading to 3.9.1, both `navigate` and `clientVisit` call the wrapper's
`updateServerHead`. This refreshes title formatting and retracks dependencies
through the same owned effect, including when server-head support is disabled.
Both listeners unsubscribe with the App owner. See H07 for real-router coverage.

### H02: scope Solid assets separately from Inertia Head snapshots

React/Vue SSR responses capture manager output in local response variables
([React][react-ssr], [Vue][vue-ssr]). Solid's Inertia Head snapshots are likewise
request-local, but baseline `src/createInertiaApp.ts:155` separately called global
`getAssets()` after awaiting the renderer. That call also existed before the Head
migration; it is not caused by provider deduplication or the new title map.

**Observed:** render First and Second concurrently with delays 20 ms and 1 ms.
Each registers a Solid asset through
`useAssets(() => ssrElement('meta', { name: 'solid-asset', content: name }, undefined, false))`.
A renderer that awaits native `renderToStringAsync`, then yields for 30 ms, returns:

```html
<!-- First response: correct -->
<title data-inertia="">First</title>
<meta name="solid-asset" content="First"/>
<!-- Second response: title isolated, Solid asset from the wrong request -->
<title data-inertia="">Second</title>
<meta name="solid-asset" content="First"/>
```

**Control:** the stock native renderer returned both assets correctly in the same
concurrent scenario. Do not claim all ordinary SSR requests leak assets. The
confirmed failure concerns an allowed wrapper yielding after native finalization.

**Resolved locally:** the render root includes a synthetic `<head></head>` using
public `ssr`. Solid's [native asset injection][solid-asset-injection] captures the
matching render's assets there before finalization returns. The adapter extracts
that block into the response's `head` and removes it from `body`; it no longer
calls global `getAssets()` after awaiting a renderer. Stock and yielding concurrent
controls both return the correct per-request metadata. A raw asset script containing
`</head>` is preserved, and the existing eager-layout precedence test remains green.
Extraction uses the explicit head closing-tag offsets because HTML parsing can
reopen head for subsequent templates.

Custom wrappers must preserve this native asset boundary until extraction. There
is no public request-local handle for recovering arbitrary assets after a wrapper
discards their output. This adaptation preserves body hydration IDs and avoids
private Solid context mutation.

### H03: validate nonce forwarding under an actual CSP

All three official adapters store the configured nonce, but [core Head][core-dom]
does not automatically apply it to arbitrary Head tags. Explicit tag nonces are
the shared contract, and the initial probe preserved `explicit-nonce` and executed
the script once in both CSR and SSR without an enforcing policy.

Solid additionally generates a bootstrap with `generateHydrationScript()`
(`src/createInertiaApp.ts:125–126,155–156`). **Observed:** supplying
`nonce: 'configured-nonce'` still returned a bootstrap script without a nonce.
The pre-migration code also called `generateHydrationScript()` without options.

**Resolved locally:** capture the configured nonce before asynchronous component
resolution, pass it to the native renderer and
[bootstrap generator][solid-hydration-generator], and preserve it across concurrent
requests. The initial forwarding attempt read global configuration after resolving
components; a regression with `first-nonce`/`second-nonce` exposed that race and
now passes. The generator call explicitly types the documented server options
because Solid's browser declarations expose its stub with zero parameters.

An actual CSP response header blocks a deliberately unnonced control script while
allowing the bootstrap, resource serialization, and explicitly nonced Head script.
Hydration retains the page-owned resource's SSR value with zero client fetches.
A mutation removing only native-renderer nonce forwarding causes a client refetch
and fails the test. Equal Head script adoption under this policy is separately
limited by H06; nonce forwarding does not solve that core equality bug. Custom
renderers must forward the options argument to Solid's renderer.

### H04–H05: make unsupported-input policy consistent

- **H04:** `<Head title="Outer"><Head title="Inner" /></Head>` produced `Inner`
  in CSR and threw `An Inertia <Head> cannot be nested inside another <Head>.`
  in SSR (`src/serverHead.ts:104–105`). React does not invoke a child Head component
  through its serializer; Vue rejects object components. Nested Head is not a
  supported reference composition. Decide whether to reject it consistently or
  document the limitation; do not infer general nested-provider support.
- **H05:** `<Head title="Fallback"><title-extra>Not a title</title-extra></Head>`
  suppressed the CSR fallback but included `Fallback` in the SSR response.
  Client detection uses `startsWith('<title')` (`src/Head.ts:51`), matching the
  reference serializers; server detection checks exact tag name
  (`src/serverHead.ts:108`). This is an invalid head-tag use case, not a failure
  of normal `<title>` metadata. Prefer an explicit, consistent tag policy.

**Resolved locally:** an owned child context rejects nested Head during component
execution in both environments, so Solid ErrorBoundary can recover before late
SSR extraction. The public provider is invoked directly to avoid introducing a
different hydration component scope. Normal sibling/layout Heads and stateful
For behavior remain covered. Client title detection now requires the exact tag
name; `title-extra` no longer suppresses the fallback, matching SSR behavior.

### H06: nonce hiding defeats core script adoption under CSP

[Core 3.4.0][core-dom] reconstructs scripts and compares managed DOM nodes with
raw `isEqualNode()`. A CSP-connected script hides its nonce content attribute
while retaining the `.nonce` property; the fresh detached comparison node still
has the original content attribute. Core replaces the old node and executes the
replacement even when script body, identity, and effective nonce match.

**Observed independently of Solid:** a core-only browser provider control started
with one SSR script execution. After publishing the identical string, the count
remained one without CSP and became two with nonce CSP. Under CSP the original
script's `getAttribute('nonce')` was empty while `.nonce` remained `test-nonce`.
This also explains the duplicate observed in the adapter's strict-CSP hydration
probe. The [inspected newer core][upstream-head] still uses the same comparison.
The pinned [3.9.1 implementation][core-head-391] also retains raw `isEqualNode`;
this upgrade does not fix H06.

**Disposition:** keep open as an upstream issue. Fixing bootstrap/resource nonce
forwarding is separate from this bug. No dependency patch, DOM-method override,
or second head writer was added, and no external issue was filed. Scripts that
must execute once cannot rely on core adoption under nonce CSP in this version.

**Follow-up on 3.9.1:** the core-only contrast reproduces one execution without
CSP and two with CSP. An isolated candidate compares nonce presence and effective
`.nonce`, then compares detached clones with their nonce attributes removed. It
retains the equal script under CSP, while changed nonce, body, other attributes,
and nonce presence still replace it. Empty/absent nonces remain distinct and the
CSP blocks those scripts. Live nodes and global DOM methods are not modified.
This correction is prepared, not installed; see H08 for delivery constraints.

### H08: collection identities depend on serialized quote spelling

Core 3.9.1 uses the entire matched `data-inertia` attribute as a collection key.
The same value in single and double quotes therefore occupies two slots, even
though the DOM updater later compares the parsed attribute value.

**Observed independently of Solid:** resolving a single-quoted server description
and publishing a double-quoted component description produces two collected tags,
not the one component override. Both defects remain in the inspected upstream
snapshot. Use double-quoted server markers with Solid's `head-key` output for now.

**Isolated candidate:** capture the value from either quote style and namespace
the collection key, without rewriting the raw HTML. Controls pass for both quote
directions, provider removal restoring the server value, prototype-looking keys,
`title`/numeric keys, and empty unkeyed markers. Together with H06's correction,
this is preserved as `.amp/in/artifacts/inertia-head-core-fixes.patch`, against
the pinned 3.9.1 source; application and byte-for-byte comparison were validated
in a disposable directory only.

The adapter's regular build externalizes core. A repository-local pnpm dependency
patch is not inherited by consuming applications and cannot deliver this fix to
npm/Yarn consumers. Prefer an upstream core correction or an explicit patch in
the consuming application; no dependency patch or private core fork is installed.

## Solid-native differences require deliberate acceptance

| ID | Difference | Evidence and disposition |
| --- | --- | --- |
| D01 | Owned JSX instead of VNode inspection | Solid control flow and helper components execute with their real owners. React does not normally render custom Head children; Vue only invokes certain function nodes and rejects object components. Retain Solid behavior; the existing stateful For regression compares with an ordinary body control. |
| D02 | Native DOM attributes instead of generic prop stringification | Solid emitted `class="active"`, `style="color:red"`, and omitted `disabled={false}`. Reference serializers generically stringify props. Keep Solid normalization, not reference malformed attributes. Sources: [React][react-head], [Vue][vue-head], `src/Head.ts:28–47`. |
| D03 | Null keys and numeric child text | Solid treats `head-key={null}` as absent, while reference serializers stringify a defined null to `"null"`. False and zero keys remained `"false"` and `"0"` in Solid. A numeric child title `0` rendered `0`; React's serializer only handles string/array child text and can omit it. Keep native values; recommend string keys. |
| D04 | Escaped child-title callback input | Solid's child `A & B < C` reaches core as `A &amp; B &lt; C`; reference literal string children are appended raw. A callback comparing with the raw string did not match in Solid, although displayed text was correct. Reference title props are already escaped too. Decide/document the callback-input contract; do not globally decode arbitrary raw HTML. |
| D05 | Resources created inside Head children do not reuse SSR hydration data | A resource-owning helper inside Head fetched once on the client; an ordinary body helper fetched zero times and retained server data. A helper creating its resource and returning Head also hydrated with zero fetches, then fetched once when its Signal source changed. Keep resource creation outside Head children; it need not live in the page/layout. Reference custom-child serializers do not promise this Solid resource behavior. |
| D06 | Refs point to detached declarations | The CSR ref probe reported `isConnected === false` and was not the actual document-head node. Core reconstructs nodes from strings, so listeners/refs are not transported to installed tags. This is declarative metadata, not a normal Solid DOM portal. Do not promise full Meta-package DOM-ref semantics. Sources: `src/Head.ts:77–92`, [core DOM][core-dom]. |
| D07 | Buffered, surviving-template SSR collection | React/Vue publish during component rendering; Solid waits for completed HTML and snapshots scalar title props during native finalization. Abandoned branches are excluded and remaining body bytes retained. Keep this adaptation; creation-order precedence does not guarantee identical SSR/CSR winners when async creation timelines differ. Sources: `src/HeadContext.ts:48–75`, `src/serverHead.ts:119–147`. |
| D08 | Proactively reactive global title callback | Solid passes `(title, page)` and tracks Signal reads even without a Head. Page awareness was an extension against 3.4.0 and now matches the 3.9.1 public contract. Owned Signal retracking remains Solid-specific and does not replace H01's event invalidation. |
| D09 | Different SSR collection API | React/Vue Apps accept `onHeadUpdate` for response-local capture ([React][react-ssr], [Vue][vue-ssr]). Solid's exported `InertiaAppProps` has no equivalent callback; extraction lives inside `createInertiaApp`. Custom SSR must use that pipeline rather than expect a standalone native App render to expose collected Head. Source-derived difference, not separately runtime-probed: `src/App.ts:23–28`, `src/createInertiaApp.ts:139–163`, `src/index.ts:7–8`. |

**D05 investigation:** [client resource reuse][solid-resource-hydration] requires an
active hydration context and matching positional IDs at resource creation.
[NoHydration/Hydration][solid-hydration-boundaries] do not offer resource-only
hydration for arbitrary intrinsic JSX. Solid Meta instead executes descriptor
components during normal traversal, returns no DOM, and manages its tags separately
([source][solid-meta-ownership]). That is not an interchangeable implementation of
Inertia's plain-tag syntax. Preserve the owned detached-DOM design without private
hydration-context manipulation. Resources can remain encapsulated in a helper
that returns `<Head>`, provided the helper itself runs outside Head's children.
The new regression hydrates `Server A` title/meta with zero client fetches, then
changes the Signal source to B and observes `Client B` with one fetch. The
enforced-CSP regression separately covers cached page-owned resources.

Moving child evaluation earlier is not a safe transparent fix: an isolated
compiler override produced missing-meta hydration mismatches for both the nested
resource and resource-owning-helper scenarios. A second hydration root does not
provide a general resource-only replay contract either. Head-child resources
still refetch with the isolated core fixes, confirming this is a separate Solid
hydration boundary. README documents the supported helper composition without
claiming arbitrary nested resource hydration, full refs (D06), raw callback input
(D04), or standalone App SSR collection (D09).

The Meta comparison uses the inspected 0.29.7 snapshot, not a byte-for-byte audit
of the previously installed 0.29.4 release. The resource follow-up inspected
[Solid 1.9.17][solid-resource-hydration-1917], dom-expressions 0.40.12, and the pinned
[Meta implementation][solid-meta-ownership-pinned]. Historical runtime citations
remain pinned to Solid 1.9.13/dom-expressions 0.40.8; this is not a new full Meta audit.

Raw JavaScript containing `<`, `&&`, and `&`, JSON-LD values containing `<`/`&`,
and CSS containing a `<` media comparison were preserved in CSR and SSR.
JavaScript evaluated correctly and the CSS parsed into one rule. Signal updates
also changed the JSON-LD content correctly. A native body control and Solid
`innerHTML` variants provided additional controls; no raw-text escaping failure
was observed for these inputs. This does not establish safe handling of arbitrary
`</script>`-containing data or untrusted HTML.

## H07: implement the pinned 3.9.1 server-head contract

The local merge preserves main's core/Vite 3.9.1 upgrade, Solid 1.9.17 floor,
and unrelated adapter updates without restoring Meta. The integration follows
pinned [core][core-head-391], [React App][react-app-391], [Vue App][vue-app-391],
and their [server-head tests][server-head-tests-391]:

- `serverHead` is opt-in: `true` reads `page.props.head`, a string selects another
  prop, and a callback receives the page. It is not a top-level `Page.head` field
  or the SSR response's `head` array. Core filters and marks the strings.
- App resolves initial metadata after component resolution, before rendering
  component providers. Client core receives it as its fourth manager argument.
  SSR stores the resolved array in the request-local state and supplies it to the
  extraction manager as server entries, not as a later component provider.
- Server entries precede component providers. Matching component keys and titles
  override them; disposing a component Head restores the latest server values.
- Both `navigate` and `clientVisit` resolve metadata from `event.detail.page`.
  The title formatter separately reads the current Solid page store. The owned
  collector retracks after server updates; the manager is not recreated.
- Updates replace or clear the server array. Partial reloads that omit the prop
  retain it because core merges props first, not because the adapter accumulates
  previous metadata. Resolvers run initially and on events, not as a separate
  reactive Solid computation.
- Single-quoted markers are recognized. Core's collection identity still includes
  serialized quote spelling, so mixed single/double quotes do not deduplicate in
  the collector. Use double-quoted server markers to match Solid `head-key` output.
  H08 now includes an independent core-provider reproduction and candidate controls.

**Observed:** real router calls with intercepted HTTP responses pass in both CSR
and SSR hydration: component override → removal/restoration → partial reload
omitting head → client replacement → HTTP visit → back → forward → empty-array
clear. Title callbacks use the current page, keyed metadata remains unique,
unmanaged tags survive, and the identical server script executes once and retains
its DOM node without CSP. This does not claim once-only adoption under nonce CSP
(H06) or cover a deployed backend.

Explicit SSR and factory SSR pass disabled/default/custom/callback cases.
Overlapping async factory renders with a yielding renderer preserve each request's
server metadata and component title. Owner disposal removes both event listeners.
The public option shapes pass consumer typechecking.

**Controls:** against the merged pre-integration source, six of eight selected
cases fail; omitted and disabled controls pass. Removing only the `clientVisit`
listener leaves `Before server:Client` instead of `Client server:Client` in both
real-router cases. Removing owned invalidation from `updateServerHead` updates
the first title but misses the subsequently selected reactive dependency.

## Manual validation remains pending

- [ ] Real CSR visit A → B → back/forward: title, keyed metadata, unkeyed metadata,
  and unmanaged server tags; use a retained layout and a page without Head.
- [ ] H01: formatter reading browser location/global locale; compare with a Signal
  formatter and check qualifying navigation separately from replacement/reload.
- [ ] H07: real server-provided head props, partial reload merging, client-side
  replacement and history; component overrides/restoration and double-quoted keys.
- [ ] Stateful For reorder/add/remove and Show disposal: state survives, metadata
  disappears, and retained layout values reappear without raising layout priority.
- [ ] SSR → hydration with page-owned resources, helpers returning Head, and
  helpers inside Head: fetch count, source changes, temporary metadata/title loss,
  nested/outer Suspense, and rejected resources. Do not expect the inside-Head
  helper to reuse SSR data with the current design.
- [ ] H02: overlapping requests with real Solid assets, using both stock renderers
  and the actual custom renderer/postprocessing wrapper.
- [ ] D09: custom SSR integrations use the `createInertiaApp` collection pipeline;
  do not assume a standalone native App render exposes head output.
- [ ] Script adoption runs once without nonce CSP; evaluate H06 separately under
  nonce CSP. Changed script content executes as intended;
  structured data, raw CSS, and special-character titles retain their values.
- [ ] H03: actual strict CSP, explicit tag nonces, generated bootstrap, and async
  resource scripts. Do not equate attribute preservation with CSP enforcement.
- [ ] Confirm documented callback escaping (D04) and consistent unsupported-input
  policies (H04, H05) are acceptable for this release.

## Evidence and limits

Official behavior is source-audited against pinned primary sources; the official
apps were not booted for a full cross-framework browser comparison. Local probes
compiled actual Solid JSX and adapter source and ran in Chromium. Their 24
observations were repeated with an in-memory official-navigation-pattern control.
The observational runner's success means capture completed, not that parity passed.

Follow-up verification adds public adapter regressions. Against the preserved
baseline source, six of seven new cases fail and the stock asset control passes.
Before the upgrade, source passed all 28 cases, including the ownership/SSR suite. Two
deliberately wrong implementations are rejected: unowned navigation refresh and
bootstrap-only nonce forwarding. Separate browser probes exercise the real router
with intercepted HTTP/history responses and core-only nonce adoption under CSP.
No claim of full Solid Meta parity or complete cross-framework runtime parity is made.

After the merge and server-head integration, all 37 Chromium/SSR cases pass on
core 3.9.1/Solid 1.9.17. Production/development hydration, Signals, For state,
Suspense, ErrorBoundary recovery, request-local assets and CSP resource hydration
remain covered. Build, source declarations, consumer types and scoped Biome pass.
H07's baseline and deliberately wrong-source controls add contradictory evidence
rather than relying only on tests generated with the implementation.

The resource follow-up brings the passing adapter suite to 38 cases. Independent
limit probes still fail three assertions against installed core/design: nested
resource cache reuse, mixed-quote collection, and equal script adoption under CSP;
the ordinary body and non-CSP script controls pass. The isolated core candidate
passes six of seven probes, leaving only the resource-boundary assertion failing.
Early child evaluation instead produces two hydration mismatches. These expected
failures are recorded separately, not hidden in the passing adapter suite.

Following the narrowed acceptance criteria, four additional scratch browser cases
import the built public package, not adapter source. CSR-only and synchronous
factory SSR → automatic hydration both pass in production/development. The client
uses neither an explicit `page` option nor a custom `setup`/Head provider. Initial
title and keyed metadata remain unique; Signal updates, conditional removal and
earlier-provider restoration produce the expected DOM without browser errors.

The CSR fixture uses Inertia v3's JSON script plus an empty mount element.
An earlier legacy `div[data-page]` fixture failed page lookup, as the pinned
[v3 DOM helper][core-bootstrap-391] and React/Vue bootstraps predict; correcting
the fixture required no adapter runtime change. A resolver is supplied directly
and JSX uses the installed Solid compiler, so this is not a full Vite-plugin or
deployed-backend end-to-end test. The existing 38-case suite remains unchanged.

Pending-work checks also pass for a strict TSX consumer importing the public
package: Signal-valued title/attributes, intrinsic `head-key` tags, Show and For
compile, while an accessor passed directly to `title` is rejected. A package
dry-run includes all runtime entry points and Head declarations, declares parse5
as a runtime dependency, and contains no Meta dependency. Migration instructions
explicitly cover replacing imports and removing the old MetaProvider wrapper.
At that point no new permanent tests were added; the following integration uses
the owner's subsequently merged test suite. Do not commit the current changes
until the owner authorizes it.

### Main test-suite integration (2026-10-16)

The latest `origin/main` testing work is integrated in the working tree. The
merge is intentionally uncommitted, with all conflicts resolved. The checkpoint
stash `head-migration-checkpoint-before-main-test-suite-merge` remains intact.
Main's page cloning and flash synchronization are retained alongside the Head
manager; no additional Head runtime changes were needed for these contracts.

The canonical suite now enables all 13 upstream Head cases, all seven
server-head cases, and the previously skipped SSR title-callback/server-head
checks. Test fixtures import built public exports instead of Meta components.
The first run passed 19/20 Head cases; the remaining difference is intentional
Solid attribute semantics: null and undefined omit `content` rather than becoming
literal strings. The original primitive fixture inputs remain unchanged, and
the expected omission is explicit rather than skipped.

Additional public consumers cover retained Signal state through `For` updates,
provider disposal, both SSR renderers, escaping, and server-head precedence.
The manual and Vite-automatic SSR browser paths now exercise reactive metadata
and conditional provider cleanup after hydration. The automatic test backend
initially put the SSR head array at a JSON placeholder in the body: the raw-HTML
regression found zero matching head tags and two misplaced body tags. Moving
that output to the document head fixes both the raw response and duplicate tags
after hydration, without an adapter workaround.

Executed validation:

| Layer | Passed | Skipped |
| --- | ---: | ---: |
| Full Chromium/native XHR browser suite | 1062 | 55 |
| Manual/automatic SSR and hydration suite | 28 | 10 |
| Browser/server runtime consumers | 21 | 0 |
| Supplemental Head probes | 38 | 0 |

`pnpm test` passed every layer, including all three public/fixture/unit type
checks. Supplemental generic Head types, frozen-lockfile validation, and scoped
source Biome checks also passed. Existing non-Head capability skips remain;
no supported Head failure was skipped. Local validation used Node 26.5.1 and the
available Chromium 1234 executable override with Playwright 1.58.2. This is not
a new Firefox/WebKit, Axios, or pinned-browser/Node-22 matrix run. The remaining
resource-cache caveat and shared-core baseline findings above are unchanged.

Local, ignored artifacts:

- `.amp/in/artifacts/head-adapter-parity-probes.json` and `.log`
- `.amp/in/artifacts/head-adapter-parity-control-probes.json` and `.log`
- `.amp/in/artifacts/head-hardening-validation.log`: earlier preserved-baseline
  failures and rejected mutations, separate from this audit's new findings.
- `.amp/in/artifacts/head-gap-baseline-control.log`: six baseline failures and
  one passing stock-renderer control.
- `.amp/in/artifacts/head-gap-unowned-refresh-control.log` and
  `head-gap-missing-resource-nonce-control.log`: rejected mutations.
- `.amp/in/artifacts/head-nonce-isolation-baseline.log`: configuration race exposed
  before nonce capture moved ahead of component resolution.
- `.amp/in/artifacts/head-gap-validation.log`: current complete regression run.
- `.amp/in/artifacts/head-navigation-probe.json` and `.log`: real-router results.
- `.amp/in/artifacts/head-core-nonce-probe.json`: core-only CSP contrast.
- `.amp/in/artifacts/head-merge-validation.log`: unchanged 28-case suite after merge.
- `.amp/in/artifacts/head-server-head-validation.log`: complete 37-case upgrade run.
- `.amp/in/artifacts/head-server-head-baseline-control.log`: six failures and two
  disabled/omitted passing controls against merged pre-integration source.
- `.amp/in/artifacts/head-server-head-missing-client-visit-control.log` and
  `head-server-head-unowned-refresh-control.log`: rejected implementations.
- `.amp/in/artifacts/head-limit-baseline.log`, `head-limit-candidate.log`, and
  `head-limit-eager.log`: independently reproduced limits and rejected alternative.
- `.amp/in/artifacts/head-limit-resource-*.json`, `head-limit-helper-*.json`,
  `head-limit-quotes-*.json`, and `head-limit-nonce-*.json`: resource fetch counts,
  mixed-quote output, node retention, and changed-nonce/body/attribute controls.
- `.amp/in/artifacts/inertia-head-core-fixes.patch`: unapplied upstream candidate,
  not a change to installed dependencies or the published adapter.
- `.amp/in/artifacts/head-limit-adapter-validation.log`: complete 38-case run.
- `.amp/in/artifacts/head-public-entry-validation.log`: four passing built-package
  automatic-bootstrap/reactivity cases; `head-public-entry-legacy-fixture-control.log`
  preserves the rejected obsolete CSR fixture.
- `.amp/in/artifacts/head-consumer-tsx-validation.log` and
  `head-package-validation.json`: public TSX typecheck and package dry-run results.
- `.amp/in/artifacts/head-before-test-suite-merge.patch`: pre-merge working diff.
- `.amp/in/artifacts/head-upstream-first.log`: the 19/20 upstream Head result
  before explicitly preserving native nullish attributes.
- `.amp/in/artifacts/head-auto-template-red.log`: raw-HTML placement failure
  before correcting the automatic SSR test backend.
- `.amp/in/artifacts/head-main-integration-full.log`: passing canonical test layers.
- `.amp/in/artifacts/head-supplemental-after-main.log`: passing 38-case Head suite.

Temporary probe sources were removed after verification. The main merge and
pre-upgrade gap checkpoint from the earlier core upgrade are local commits.
The latest test-suite merge, server-head runtime, regression, and documentation
updates remain local and uncommitted. Manual approval remains required before push.

[react-head]: https://github.com/inertiajs/inertia/blob/v3.4.0/packages/react/src/Head.ts#L1-L126
[vue-head]: https://github.com/inertiajs/inertia/blob/v3.4.0/packages/vue3/src/head.ts#L1-L162
[react-app]: https://github.com/inertiajs/inertia/blob/v3.4.0/packages/react/src/App.ts#L82-L146
[vue-app]: https://github.com/inertiajs/inertia/blob/v3.4.0/packages/vue3/src/app.ts#L77-L149
[react-ssr]: https://github.com/inertiajs/inertia/blob/v3.4.0/packages/react/src/createInertiaApp.ts#L142-L238
[vue-ssr]: https://github.com/inertiajs/inertia/blob/v3.4.0/packages/vue3/src/createInertiaApp.ts#L131-L240
[svelte-exports]: https://github.com/inertiajs/inertia/blob/v3.4.0/packages/svelte/src/index.ts#L1-L29
[svelte-ssr]: https://github.com/inertiajs/inertia/blob/v3.4.0/packages/svelte/src/createInertiaApp.ts#L109-L194
[core-collect]: https://github.com/inertiajs/inertia/blob/v3.4.0/packages/core/src/head.ts#L65-L155
[core-dom]: https://github.com/inertiajs/inertia/blob/v3.4.0/packages/core/src/head.ts#L1-L62
[core-events]: https://github.com/inertiajs/inertia/blob/v3.4.0/packages/core/src/eventHandler.ts#L29-L70
[core-page]: https://github.com/inertiajs/inertia/blob/v3.4.0/packages/core/src/page.ts#L86-L164
[page-title-change]: https://github.com/inertiajs/inertia/commit/b7bf28886c646b2c7a027615e35a2b50b641d62c
[server-head-change]: https://github.com/inertiajs/inertia/commit/4f12c2aced25720e33ca0aaa5b9335cb348fa0de
[upstream-snapshot]: https://github.com/inertiajs/inertia/tree/c9092cdec38336bfdb11209f5878f472aa4e873e
[upstream-head]: https://github.com/inertiajs/inertia/blob/c9092cdec38336bfdb11209f5878f472aa4e873e/packages/core/src/head.ts#L75-L85
[core-head-391]: https://github.com/inertiajs/inertia/blob/v3.9.1/packages/core/src/head.ts
[core-bootstrap-391]: https://github.com/inertiajs/inertia/blob/v3.9.1/packages/core/src/domUtils.ts#L151-L163
[react-app-391]: https://github.com/inertiajs/inertia/blob/v3.9.1/packages/react/src/App.ts
[vue-app-391]: https://github.com/inertiajs/inertia/blob/v3.9.1/packages/vue3/src/app.ts
[server-head-tests-391]: https://github.com/inertiajs/inertia/blob/v3.9.1/tests/server-head.spec.ts
[solid-asset-injection]: https://github.com/ryansolid/dom-expressions/blob/v0.40.8/packages/dom-expressions/src/server.js#L577-L584
[solid-hydration-generator]: https://github.com/ryansolid/dom-expressions/blob/v0.40.8/packages/dom-expressions/src/server.js#L538-L544
[solid-resource-hydration]: https://github.com/solidjs/solid/blob/v1.9.13/packages/solid/src/reactive/signal.ts#L636-L640
[solid-resource-hydration-1917]: https://github.com/solidjs/solid/blob/25138e1c2a32712ddff683374e1a257b8bf8b5a8/packages/solid/src/reactive/signal.ts
[solid-hydration-boundaries]: https://github.com/ryansolid/dom-expressions/blob/v0.40.8/packages/dom-expressions/src/server.js#L522-L563
[solid-meta-ownership]: https://github.com/solidjs/solid-meta/blob/main/src/index.tsx#L175-L232
[solid-meta-ownership-pinned]: https://github.com/solidjs/solid-meta/blob/391138eefe2d0c48b8c4f2bfe7d7bfd74d6922a0/src/index.tsx
