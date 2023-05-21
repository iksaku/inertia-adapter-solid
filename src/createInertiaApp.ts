import { Page, PageResolver, setupProgress } from '@inertiajs/core'
import { renderTags } from '@solidjs/meta'
import { Dynamic, createComponent, generateHydrationScript, isServer, renderToString } from 'solid-js/web'
import App, { InertiaAppProps } from './App'

type CreateInertiaBaseOptions = {
  id?: string
  page?: Page
  title?: (title: string) => string
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
export type CreateInertiaSSRReturnType = { head: string; body: string }

export default async function createInertiaApp(options: CreateInertiaCSROptions): Promise<CreateInertiaCSRReturnType>
export default async function createInertiaApp(options: CreateInertiaSSROptions): Promise<CreateInertiaSSRReturnType>
export default async function createInertiaApp({
  id = 'app',
  page = undefined,
  title = undefined,
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
    head: [],
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

    const head = renderTags(props.head).concat(generateHydrationScript())

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
