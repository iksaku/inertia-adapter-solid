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

You can also create more complex layout arrangements using nested layouts.

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

createServer((page) =>
  createInertiaApp({
    page,
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

By default, we use the [`renderToString`](https://docs.solidjs.com/reference/rendering/render-to-string) function for SSR,
but you may also pass a custom renderer to the `render` option:
```js
import { createInertiaApp } from 'inertia-adapter-solid'
import createServer from 'inertia-adapter-solid/server'
import { renderToStringAsync } from 'solid-js/web'

createServer((page) =>
  createInertiaApp({
    // ...
    render: renderToStringAsync
  }),
)
```

### Client-side Hydration

You should also update your app.js to use hydration instead of normal
rendering.
This allows React to pick up the server-rendered HTML and make it
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
