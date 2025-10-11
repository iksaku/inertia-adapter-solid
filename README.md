# Inertia SolidJS Adapter

An adapter to bring [SolidJS](https://www.solidjs.com) compatibility to systems using [InertiaJS](https://inertiajs.com/).

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

```diff
  import { defineConfig } from 'vite'
+ import solid from 'vite-plugin-solid'

  export default defineConfig({
      plugins: [
          laravel({
              input: ['resources/css/app.css', 'resources/js/app.js'],
              refresh: true,
          }),
+         solid(),
          // ...
      ]
  })
```

## Initialize the Inertia app

Next, update your main JavaScript file to boot your Inertia app.
To accomplish this, we'll initialize SolidJS with
the base Inertia component.

```jsx
import { createInertiaApp } from 'inertia-adapter-solid'
import { render } from 'solid-js/web'

createInertiaApp({
  resolve(name) {
    const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
    return pages[`./Pages/${name}.jsx`]
  },
  setup({ el, App, props }) {
    render(() => <App {...props} />, el)
  },
})
```

### Defining a root element

By default, Inertia assumes that yoru application's root template has a root element
with an `id` of `app`. If your application's root element has a different `id`, you
can provide it using the `id` property.

```js
createInertiaApp({
  id: 'my-app',
  // ...
})
```

### Code splitting

Vite enables code splitting (or lazy-loading as they call it) by default when using
their `import.meta.glob()` function, so simply omit the `{ eager: true }` option,
or set it to `false`, to disable eager loading.

```diff
- const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
- return pages[`./Pages/${name}.jsx`]
+ const pages = import.meta.glob('./Pages/**/*.jsx')
+ return pages[`./Pages/${name}.jsx`]()
```

## Pages

Inertia pages are simply SolidJS components, you will feel right at home.

```jsx
import Layout from './Layout'
import { Title } from '@solidjs/meta'

export default function Welcome(props) {
  const user = () => props.user

  return (
    <Layout>
        <Title>Welcome</Title>
        <h1>Welcome</h1>
        <p>Hello {user().name}, welcome to your first Inertia app!</p>
    </Layout>
  )
}
```

### Creating Layouts

While not required, for most projects it makes sense to create a site layout that all
of your pages can extend. You may have noticed in our example above that we're wrapping
the page content within a `<Layout>` component. Here's an example of such component:

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

As you can see, this is a typical Solid component.

### Persistent Layouts

While it's simple to implement layouts as children of page components, it forces the
layout instance to be destroyed and recreated between visits. This means that you cannot
have persistent layout state when navigating between pages.

For example, maybe you have an audio player on a podcast website that you want to continue
playinh as users navigate the site. Or, maybe, you simply want to maintain the scroll
position in your sidebar navigation between page visits. In these situations, the solution
is to leverage Inertia's persistent layouts.

```jsx
import Layout from './Layout'
import { Title } from '@solidjs/meta'

export default function Welcome(props) {
  const user = () => props.user

  return (
    <>
        <Title>Welcome</Title>
        <h1>Welcome</h1>
        <p>Hello {user().name}, welcome to your first Inertia app!</p>
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
  const user = () => props.user

  return (
    <>
        <Title>Welcome</Title>
        <h1>Welcome</h1>
        <p>Hello {user().name}, welcome to your first Inertia app!</p>
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
  const user = () => props.user

  return (
    <Layout>
        <Title>Welcome</Title>
        <h1>Welcome</h1>
        <p>Hello {user().name}, welcome to your first Inertia app!</p>
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

# Server-side Rendering (SSR)

Server-side rendering pre-renders your JavaScript pages on the server, allowing your
visitors to receive fully rendered HTML when they visit your application. Since fully
rendered HTML is served by your application, it's also easier for search engines to index
your site.

> **Warning**
> Server-side rendering uses Node.js to render your pages in a background process;
> therefore, Node must be available on your server for server-side rendering to function
> properly.

> **Note**
> For this adapter, no additional dependencies are required.

## Add server entry-point

Create a `resources/js/ssr.js` file whitin your Laravel project that will serve as the SSR
entry point.

```sh
touch resources/js/ssr.js
```

This file is going to look very similar to your `resources/js/app.js` file, except it's not
going to run in the browser, but rather in Node.js. Here's a complete example.

```jsx
import { createInertiaApp } from 'inertia-adapter-solid'
import createServer from 'inertia-adapter-solid/server'

createServer((page) =>
  createInertiaApp({
    page,
    resolve(name) {
      const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
      return pages[`./Pages/${name}.jsx`]
    },
  }),
)
```

## Client-side Hydration

Since your website will now be server-side rendered, you can instruct SolidJS to "hydrate" the
static markup and make it interactive instead of re-rendering all the HTML that we just generated.

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
-         render(() => <App {...props} />, el)
+         hydrate(() => <App {...props} />, el)
      },
  })
```

## Setup Vite

Next, we need to update our Vite configuration to build our new ssr.js file. We can do this
by adding a ssr property to Laravel's Vite plugin configuration in our vite.config.js file.

```diff
  export default defineConfig({
      plugins: [
          laravel({
              input: ['resources/css/app.css', 'resources/js/app.js'],
+             ssr: 'resources/js/ssr.js',
              refresh: true,
          }),
-         solid(),
+         solid({ ssr: true }),
          // ...
      ],
  })
```

## Update build script

Next, let's update the `build` script in our `pacakge.json` file to also build
our new `ssr.js` file.

```diff
  "scripts" {
      "dev": "vite",
-     "build": "vite build"
+     "build": "vite build && vite build --ssr"
  }
```

Now you can build both your client-side and server-side bundles.

```sh
# Using NPM
npm run build

# Using Yarn
yarn build

# Using PNPM
pnpm build
```

## Configure Typescript

While this library is Typescript-ready, your bundler may complain as it tries to compile TSX components
with React in mind... But we're not using React, we're using SolidJS!

Actually, the fix is really simple. Add the following to your `tsconfig.json` file:
```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
  }
}
```

## Next steps

You can read the full documentation on Server-side Rendering on [InertiaJS's Offial Guide](https://inertiajs.com/server-side-rendering).
