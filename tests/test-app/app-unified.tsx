import { createInertiaApp, router } from 'inertia-adapter-solid'
import type { Component } from 'solid-js'
import { WithAppContext } from './Pages/SSR/WithApp'

window.testing = { Inertia: router }
const pages = import.meta.glob<{ default: Component }>(
  ['./Pages/**/*.tsx', '!./Pages/LayoutProps/**/*.tsx', '!./Pages/NestedProps/RescuedDeferred*.tsx'],
  { eager: true },
)
createInertiaApp({
  resolve: (name) => pages[`./Pages/${name}.tsx`],
  withApp: (App, options) => (
    <WithAppContext.Provider value={{ injected: 'injected-via-withApp', ssr: options.ssr }}>
      <App />
    </WithAppContext.Provider>
  ),
})
