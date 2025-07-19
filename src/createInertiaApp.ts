import { type Page, type PageResolver, setupProgress } from '@inertiajs/core'
import { createComponent } from 'solid-js'
import { Dynamic, generateHydrationScript, getAssets, isServer, renderToString } from 'solid-js/web'
import App, { type InertiaAppProps } from './App'

type CreateInertiaBaseOptions = {
  id?: string
  page?: Page
  resolve: PageResolver
}

type CreateInertiaCSROptions = CreateInertiaBaseOptions & {
  setup: (props: { el: Element; App: typeof App; props: InertiaAppProps }) => void
  progress?:
    | false
    | {
        delay?: number
        color?: string
        includeCSS?: boolean
        showSpinner?: boolean
      }
}
export type CreateInertiaCSRReturnType = ReturnType<CreateInertiaCSROptions['setup']>

type CreateInertiaSSROptions = CreateInertiaBaseOptions & {
  setup?: never
  progress?: never
}
export type CreateInertiaSSRReturnType = { head: string[]; body: string }

export default async function createInertiaApp(options: CreateInertiaCSROptions): Promise<CreateInertiaCSRReturnType>
export default async function createInertiaApp(options: CreateInertiaSSROptions): Promise<CreateInertiaSSRReturnType>
export default async function createInertiaApp({
  id = 'app',
  page = undefined,
  resolve,
  setup,
  progress = {},
}: CreateInertiaCSROptions | CreateInertiaSSROptions): Promise<
  CreateInertiaCSRReturnType | CreateInertiaSSRReturnType
> {
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || JSON.parse(el.dataset.page)
  /* @ts-ignore */
  const resolveComponent = (name) => Promise.resolve(resolve(name)).then((module) => module.default || module)

  const props: InertiaAppProps = {
    initialPage,
    initialComponent: await resolveComponent(initialPage.component),
    resolveComponent,
  }

  if (isServer) {
    const body = renderToString(() =>
      createComponent(Dynamic, {
        component: 'div',
        children: createComponent(App, props),
        id,
        'data-page': JSON.stringify(initialPage),
      }),
    )

    const head = [getAssets(), generateHydrationScript()]

    return { head, body }
  }

  if (progress) {
    setupProgress(progress)
  }

  setup({
    el,
    App,
    props,
  })
}
