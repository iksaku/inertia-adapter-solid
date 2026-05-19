import {
  type CreateInertiaAppOptions,
  type CreateInertiaAppOptionsForCSR,
  type CreateInertiaAppOptionsForSSR,
  type InertiaAppSSRResponse,
  type Page,
  type PageProps,
  type SharedPageProps,
  buildSSRBody,
  config,
  getInitialPageFromDOM,
  router,
  setupProgress,
} from '@inertiajs/core'
import { type Component, type JSX, createComponent } from 'solid-js'
import {
  generateHydrationScript,
  getAssets,
  hydrate as hydrateRoot,
  isServer,
  render as renderRoot,
  renderToString,
  type renderToStringAsync,
} from 'solid-js/web'
import App, { type InertiaAppProps } from './App'
import type { SolidInertiaAppConfig } from './types'

type SetupOptions<ElementType, SharedProps extends PageProps> = {
  el: ElementType
  App: typeof App
  props: InertiaAppProps<SharedProps>
}

type ComponentResolver = (
  name: string,
  page?: Page<SharedPageProps>,
) => Component | Promise<Component> | { default: Component }

type SolidWithApp = (app: JSX.Element, options: { ssr: boolean }) => void

type InertiaAppOptionsForCSR<SharedProps extends PageProps> = CreateInertiaAppOptionsForCSR<
  SharedProps,
  ComponentResolver,
  SetupOptions<Element, SharedProps>,
  void,
  SolidInertiaAppConfig
> & { title: never; withApp?: never }

type InertiaAppOptionsForSSR<SharedProps extends PageProps> = CreateInertiaAppOptionsForSSR<
  SharedProps,
  ComponentResolver,
  SetupOptions<null, SharedProps>,
  JSX.Element,
  SolidInertiaAppConfig
> & { title: never; render: RenderToString; withApp?: never }

type InertiaAppOptionsAuto<SharedProps extends PageProps> = Omit<
  CreateInertiaAppOptions<
    ComponentResolver,
    SetupOptions<HTMLElement | null, SharedProps>,
    JSX.Element | void,
    SolidInertiaAppConfig
  >,
  'setup'
> & {
  title: never
  page?: Page<SharedProps>
  render?: undefined
} & (
    | { setup?: undefined; withApp?: SolidWithApp }
    | { setup: (options: SetupOptions<HTMLElement | null, SharedProps>) => JSX.Element | void; withApp?: never }
  )

type RenderToString = typeof renderToString | typeof renderToStringAsync

type RenderFunction<SharedProps extends PageProps> = (
  page: Page<SharedProps>,
  render: RenderToString,
) => Promise<InertiaAppSSRResponse>

export default async function createInertiaApp<SharedProps extends PageProps = PageProps & SharedPageProps>(
  options: InertiaAppOptionsForCSR<SharedProps>,
): Promise<void>
export default async function createInertiaApp<SharedProps extends PageProps = PageProps & SharedPageProps>(
  options: InertiaAppOptionsForSSR<SharedProps>,
): Promise<InertiaAppSSRResponse>
export default async function createInertiaApp<SharedProps extends PageProps = PageProps & SharedPageProps>(
  options?: InertiaAppOptionsAuto<SharedProps>,
): Promise<void | RenderFunction<SharedProps>>
export default async function createInertiaApp<SharedProps extends PageProps = PageProps & SharedPageProps>(
  {
    id = 'app',
    resolve,
    setup,
    progress = {},
    page,
    render = renderToString,
    defaults = {},
    // TODO: nonce
    // TODO: http
    // TODO: layout
    // TODO: withApp
  }:
    | InertiaAppOptionsForCSR<SharedProps>
    | InertiaAppOptionsForSSR<SharedProps>
    | InertiaAppOptionsAuto<SharedProps> = {} as InertiaAppOptionsAuto<SharedProps>,
): Promise<InertiaAppSSRResponse | RenderFunction<SharedProps> | void> {
  config.replace(defaults)

  // TODO: nonce
  // TODO: http

  const resolveComponent = (name: string, page?: Page) =>
    Promise.resolve(resolve(name, page)).then((module) => {
      // return 'default' in module ? module.default : module
      return ((module as { default?: Component }).default || module) as Component
    })

  // SSR render function factory - when on server without page/render, return a render function
  // This is used by the Vite plugin's SSR transform
  if (isServer && !page) {
    return async (page: Page<SharedProps>, renderToString: RenderToString) => {
      const initialComponent = await resolveComponent(page.component, page)

      const props: InertiaAppProps<SharedProps> = {
        initialPage: page,
        initialComponent,
        resolveComponent,
      }

      let solidApp: () => JSX.Element

      if (setup) {
        solidApp = () =>
          (setup as (options: SetupOptions<Element, SharedProps>) => JSX.Element)({
            el: null,
            App,
            props,
          })
      } else {
        solidApp = () => createComponent(App, props)

        // TODO: withApp
      }

      const html = await render(solidApp)
      const body = buildSSRBody(id, page, html)

      return {
        body,
        head: [getAssets(), generateHydrationScript()],
      }
    }
  }

  // biome-ignore lint/style/noNonNullAssertion: Matching official adapters
  const initialPage = page || getInitialPageFromDOM<Page<SharedProps>>(id)!

  const solidApp = await Promise.all([
    resolveComponent(initialPage.component, initialPage),
    router.decryptHistory().catch(() => {}),
  ]).then(([initialComponent]) => {
    const props: InertiaAppProps<SharedProps> = {
      initialPage,
      initialComponent,
      resolveComponent,
    }

    if (isServer) {
      return () =>
        (setup as (options: SetupOptions<null, SharedProps>) => JSX.Element)({
          el: null,
          App,
          props,
        })
    }

    // biome-ignore lint/style/noNonNullAssertion: Matching official adapters
    const el = document.getElementById(id)!

    if (setup) {
      ;(setup as (options: SetupOptions<HTMLElement, SharedProps>) => void)({
        el,
        App,
        props,
      })

      return
    }

    const appElement = () => createComponent(App, props)

    if (el.hasAttribute('data-server-rendered')) {
      hydrateRoot(appElement, el)
    } else {
      renderRoot(appElement, el)
    }
  })

  if (!isServer && progress) {
    setupProgress(progress)
  }

  if (isServer) {
    const html = await render(solidApp)
    const body = buildSSRBody(id, initialPage, html)

    return {
      body,
      head: [getAssets(), generateHydrationScript()],
    }
  }
}
