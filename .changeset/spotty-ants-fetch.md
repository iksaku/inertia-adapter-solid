---
"inertia-adapter-solid": patch
---

Fix adapter behavior uncovered by the Inertia 3.9.1 conformance suite:

- Fix `InfiniteScroll` initialization and JSX typing, directional slot priority,
  server-rendered pagination flags, and child identity during pagination.
- Forward `Link` HTTP exception, network error, and flash callbacks, and expose
  the native `data-loading` attribute while requests are in flight.
- Synchronize programmatic flash updates with reactive page state, preserve
  deferred-prop metadata during page reconciliation, and support nested
  `Deferred` prop paths.
- Correct factory-based data initialization in `useForm` and `useHttp`, reject
  manual defaults overrides for factory-based forms, and keep HTTP responses
  reactive.
- Normalize reactive `Form` methods and reset Precognition state alongside
  native form fields.
- Preserve reactive Precognition validation status, initialize legacy endpoint
  constructors, and honor global validation error defaults.
- Preserve configured shared page prop types in `usePage`.

Add upstream-derived browser, SSR, hydration, runtime, and public TypeScript
conformance tests, with Chromium, Firefox, and WebKit CI coverage.
