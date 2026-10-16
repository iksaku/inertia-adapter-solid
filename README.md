# Inertia SolidJS Adapter

An adapter to bring [SolidJS](https://www.solidjs.com) compatibility to systems using [InertiaJS](https://inertiajs.com/).

> [!Important]
> This version of the adapter is compatible with Inertia.js v3.x.
> If you are using Inertia.js v2.x, please use an earlier version of this adapter.

# Installation

```sh
# Using NPM
npm install -D solid-js vite-plugin-solid @solidjs/meta inertia-adapter-solid

# Using Yarn
yarn add -D solid-js vite-plugin-solid @solidjs/meta inertia-adapter-solid

# Using PNPM
pnpm add -D solid-js vite-plugin-solid @solidjs/meta inertia-adapter-solid
```

## Setup Vite

In your `vite.config.js` file, you will need to add the SolidJS plugin if not done already.
You will also need to register the Solid framework configuration with Inertia's Vite plugin.

```diff
  import { defineConfig } from 'vite'
+ import solid from 'vite-plugin-solid'
+ import inertiaSolidFramework from 'inertia-adapter-solid/vite'

  export default defineConfig({
    plugins: [
      laravel({
        input: ['resources/js/app.jsx'],
        refresh: true,
      }),
+     solid({ ssr: true }),
+     inertia({
+       frameworks: inertiaSolidFramework,
+     })
      // ...
    ]
  })
```

When adding the Solid Framework configuration for Inertia,
the Inertia Vite plugin will automatically handle:
* Component resolution
* [Server-Side rendering](#server-side-rendering-ssr)

## Initialize the Inertia app

Next, update your main JavaScript file to boot your Inertia app.

```jsx
import { createInertiaApp } from 'inertia-adapter-solid'

createInertiaApp()
```

> [!TIP]
> You can also customize Inertia's configuration like other official adapters.
> 
> Learn more at the official [Client-Side Setup](https://inertiajs.com/docs/v3/installation/client-side-setup)
> documentation.

### Manual Setup

If you prefer not to use the Vite plugin,
you may provide the `resolve` and `setup` callbacks manually.
The `resolve` callback tells Inertia how to load a page
component and receives the component name and the full
[page object](https://inertiajs.com/docs/v3/core-concepts/the-protocol).
The `setup` callback initializes the client-side framework.

```jsx
import { createInertiaApp } from 'inertia-adapter-solid'
import { render } from 'solid-js/web'

createInertiaApp({
  resolve(name) {
    const pages = import.meta.glob('./Pages/**/*.jsx')
    return pages[`./Pages/${name}.jsx`]()
  },
  setup({ el, App, props }) {
    render(() => <App {...props} />, el)
  },
})
```

## Pages

Inertia pages are simply SolidJS components, you will feel right at home.

```jsx
import Layout from './Layout'
import { Title } from '@solidjs/meta'

export default function Welcome(props) {
  return (
    <Layout>
        <Title>Welcome</Title>
        <h1>Welcome</h1>
        <p>Hello {props.user.name}, welcome to your first Inertia app!</p>
    </Layout>
  )
}
```

> [!TIP]
> Learn more at the official [Pages](https://inertiajs.com/docs/v3/the-basics/pages)
> documentation.

> [!IMPORTANT]
> Remember that
> [destructuring props](https://docs.solidjs.com/concepts/components/props#destructuring-props)
> breaks SolidJS reactivity!

### Creating Layouts

A layout is a standard component that accepts child content.
There is nothing Inertia-specific about it.

```jsx
import { Link } from 'inertia-adapter-solid'

export default function Layout(props) {
  return (
    <main>
      <header>
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </header>
      <article>{props.children}</article>
    </main>
  )
}
```

You may use a layout by wrapping your page content with it directly.
However, this approach forces the layout instance to be destroyed
and recreated between visits.

```jsx
import Layout from './Layout'

export default function Welcome(props) {
  return (
    <Layout>
      <h1>Welcome</h1>
      <p>Hello {props.user.name}, welcome to your first Inertia app!</p>
    </Layout>
  )
}
```

### Persistent Layouts

Wrapping a page with a layout as a child component works,
but it means the layout is destroyed and recreated on every
visit.
This prevents maintaining layout state across navigations,
such as an audio player that should keep playing or a sidebar
that should retain its scroll position.
Persistent layouts solve this by telling Inertia which layout
to use for a page. Inertia then manages the layout instance
separately, keeping it alive between visits.

```jsx
import Layout from './Layout'
import { Title } from '@solidjs/meta'

export default function Welcome(props) {
  return (
    <>
        <Title>Welcome</Title>
        <h1>Welcome</h1>
        <p>Hello {props.user.name}, welcome to your first Inertia app!</p>
    </>
  )
}

Welcome.layout = Layout
```

Alternatively, you can also stack multiple layouts on top of each other.

```jsx
import SiteLayout from './SiteLayout'
import NestedLayout from './NestedLayout'
import { Title } from '@solidjs/meta'

export default function Welcome(props) {
  return (
    <>
        <Title>Welcome</Title>
        <h1>Welcome</h1>
        <p>Hello {props.user.name}, welcome to your first Inertia app!</p>
    </>
  )
}

Welcome.layout = [SiteLayout, NestedLayout]
```

Layouts are matched by component identity at each depth, starting with the
outermost layout. Navigating from `[SiteLayout, ProfileLayout]` to
`[SiteLayout, SettingsLayout]` keeps `SiteLayout` and replaces the inner layout
and page. Replacing the outer layout also replaces all its descendants;
removed layouts are disposed, not cached for later visits.

Layouts receive reactive page props. Read `props.title` or `usePage().props.title`
inside JSX or a reactive computation; do not destructure them or copy their
values during component initialization. A props update does not rerun a
retained layout's component body. `preserveState` controls the page's local
state, not the shared layouts: a different page component always mounts anew,
and a non-preserving visit remounts even the same page component.

For a custom arrangement, define a shared wrapper component and assign that
same component to every page that should share its state.

```jsx
// SharedLayout.jsx
import SiteLayout from './SiteLayout'
import NestedLayout from './NestedLayout'

export default function SharedLayout(props) {
  return (
    <SiteLayout title={props.title}>
      <NestedLayout>{props.children}</NestedLayout>
    </SiteLayout>
  )
}
```

```jsx
// Welcome.jsx (use the same assignment on other pages)
import SharedLayout from './SharedLayout'

export default function Welcome(props) {
  return <h1>Hello {props.user.name}</h1>
}

Welcome.layout = SharedLayout
```

**This adapter treats a layout function as a Solid component, not a render callback.** Separate
`PageA.layout = (props) => ...` and `PageB.layout = (props) => ...` functions
have different identities even when their JSX looks identical. Their layouts
remount on navigation. Prefer component arrays when individual layout depths
need to persist independently; a shared wrapper is one opaque layout boundary.

Layout render callbacks and page-props callbacks assigned to `Page.layout` are
not supported. Bare functions always mean components. Both callback formats
remain supported by Inertia's official adapters and are not deprecated upstream.

### Layout props and named layouts

Pass static props with a tuple or an object descriptor. Both forms can be nested.

```jsx
Welcome.layout = [SiteLayout, { title: 'Welcome' }]

// Equivalent object syntax
Welcome.layout = { component: SiteLayout, props: { title: 'Welcome' } }

// Nested layouts, outermost first
Welcome.layout = [
  [SiteLayout, { title: 'Welcome' }],
  { component: NestedLayout, props: { padding: 'lg' } },
]
```

Use a named object to target individual layouts with dynamic overrides. Nonempty
names select props; component identity at each depth still determines persistence.

```jsx
Welcome.layout = {
  app: [SiteLayout, { title: 'Welcome' }],
  content: [NestedLayout, { padding: 'lg' }],
}
```

```jsx
import { resetLayoutProps, setLayoutProps } from 'inertia-adapter-solid'

// Shared by every layout
setLayoutProps({ title: 'Updated title' })

// Only the layout named "content"
setLayoutProps('content', { padding: 'sm' })

// Remove all shared and named dynamic overrides
resetLayoutProps()
```

Updates shallow-merge with existing dynamic overrides and publish together in a
microtask; resets take effect immediately. Effective props are resolved from
lowest to highest priority: page props, descriptor props,
props-only default overrides, shared dynamic overrides, then named dynamic
overrides. `children` always belongs to the renderer. An explicit `undefined`
overrides lower-priority values, allowing the layout's own defaults to apply.

Dynamic overrides reset on a non-preserving navigation and survive when
`preserveState` is enabled. Resetting props does not reset layout component
state. Setters are client-only and do nothing during SSR; use static props or
the default-layout selector for server-rendered data. Overrides made during
hydration apply after that hydration pass, preserving the initial server markup.
Read props reactively, and use `createEffect` when a setter depends on changing
signals or page props.

### Default layouts

The `layout` option selects defaults from the page name and full page object.
Unlike `Page.layout`, this option explicitly accepts a selector function.
Configure it in both client and server entrypoints when using manual SSR setup.

```jsx
createInertiaApp({
  layout: (name, page) => name.startsWith('Public/')
    ? null
    : [SiteLayout, { title: page.props.title }],
  // resolve/setup, if not supplied by the Vite plugin
})

// Use the default layout(s), overriding their static props
Welcome.layout = { title: 'Welcome', showSidebar: false }

// Explicitly opt out of default layouts
Login.layout = [] // false also opts out; null/undefined inherit defaults
```

An explicit page layout replaces the defaults rather than appending to them.
Props-only overrides apply to every default layout. Following Inertia's
normalization, an empty object means no layouts; an object containing only
component-like values (including functions) means named layouts. Put
function-valued props inside an explicit descriptor's `props` object to avoid
that ambiguity.

TypeScript consumers can use the exported `InertiaComponent`, `InertiaLayout`,
and `InertiaLayoutComponent` types. Configure `InertiaConfig.layoutProps` and
`InertiaConfig.namedLayoutProps` in `@inertiajs/core` to type dynamic setters,
or supply an explicit type argument at the call site:

```tsx
setLayoutProps<{ title: string }>({ title: 'Updated title' })
setLayoutProps<{ padding: number }>('content', { padding: 16 })
```

> [!TIP]
> Learn more at the official [Layouts](https://inertiajs.com/docs/v3/the-basics/layouts)
> documentation.

## Title & Metadata

This adapter brings compatibility to Meta-tags using [`@solidjs/meta`](https://github.com/solidjs/solid-meta)
official package, working in both Client-side Rendering and [Server-side Rendering](#server-side-rendering-ssr).

```jsx
import { Title, Meta } from '@solidjs/meta'

export default function Page() {
  return (
    <>
      <Title>Your page title</Title>
      <Meta name="description" content="Your page description" />
    </>
  )
}
```

## Browser-only content

Use `<WhenMounted>` for content that requires browser APIs. It renders the
fallback during SSR and initial hydration, then renders its children after
mounting. On ordinary client renders and subsequent navigation, children render
immediately.

```jsx
import { WhenMounted } from 'inertia-adapter-solid'

<WhenMounted fallback={<div>Loading chart...</div>}>
  <BrowserOnlyChart />
</WhenMounted>
```

## Polling status

`usePoll` exposes a reactive `polling` property alongside `start()` and `stop()`.
Read it from the returned object rather than destructuring it, to preserve
Solid's reactivity. The `background` option accepts `'throttle'` (default),
`'pause'`, or `'continue'`; prefer `'continue'` over the deprecated `keepAlive`.

```jsx
import { usePoll } from 'inertia-adapter-solid'

const poll = usePoll(5000, {}, { background: 'pause' })

<button onClick={() => (poll.polling ? poll.stop() : poll.start())}>
  {poll.polling ? 'Pause polling' : 'Resume polling'}
</button>
```

# AI Guidelines (Laravel Boost)

This package ships AI guidelines and an `inertia-solid-development` skill for
[Laravel Boost](https://laravel.com/docs/boost), mirroring the official Inertia
adapters. When you run `php artisan boost:install` (or `boost:update --discover`)
in a Laravel project that has this package installed, Boost detects them
automatically and offers to install them — no extra setup required.

The guidelines teach AI coding agents how to use this adapter with SolidJS best
practices: pages and persistent layouts, `<Link>`, `<Form>`, `useForm` (including
Precognition), `useHttp`, deferred props, polling, prefetching, and the SolidJS
reactivity rules that apply to all of them.

# Configuring Typescript

While this library is Typescript-ready, your bundler may complain as it tries to compile TSX components
with React in mind... But we're not using React, we're using SolidJS!

Actually, the fix is really simple. Add the following to your `tsconfig.json` file:
```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "solid-js"
  }
}
```

> [!TIP]
> Learn more at the official [Typescript](https://inertiajs.com/docs/v3/advanced/typescript)
> documentation.

# Server-side Rendering (SSR)

Server-side rendering pre-renders your JavaScript pages on the server,
allowing your visitors to receive fully rendered HTML when they visit
your application.
Since fully rendered HTML is served by your application, it’s also
easier for search engines to index your site.

Server-side rendering uses Node.js to render your pages in a background
process; therefore, Node must be available on your server for
server-side rendering to function properly.
Inertia’s SSR server requires Node.js 22 or higher.

## Update build script

Update the `build` script in your `package.json` to build both bundles.

```diff
  "scripts" {
      "dev": "vite",
-     "build": "vite build"
+     "build": "vite build && vite build --ssr"
  }
```

> [!TIP]
> Learn more at the official [Server-Side Rendering](https://inertiajs.com/docs/v3/advanced/server-side-rendering)
> documentation.

## SSR Manual Setup

The Vite plugin reuses your app.js entry point for SSR by default,
so no separate file is needed.

For more control, such as providing a [manual setup callback](#manual-setup),
you may create a separate `resources/js/ssr.jsx` entry point and
update your `app.jsx` to use [client-side hydration](#client-side-hydration).

### SSR Entrypoint

```jsx
import { createInertiaApp } from 'inertia-adapter-solid'
import createServer from 'inertia-adapter-solid/server'
import { renderToString } from 'solid-js/web'

createServer((page) =>
  createInertiaApp({
    page,
    render: renderToString,
    resolve(name) {
      const pages = import.meta.glob('./Pages/**/*.jsx')
      return pages[`./Pages/${name}.jsx`]()
    },
    setup: ({ App, props }) => <App {...props} />,
  }),
)
```

Be sure to add anything that’s missing from your `app.js` file that
makes sense to run in SSR mode, such as plugins or custom mixins.

For a manual SSR entry point, pass Solid's renderer through the `render` option.
The example above uses synchronous `renderToString`; you can pass
`renderToStringAsync` when your app needs asynchronous SSR:
```js
import { createInertiaApp } from 'inertia-adapter-solid'
import createServer from 'inertia-adapter-solid/server'
import { renderToStringAsync } from 'solid-js/web'

createServer((page) =>
  createInertiaApp({
    // ...
    render: renderToStringAsync,
  }),
)
```

### Client-side Hydration

You should also update your app.js to use hydration instead of normal
rendering.
This allows Solid to pick up the server-rendered HTML and make it
interactive without re-rendering it.

```diff
  import { createInertiaApp } from 'inertia-adapter-solid'
- import { render } from 'solid-js/web'
+ import { hydrate } from 'solid-js/web'

  createInertiaApp({
    resolve(name) {
      const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
      return pages[`./Pages/${name}.jsx`]
    },
    setup({ el, App, props }) {
-     render(() => <App {...props} />, el)
+     hydrate(() => <App {...props} />, el)
    },
  })
```

## Next steps

You can read the full documentation on Server-side Rendering on [InertiaJS's Official Guide](https://inertiajs.com/docs/v3).

## Testing

Run `pnpm test` for public type checks, Solid runtime tests, the official Inertia
browser suite port, and SSR/hydration tests. See [the testing guide](tests/README.md)
for browser installation, focused commands, coverage, and known baseline failures.
