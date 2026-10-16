import type { Page } from '@inertiajs/core'
import { createInertiaApp } from 'inertia-adapter-solid'
import createServer from 'inertia-adapter-solid/server'
import type { Component } from 'solid-js'
import { renderToStringAsync } from 'solid-js/web'

const pages = import.meta.glob<{ default: Component }>('./Pages/SSR/**/*.tsx', { eager: true })
const renderPage = (page: Page) =>
  createInertiaApp({
    page,
    render: renderToStringAsync,
    resolve: (name) => pages[`./Pages/${name}.tsx`],
    setup: ({ App, props }) => <App {...props} />,
    title: (title, page) => [title, page.props.titleSuffix].filter(Boolean).join(' | '),
    serverHead: true,
    nonce: typeof page.props.nonce === 'string' ? page.props.nonce : undefined,
  })
if (import.meta.env.PROD) createServer(renderPage, 13714)
export default renderPage
