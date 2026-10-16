---
"inertia-adapter-solid": patch
---

Fix persistent component layouts and nested layout arrays to retain shared layout
state across page navigation while keeping page props reactive. Changed layout
subtrees are disposed without remounting unchanged parent layouts, and nested
children retain their provider context during client rendering and SSR.

Fix page updates through transparent layouts and ensure non-preserving visits
reset page state even when multiple visits occur within the same clock tick,
without resetting shared layouts.

Render-function layouts remain deferred; the supported layout API continues to
accept components and arrays of components.
