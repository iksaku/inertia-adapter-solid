---
"inertia-adapter-solid": minor
---

Support layout tuples, object descriptors, named layouts, app-level default
selectors, and props-only default overrides while retaining component state and
fine-grained prop updates. Export layout types and typed `setLayoutProps` and
`resetLayoutProps` helpers for shared and named client-side overrides.

Reset dynamic overrides on non-preserving visits and isolate them from SSR.
Layout render callbacks and page-props callbacks remain unsupported; bare layout
functions continue to be Solid components.
