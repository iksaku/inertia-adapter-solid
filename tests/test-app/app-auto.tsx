import { createInertiaApp, router } from 'inertia-adapter-solid'

window.testing = { Inertia: router }
createInertiaApp({ pages: './VitePages' })
