---
"inertia-adapter-solid": minor
---

Upgrade Inertia Core and its Vite plugin to 3.9.1 and align Precognition to 2.1.0.

Raise the SolidJS peer requirement to `^1.9.17` for upstream security and SSR
fixes. Update `@solid-primitives/deep` to 0.3.7 and `@solid-primitives/memo` to
1.5.1 for compatibility with Vite 8's Rolldown bundler.

Add `WhenMounted` for browser-only content and reactive `usePoll().polling` state.
Expose Form cancellation and `cancelOnUnmount`, forward HTTP/network/flash
callbacks, and cancel pending hover prefetches when a Link is followed. Update
the Vite SSR bootstrap to avoid top-level await.

HTTP 422 submissions through `useHttp` now resolve to `undefined` with validation
errors instead of rejecting, matching current Inertia behavior. Submission
return types include `undefined`; other failures still reject.
