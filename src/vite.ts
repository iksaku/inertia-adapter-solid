import type { FrameworkConfig } from '@inertiajs/vite'

const inertiaSolidFramework: FrameworkConfig = {
  package: 'inertia-adapter-solid',
  extensions: ['.jsx', '.tsx'],
  extractDefault: true,
  ssr: (configureCall, options) => `
import createServer from 'inertia-adapter-solid/server'
import { renderToString } from 'solid-js/web'

const renderPromise = ${configureCall}

renderPromise.catch((error) => console.error(error))

const renderPage = async (page) => {
    const render = await renderPromise
    return render(page, renderToString)
}

if (import.meta.env.PROD) {
    createServer(renderPage${options})
}

export default renderPage
`,
}

export default inertiaSolidFramework
