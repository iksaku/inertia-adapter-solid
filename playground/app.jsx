import server from '@/server'
import { createInertiaApp } from 'inertia-adapter-solid'
import { render } from 'solid-js/web'

await server.start()

createInertiaApp({
  page: await (await fetch(window.location.href)).json(),
  resolve(name) {
    const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
    return pages[`./Pages/${name}.jsx`]
  },
  setup({ el, App, props }) {
    render(() => <App {...props} />, el)
  },
})
