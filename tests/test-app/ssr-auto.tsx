import { createInertiaApp } from 'inertia-adapter-solid'
import type { Component } from 'solid-js'
import { WithAppContext } from './Pages/SSR/WithApp'

// The public Solid framework descriptor supplies the renderer and server bootstrap.
createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob<{ default: Component }>(['./Pages/SSR/**/*.tsx', './Pages/Head/**/*.tsx'], {
      eager: true,
    })
    return pages[`./Pages/${name}.tsx`]
  },
  title: (title, page) => [title, page.props.titleSuffix].filter(Boolean).join(' | '),
  serverHead: true,
  withApp: (App, options) => (
    <WithAppContext.Provider value={{ injected: 'injected-via-withApp', ssr: options.ssr }}>
      <App />
    </WithAppContext.Provider>
  ),
})
