# Inertia SolidJS Adapter

An adapter to bring [SolidJS](https://www.solidjs.com) compatibility to systems using [InertiaJS](https://inertiajs.com/).

> [!Important]
> This version of the adapter is compatible with Inertia.js v3.x.
> If you are using Inertia.js v2.x, please use an earlier version of this adapter.

# Installation

```sh
# Using NPM
npm install -D solid-js vite-plugin-solid inertia-adapter-solid

# Using Yarn
yarn add -D solid-js vite-plugin-solid inertia-adapter-solid

# Using PNPM
pnpm add -D solid-js vite-plugin-solid inertia-adapter-solid
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
import { Head } from 'inertia-adapter-solid'

export default function Welcome(props) {
  return (
    <Layout>
        <Head title="Welcome" />
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
import { Head } from 'inertia-adapter-solid'

export default function Welcome(props) {
  return (
    <>
        <Head title="Welcome" />
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
import { Head } from 'inertia-adapter-solid'

export default function Welcome(props) {
  return (
    <>
        <Head title="Welcome" />
        <h1>Welcome</h1>
        <p>Hello {props.user.name}, welcome to your first Inertia app!</p>
    </>
  )
}

Welcome.layout = [SiteLayout, NestedLayout]
```

You can also create more complex layout arrangements using nested layouts.

```jsx
import Layout from './Layout'
import { Head } from 'inertia-adapter-solid'

export default function Welcome(props) {
  return (
    <Layout>
        <Head title="Welcome" />
        <h1>Welcome</h1>
        <p>Hello {props.user.name}, welcome to your first Inertia app!</p>
    </Layout>
  )
}

Welcome.layout = (props) => {
  <SiteLayout title="Welcome">
    <NestedLayout>
      {props.children}
    </NestedLayout>
  </SiteLayout>
}
```

> [!TIP]
> Learn more at the official [Layouts](https://inertiajs.com/docs/v3/the-basics/layouts)
> documentation.

## Title & Metadata

This adapter ships a `Head` component, mirroring the official Inertia
adapters. It manages your page's `<title>` and other elements in the
document's `<head>`, working in both Client-side Rendering and
[Server-side Rendering](#server-side-rendering-ssr).

```jsx
import { Head } from 'inertia-adapter-solid'

export default function Page() {
  return (
    <>
      <Head title="Your page title">
        <meta head-key="description" name="description" content="Your page description" />
      </Head>
      {/* ... */}
    </>
  )
}
```

The `Head` component renders nothing on the page itself; instead, it syncs
its children into the document's `<head>`. It supports plain elements such as
`<title>`, `<meta>`, `<link>`, `<style>`, and `<script>`.

When using the `title` prop, a `<title>` element is added to the document's
`<head>` automatically. You may also pass a `<title>` element as a child
instead:

```jsx
<Head>
  <title>Your page title</title>
</Head>
```

### Head shorthand

When adding multiple `<meta>` elements, you may pass a `head-key` attribute
to each of them. This prevents duplicated elements when navigating between
pages, since elements sharing the same key are replaced rather than
appended.

```jsx
<Head title="Home">
  <meta head-key="description" name="description" content="This is a page specific description" />
  <link head-key="favicon" rel="icon" href="/favicon.svg" />
</Head>
```

Solid control-flow components such as `<Show>` can wrap head elements inside
`<Head>`. Their signal-driven changes are reflected in the document head.
Children retain their Solid owners and signal state, including when `<For>`
adds or reorders elements; they are not rerendered to collect metadata.

Head children are declarative metadata: refs point to detached declarations,
not the installed document-head nodes, and DOM listeners are not transferred.
Do not nest a `<Head>` inside another `<Head>`'s children. Separate Head
instances in a layout and page are supported.

Conflicting titles and `head-key` values follow Inertia's Head-instance
creation order. Updating a signal does not increase that Head's priority.

For metadata that depends on asynchronous resources, `<Suspense>` can wrap
`<Head>` or its children. Use `renderToStringAsync` for SSR to include the
resolved metadata in the response. Wrap `<Head>` itself when its `title`
prop depends on a resource; an inner boundary only surrounds its children:

```jsx
<Suspense>
  <Head title={article()?.title}>
    <meta head-key="description" name="description" content={article()?.description} />
  </Head>
</Suspense>
```

Create resources outside Head's children and read them inside Head, as above.
A helper can keep resource ownership encapsulated by returning `<Head>` itself:

```jsx
import { createResource, Suspense } from 'solid-js'
import { Head } from 'inertia-adapter-solid'

function ArticleHead(props) {
  const [article] = createResource(() => props.id, fetchArticle)

  return (
    <Suspense>
      <Head title={article()?.title}>
        <meta head-key="description" name="description" content={article()?.description} />
      </Head>
    </Suspense>
  )
}

<ArticleHead id={articleId()} />
```

This helper runs during normal Solid hydration, reuses its SSR resource data,
and refetches when its Signal-driven source changes. A resource-owning helper
placed *inside* `<Head>` instead mounts after body hydration and does not
automatically reuse its SSR data; it can fetch again on the client.

If asynchronous rendering creates conflicting Head instances in a different
order on the server and client, their winning values can differ. Prefer a
single Head for resource-dependent metadata that must have one consistent winner.

### Title callback

You can globally modify the page title using the `title` callback option
of `createInertiaApp`. Typically, this lives in your app's main JavaScript
file.

```jsx
createInertiaApp({
  title: (title) => `${title} - My App`,
  // ...
})
```

The callback also receives the current Inertia page as its second argument,
so it can use `page.props` when building a title. Those properties retain the
shared-props type supplied to `createInertiaApp`. Changes to properties read
by the callback update the title even on pages without a `<Head>` component.

The callback receives serialized, HTML-escaped title content. Its return value
is not automatically escaped. Navigation and client-side visits also refresh
the callback for non-reactive inputs such as browser location.

`Head` is fully reactive: signal-driven children update the document's
`<head>` as they change.

> [!TIP]
> Learn more at the official [Title & Meta](https://inertiajs.com/docs/v3/the-basics/title-and-meta)
> documentation.

### Server-provided head

Enable Inertia's server-provided metadata with `serverHead`:

```jsx
createInertiaApp({
  serverHead: true,
  // ...
})
```

`true` reads HTML strings from `page.props.head`. A string selects another prop,
such as `serverHead: 'metadata'`; a callback receives the page and returns an
array of HTML strings, `null`, or `undefined`. Omitted or `false` disables this
feature. This page prop is separate from the SSR response's `{ head, body }`.

Core adds positional identities to tags without `data-inertia`. For stable
identity and component overrides, supply a double-quoted marker on the server:

```html
<meta data-inertia="description" name="description" content="Server description">
```

A component's `<meta head-key="description" ... />` overrides that entry;
removing the component Head restores the current server entry. Core recognizes
single-quoted markers too, but its collection keys do not normalize quote styles.
Use double quotes when matching component keys.

Server metadata participates in CSR, SSR, hydration, navigation, and client-side
visits. An empty or missing head prop clears it on a new page. A partial reload
that omits the prop retains it through Inertia's normal prop merging.
Resolvers run initially and on Inertia navigation/client-visit events; they are
not a separate reactive Solid computation. Use `<Head>` for Signal-driven metadata.

Head strings are not sanitized. Only return trusted HTML and escape dynamic
values when building tags. Explicit script nonces remain necessary under CSP;
core can replace equal nonced scripts during hydration because browser nonce
hiding defeats its node comparison. Do not depend on once-only script adoption
under nonce CSP with this core version.

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

Use `createInertiaApp` for SSR Head collection; rendering the exported `App`
alone does not expose its collected head output. Custom render wrappers must
forward Solid's renderer options, including the configured nonce, and preserve
the internal `<head>` asset boundary until the adapter extracts it. That boundary
is removed from the returned body. For example, a wrapper can call
`renderToStringAsync(root, options)` before postprocessing the returned HTML.

The `nonce` option applies to Solid's generated hydration and resource scripts.
User-authored Head scripts need their own explicit `nonce` attribute. Inertia
core 3.4.0 can replace and reexecute an otherwise equal nonced Head script under
CSP because browser nonce hiding defeats its DOM equality check; do not assume
once-only script adoption under nonce CSP.

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
