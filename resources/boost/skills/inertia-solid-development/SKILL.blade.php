---
name: inertia-solid-development
description: "Develops Inertia.js v3 SolidJS client-side applications. Activates when creating SolidJS pages, forms, navigation, or app providers; using <Link>, <Form>, useForm, useHttp, usePage, useRemember, useFormContext, or router; or working with deferred props, prefetching, optimistic updates, instant visits, polling, or browser-only content with WhenMounted."
license: MIT
metadata:
  author: iksaku
---
@php
/** @var \Laravel\Boost\Install\GuidelineAssist $assist */
@endphp
# Inertia SolidJS Development

## When to Apply

Activate this skill when:

- Creating or modifying SolidJS page components for Inertia
- Working with forms in SolidJS (using `<Form>`, `useForm`, or `useHttp`)
- Implementing client-side navigation with `<Link>` or `router`
- Using v3 features: deferred props, prefetching, optimistic updates, instant visits, HTTP requests, WhenMounted, WhenVisible, InfiniteScroll, once props, flash data, or polling
- Wrapping the app with providers or remembering local state across visits
- Building SolidJS-specific features with the Inertia protocol

## Documentation

Use `search-docs` for detailed Inertia v3 patterns and documentation. The official Inertia documentation demonstrates React, Vue, and Svelte - this package (`inertia-adapter-solid`) mirrors that API for SolidJS, with these differences:

- Import everything from `inertia-adapter-solid` (not `@inertiajs/react`, `@inertiajs/vue3`, or `@inertiajs/svelte`).
- There is a `<Head>` component, exported from `inertia-adapter-solid`, mirroring the official adapters. Pass a `title` prop or intrinsic children (`<title>`, `<meta>`, `<link>`); deduplicate tags with the `head-key` attribute. `@solidjs/meta` is not used - the app is no longer wrapped in a `MetaProvider`.
- Persistent layouts are assigned via a static property: `Page.layout = Layout` (or an array of layouts).
- SolidJS reactivity rules apply everywhere: component bodies run once, and destructuring props, `usePage()`, or `useForm()` results breaks reactivity.
- Layout props (`setLayoutProps` / `useLayoutProps`) are not supported by this adapter.

## Basic Usage

### App Providers

Use `withApp` with automatic app setup to wrap the app in providers. The callback receives a Solid component function: render it as `<App />` and return JSX. Its second argument contains `{ ssr }`. When providing a manual `setup` callback, wrap `<App {...props} />` there instead.

@verbatim
@boostsnippet("App Providers with withApp", "jsx")
import { createInertiaApp } from 'inertia-adapter-solid'
import ThemeProvider from './ThemeProvider'

createInertiaApp({
    withApp(App) {
        return (
            <ThemeProvider>
                <App />
            </ThemeProvider>
        )
    },
})
@endboostsnippet
@endverbatim

### Page Components Location

SolidJS page components should be placed in the `{{ $assist->inertia()->pagesDirectory() }}` directory.

### Page Component Structure

Page components receive page props as a single `props` object. Access properties inline - never destructure `props`, as that breaks SolidJS reactivity.

@verbatim
@boostsnippet("Basic SolidJS Page Component", "jsx")
import { Head } from 'inertia-adapter-solid'
import { For } from 'solid-js'

export default function UsersIndex(props) {
    return (
        <div>
            <Head title="Users" />
            <h1>Users</h1>
            <ul>
                <For each={props.users}>
                    {(user) => <li>{user.name}</li>}
                </For>
            </ul>
        </div>
    )
}
@endboostsnippet
@endverbatim

### Accessing Shared Page Props

Use `usePage()` to access shared props anywhere under the Inertia `<App>`. The returned page object is a reactive store - do not destructure it.

@verbatim
@boostsnippet("Shared Props with usePage", "jsx")
import { usePage } from 'inertia-adapter-solid'

export default function Layout(props) {
    const page = usePage()

    return (
        <header>
            <span>{page.props.auth.user.name}</span>
            <main>{props.children}</main>
        </header>
    )
}
@endboostsnippet
@endverbatim

### Remembering Local State

`useRemember(initialState, key)` returns a Solid signal pair: `[accessor, setter]`. Call the accessor to read the current value. Use a stable, unique key for each remembered component instance; Inertia restores the state during browser history navigation.

@verbatim
@boostsnippet("Remembered Search Input", "jsx")
import { useRemember } from 'inertia-adapter-solid'

export default function UsersIndex() {
    const [query, setQuery] = useRemember('', 'UsersIndex:query')

    return (
        <input
            value={query()}
            onInput={(e) => setQuery(e.currentTarget.value)}
        />
    )
}
@endboostsnippet
@endverbatim

### Page Titles and Metadata

@verbatim
@boostsnippet("Page Title and Meta Tags", "jsx")
import { Head } from 'inertia-adapter-solid'

export default function Welcome() {
    return (
        <>
            <Head title="Welcome">
                <meta head-key="description" name="description" content="Your page description" />
            </Head>
            <h1>Welcome</h1>
        </>
    )
}
@endboostsnippet
@endverbatim

## Client-Side Navigation

### Basic Link Component

Use `<Link>` for client-side navigation instead of traditional `<a>` tags:

@verbatim
@boostsnippet("Inertia SolidJS Navigation", "jsx")
import { Link, router } from 'inertia-adapter-solid'

<Link href="/">Home</Link>
<Link href="/users">Users</Link>
<Link href={`/users/${user.id}`}>View User</Link>
@endboostsnippet
@endverbatim

### Link with Method

@verbatim
@boostsnippet("Link with POST Method", "jsx")
import { Link } from 'inertia-adapter-solid'

<Link href="/logout" method="post" as="button">
    Logout
</Link>
@endboostsnippet
@endverbatim

### Prefetching

Prefetch pages to improve perceived performance:

@verbatim
@boostsnippet("Prefetch on Hover", "jsx")
import { Link } from 'inertia-adapter-solid'

<Link href="/users" prefetch>
    Users
</Link>
@endboostsnippet
@endverbatim

### Programmatic Navigation

@verbatim
@boostsnippet("Router Visit", "jsx")
import { router } from 'inertia-adapter-solid'

function handleClick() {
    router.visit('/users')
}

// Or with options
function createUser() {
    router.visit('/users', {
        method: 'post',
        data: { name: 'John' },
        onSuccess: () => console.log('Success!'),
    })
}
@endboostsnippet
@endverbatim

## Form Handling

### Form Component (Recommended)

The recommended way to build forms is with the `<Form>` component. Its children may be a slot function receiving form state - access properties inline, as the slot props are getter-based and destructuring them breaks reactivity.

@verbatim
@boostsnippet("Form Component Example", "jsx")
import { Form } from 'inertia-adapter-solid'
import { Show } from 'solid-js'

export default function CreateUser() {
    return (
        <Form action="/users" method="post">
            {(form) => (
                <>
                    <input type="text" name="name" />
                    <Show when={form.errors.name}>
                        <div>{form.errors.name}</div>
                    </Show>

                    <input type="email" name="email" />
                    <Show when={form.errors.email}>
                        <div>{form.errors.email}</div>
                    </Show>

                    <button type="submit" disabled={form.processing}>
                        {form.processing ? 'Creating...' : 'Create User'}
                    </button>

                    <Show when={form.wasSuccessful}>
                        <div>User created!</div>
                    </Show>
                </>
            )}
        </Form>
    )
}
@endboostsnippet
@endverbatim

### Form Component Cancellation

Call `form.cancel()` to cancel the active submission. `cancelOnUnmount` opts into canceling it when the component unmounts; it defaults to `false`.

@verbatim
@boostsnippet("Cancelable Form Component", "jsx")
import { Form } from 'inertia-adapter-solid'

<Form action="/users" method="post" cancelOnUnmount>
    {(form) => (
        <>
            <input type="text" name="name" />
            <button type="submit" disabled={form.processing}>
                {form.processing ? 'Saving...' : 'Save'}
            </button>
            <button type="button" disabled={!form.processing} onClick={() => form.cancel()}>
                Cancel
            </button>
        </>
    )}
</Form>
@endboostsnippet
@endverbatim

Available slot props: `errors`, `hasErrors`, `processing`, `progress`, `wasSuccessful`, `recentlySuccessful`, `isDirty`, `clearErrors`, `resetAndClearErrors`, `setError`, `reset`, `submit`, `cancel`, `defaults`, `validating`, `valid`, `invalid`, `validate`, `touch`, and `touched`.

The component also accepts `onHttpException`, `onNetworkError`, and `onFlash` callbacks. Use the official forms and events documentation for their payloads and behavior.

### Form Refs and Context

The `<Form>` `ref` prop is a callback receiving the exposed form API, not the HTML form element. For example, `ref={(form) => { formRef = form }}` captures the API for later calls such as `formRef.submit()` or `formRef.cancel()`.

Call `useFormContext()` inside a descendant component to access the same API without passing slot props through each component. It returns `undefined` outside a `<Form>`.

@verbatim
@boostsnippet("Form Context in a Child Component", "jsx")
import { Form, useFormContext } from 'inertia-adapter-solid'

function CancelButton() {
    const form = useFormContext()

    return (
        <button type="button" disabled={!form?.processing} onClick={() => form?.cancel()}>
            Cancel
        </button>
    )
}

export default function CreateUser() {
    return (
        <Form action="/users" method="post">
            <input type="text" name="name" />
            <button type="submit">Save</button>
            <CancelButton />
        </Form>
    )
}
@endboostsnippet
@endverbatim

### Form Component Reset Props

The `<Form>` component supports automatic resetting:

- `resetOnError` - Reset form data when the request fails
- `resetOnSuccess` - Reset form data when the request succeeds
- `setDefaultsOnSuccess` - Update default values on success

Use the `search-docs` tool with a query of `form component resetting` for detailed guidance.

@verbatim
@boostsnippet("Form with Reset Props", "jsx")
import { Form } from 'inertia-adapter-solid'
import { Show } from 'solid-js'

<Form
    action="/users"
    method="post"
    resetOnSuccess
    setDefaultsOnSuccess
>
    {(form) => (
        <>
            <input type="text" name="name" />
            <Show when={form.errors.name}>
                <div>{form.errors.name}</div>
            </Show>

            <button type="submit" disabled={form.processing}>
                Submit
            </button>
        </>
    )}
</Form>
@endboostsnippet
@endverbatim

### `useForm` Helper

For more programmatic control or to follow existing conventions, use the `useForm` helper. It returns a single form object with getter-based state and a reactive `data` store - always access it as `form.data.name`, never destructure.

@verbatim
@boostsnippet("useForm Helper Example", "jsx")
import { useForm } from 'inertia-adapter-solid'
import { Show } from 'solid-js'

export default function CreateUser() {
    const form = useForm({
        name: '',
        email: '',
        password: '',
    })

    function submit(e) {
        e.preventDefault()
        form.post('/users', {
            onSuccess: () => form.reset('password'),
        })
    }

    return (
        <form onSubmit={submit}>
            <input
                type="text"
                value={form.data.name}
                onInput={(e) => form.setData('name', e.currentTarget.value)}
            />
            <Show when={form.errors.name}>
                <div>{form.errors.name}</div>
            </Show>

            <input
                type="email"
                value={form.data.email}
                onInput={(e) => form.setData('email', e.currentTarget.value)}
            />
            <Show when={form.errors.email}>
                <div>{form.errors.email}</div>
            </Show>

            <input
                type="password"
                value={form.data.password}
                onInput={(e) => form.setData('password', e.currentTarget.value)}
            />
            <Show when={form.errors.password}>
                <div>{form.errors.password}</div>
            </Show>

            <button type="submit" disabled={form.processing}>
                Create User
            </button>
        </form>
    )
}
@endboostsnippet
@endverbatim

### Precognition

`useForm` supports Laravel Precognition for live server-side validation. Pass the HTTP method and URL directly to `useForm()` to get a precognitive form, then validate fields on blur. (Forms created from data alone can be upgraded later via `.withPrecognition()`.)

@verbatim
@boostsnippet("Precognitive Form Example", "jsx")
import { useForm } from 'inertia-adapter-solid'
import { Show } from 'solid-js'

export default function CreateUser() {
    const form = useForm('post', '/users', {
        name: '',
        email: '',
    })

    return (
        <form onSubmit={(e) => {
            e.preventDefault()
            form.submit()
        }}>
            <input
                type="text"
                value={form.data.name}
                onInput={(e) => form.setData('name', e.currentTarget.value)}
                onBlur={() => form.validate('name')}
            />
            <Show when={form.invalid('name')}>
                <div>{form.errors.name}</div>
            </Show>

            <button type="submit" disabled={form.processing || form.validating}>
                Create User
            </button>
        </form>
    )
}
@endboostsnippet
@endverbatim

## Inertia v3 Features

### HTTP Requests

Use the `useHttp` helper for standalone HTTP requests that do not trigger Inertia page visits. It provides the same developer experience as `useForm`, but for plain JSON endpoints.

@verbatim
@boostsnippet("useHttp Example", "jsx")
import { useHttp } from 'inertia-adapter-solid'
import { Show } from 'solid-js'

export default function Search() {
    const form = useHttp({
        query: '',
    })

    function search(e) {
        form.setData('query', e.currentTarget.value)
        form.get('/api/search', {
            onSuccess: (response) => {
                console.log(response)
            },
        })
    }

    return (
        <>
            <input value={form.data.query} onInput={search} />
            <Show when={form.processing}>
                <div>Searching...</div>
            </Show>
        </>
    )
}
@endboostsnippet
@endverbatim

### Optimistic Updates

Apply data changes instantly before the server responds, with automatic rollback on failure:

@verbatim
@boostsnippet("Optimistic Update with Router", "jsx")
import { router } from 'inertia-adapter-solid'

function like(post) {
    router.optimistic((props) => ({
        post: {
            ...props.post,
            likes: props.post.likes + 1,
        },
    })).post(`/posts/${post.id}/like`)
}
@endboostsnippet
@endverbatim

Optimistic updates also work with `useForm` and the `<Form>` component:

@verbatim
@boostsnippet("Optimistic Update with Form Component", "jsx")
import { Form } from 'inertia-adapter-solid'

<Form
    action="/todos"
    method="post"
    optimistic={(props, data) => ({
        todos: [...props.todos, { id: Date.now(), name: data.name, done: false }],
    })}
>
    <input type="text" name="name" />
    <button type="submit">Add Todo</button>
</Form>
@endboostsnippet
@endverbatim

### Instant Visits

Navigate to a new page immediately without waiting for the server response. The target component renders right away with shared props, while page-specific props load in the background.

@verbatim
@boostsnippet("Instant Visit with Link", "jsx")
import { Link } from 'inertia-adapter-solid'

<Link href="/dashboard" component="Dashboard">Dashboard</Link>

<Link
    href="/posts/1"
    component="Posts/Show"
    pageProps={{ post: { id: 1, title: 'My Post' } }}
>
    View Post
</Link>
@endboostsnippet
@endverbatim

### Deferred Props

Use deferred props to load data after the initial page render. Wrap the dependent markup in the `<Deferred>` component with a skeleton `fallback`:

@verbatim
@boostsnippet("Deferred Props with Empty State", "jsx")
import { Deferred } from 'inertia-adapter-solid'
import { For } from 'solid-js'

export default function UsersIndex(props) {
    return (
        <div>
            <h1>Users</h1>
            <Deferred
                data="users"
                fallback={
                    <div class="animate-pulse">
                        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                }
            >
                <ul>
                    <For each={props.users}>
                        {(user) => <li>{user.name}</li>}
                    </For>
                </ul>
            </Deferred>
        </div>
    )
}
@endboostsnippet
@endverbatim

### Polling

Use the `usePoll` helper to automatically refresh data at intervals. It destroys the poll on unmount. Read the reactive `polling` property from the returned object instead of destructuring it; it reflects whether polling is enabled, not whether a request is in flight.

@verbatim
@boostsnippet("Basic Polling", "jsx")
import { usePoll } from 'inertia-adapter-solid'

export default function Dashboard(props) {
    usePoll(5000)

    return (
        <div>
            <h1>Dashboard</h1>
            <div>Active Users: {props.stats.activeUsers}</div>
        </div>
    )
}
@endboostsnippet
@endverbatim

@verbatim
@boostsnippet("Polling With Request Options and Manual Control", "jsx")
import { usePoll } from 'inertia-adapter-solid'

export default function Dashboard(props) {
    const poll = usePoll(5000, {
        only: ['stats'],
        onStart() {
            console.log('Polling request started')
        },
        onFinish() {
            console.log('Polling request finished')
        },
    }, {
        autoStart: false,
        background: 'pause',
    })

    return (
        <div>
            <h1>Dashboard</h1>
            <div>Active Users: {props.stats.activeUsers}</div>
            <button onClick={() => poll.polling ? poll.stop() : poll.start()}>
                {poll.polling ? 'Stop Polling' : 'Start Polling'}
            </button>
        </div>
    )
}
@endboostsnippet
@endverbatim

- `autoStart` (default `true`) - set to `false` to start polling manually via the returned `start()` function
- `background` - `'throttle'` (default) reduces polling in inactive tabs; `'pause'` pauses it while the tab is inactive; `'continue'` keeps the normal interval
- Prefer `background: 'continue'` over the deprecated `keepAlive: true`

### WhenMounted

Wrap browser-only components in `<WhenMounted>`. It renders the fallback during SSR and initial hydration, then renders its children after mounting. Ordinary client renders and subsequent navigation render children immediately. Keep browser API access inside the guarded component; module-scope code still executes during SSR.

@verbatim
@boostsnippet("Browser-Only Content with WhenMounted", "jsx")
import { WhenMounted } from 'inertia-adapter-solid'
import BrowserOnlyChart from './BrowserOnlyChart'

export default function Dashboard() {
    return (
        <WhenMounted fallback={<div>Loading chart...</div>}>
            <BrowserOnlyChart />
        </WhenMounted>
    )
}
@endboostsnippet
@endverbatim

### WhenVisible

Lazy-load a prop when an element scrolls into view. Useful for deferring expensive data that sits below the fold:

@verbatim
@boostsnippet("WhenVisible Example", "jsx")
import { WhenVisible } from 'inertia-adapter-solid'

export default function Dashboard(props) {
    return (
        <div>
            <h1>Dashboard</h1>

            <WhenVisible
                data="stats"
                buffer={200}
                fallback={<div class="animate-pulse">Loading stats...</div>}
            >
                <div>
                    <p>Total Users: {props.stats.total_users}</p>
                    <p>Revenue: {props.stats.revenue}</p>
                </div>
            </WhenVisible>
        </div>
    )
}
@endboostsnippet
@endverbatim

### InfiniteScroll

Automatically load additional pages of paginated data as users scroll:

@verbatim
@boostsnippet("InfiniteScroll Example", "jsx")
import { InfiniteScroll } from 'inertia-adapter-solid'
import { For } from 'solid-js'

export default function Users(props) {
    return (
        <InfiniteScroll data="users">
            <For each={props.users.data}>
                {(user) => <div>{user.name}</div>}
            </For>
        </InfiniteScroll>
    )
}
@endboostsnippet
@endverbatim

The server must use `Inertia::scroll()` to configure the paginated data. Use the `search-docs` tool with a query of `infinite scroll` for detailed guidance on buffers, manual loading, reverse mode, and custom trigger elements.

## Server-Side Patterns

Server-side patterns (`Inertia::render`, props, middleware) are covered in inertia-laravel guidelines. SSR builds are handled by the `@inertiajs/vite` plugin together with the `inertia-adapter-solid/vite` framework configuration - see the `inertia-adapter-solid` README for setup.

## Common Pitfalls

- Destructuring page component props, `usePage()`, `useForm()`, `useHttp()`, or `<Form>` slot props - SolidJS getter/store-based reactivity requires inline property access (`form.data.name`, not `const { data } = form`)
- Using early returns like `if (!props.user) return null` - component bodies run once, so guards never re-evaluate; use `<Show>` instead
- Using `.map()` for dynamic lists - use `<For>` (or `<Index>` for static-length lists) so SolidJS can reuse DOM nodes
- Using `className` or `htmlFor` - SolidJS uses `class` and `for`
- Binding controlled inputs with `onChange` - it fires on blur in SolidJS; use `onInput`
- Reaching for `@solidjs/meta`'s `<Title>`, `<Meta>`, or `<Link>` components - this adapter ships its own `<Head>` component like the official adapters, and `@solidjs/meta` is no longer used
- Recreating persistent layouts the React way (`Page.layout = (page) => <Layout>{page}</Layout>`) - assign the component directly: `Page.layout = Layout` or an array of layouts
- Accessing `props.children` repeatedly inside layouts - resolve it once with the `children()` helper
- Running browser-only code in `createEffect` during SSR - effects never run on the server; use `onMount` or guard with `isServer` from `solid-js/web`
- Using traditional `<a>` links instead of Inertia's `<Link>` component (breaks SPA behavior)
- Forgetting to add loading states (skeleton screens) when using deferred props
- Using `<form>` without preventing default submission (use `<Form>` component or `e.preventDefault()`)
- Using `router.cancel()` instead of `router.cancelAll()` (v3 breaking change)
- Using `router.on('invalid', ...)` or `router.on('exception', ...)` instead of the renamed `httpException` and `networkError` events
