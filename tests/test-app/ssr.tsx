import { createInertiaApp } from 'inertia-adapter-solid'
import type { Page } from '@inertiajs/core'
import createServer from 'inertia-adapter-solid/server'
import type { Component } from 'solid-js'
import { renderToString } from 'solid-js/web'

const pages = import.meta.glob<{ default: Component }>('./Pages/SSR/**/*.tsx', { eager: true })
const renderPage = (page: Page) => createInertiaApp({
  page,
  render: renderToString,
  resolve: (name) => pages[`./Pages/${name}.tsx`],
  setup: ({ App, props }) => <App {...props} />,
})
if (import.meta.env.PROD) createServer(renderPage, 13714)
export default renderPage
