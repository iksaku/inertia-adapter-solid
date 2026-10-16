# Inertia Adapter for SolidJS

A SolidJS adapter for Inertia.js, tracking the official React/Vue adapters' API surface and behavior, adapted to SolidJS's reactivity model.

## Language

**Head**:
The adapter-owned component for declaring a page's title and document head elements, mirroring the official Inertia adapters.
_Avoid_: MetaProvider, meta tags component

**head-key**:
The attribute placed on a `<Head>` child to give it a stable dedup identity. A later declaration with the same identity overrides an earlier one.
_Avoid_: data-inertia (user-facing), key

**Head manager**:
The authority that combines Head declarations and resolves duplicate identities for one client app or server response.
_Avoid_: MetaProvider, meta context

**Page**:
The current Inertia page object (component name, props, url) exposed through `usePage()`.
_Avoid_: Route, view

**Persistent layout**:
A layout component declared via a page's static `layout` property that survives navigation between pages using it.
_Avoid_: Nested layout
