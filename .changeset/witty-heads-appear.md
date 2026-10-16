---
"inertia-adapter-solid": major
---

feat: Add `Head` component and `title` option, remove `@solidjs/meta`

BREAKING: `@solidjs/meta` is no longer a peer dependency. The adapter now ships its own `Head` component, mirroring the official Inertia adapters and backed by `@inertiajs/core`'s head manager.

Migration:

- Import `Head` from `inertia-adapter-solid` instead of metadata components from `@solidjs/meta`. After migrating the declarations, remove the old `MetaProvider` wrapper; the adapter supplies its Head manager automatically in CSR and SSR.
- `<Title>Welcome</Title>` → `<Head title="Welcome" />`
- `<Meta name="description" content="..." />` → `<Head><meta head-key="description" name="description" content="..." /></Head>`
- `createInertiaApp` now accepts the official `title` option: `` title: (title) => `${title} — My App` ``
- `createInertiaApp` accepts Inertia's `serverHead` option in CSR and SSR. Enable it with `serverHead: true` to read `page.props.head`, select another prop by name, or supply a resolver callback. Component Head entries override matching server entries; navigation and client-side visits replace or clear the server metadata.
