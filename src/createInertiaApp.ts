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
  http as httpModule,
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
  type renderToString,
  type renderToStringAsync,
} from 'solid-js/web'
import App, { type InertiaAppProps, type InertiaComponent } from './App'
import type { SolidInertiaAppConfig } from './types'

type SetupOptions<ElementType, SharedProps extends PageProps> = {
  el: ElementType
  App: typeof App
  props: InertiaAppProps<SharedProps>
}

// Resolve components without constraining TypeScript's inferred static layout property.
type PageComponent = Component<Page['props']>

type ComponentResolver = (
  name: string,
  page?: Page<SharedPageProps>,
) => PageComponent | Promise<PageComponent> | { default: PageComponent }

type SolidWithApp = (app: Component, options: { ssr: boolean }) => JSX.Element

type InertiaAppOptionsForCSR<SharedProps extends PageProps> = Omit<
  CreateInertiaAppOptionsForCSR<
    SharedProps,
    ComponentResolver,
    SetupOptions<Element, SharedProps>,
    void,
    SolidInertiaAppConfig
  >,
  'layout'
> & { title?: never; serverHead?: never; withApp?: never; layout?: InertiaAppProps<SharedProps>['defaultLayout'] }

type InertiaAppOptionsForSSR<SharedProps extends PageProps> = Omit<
  CreateInertiaAppOptionsForSSR<
    SharedProps,
    ComponentResolver,
    SetupOptions<null, SharedProps>,
    JSX.Element,
    SolidInertiaAppConfig
  >,
  'layout'
> & {
  title?: never
  serverHead?: never
  render: RenderToString
  withApp?: never
  layout?: InertiaAppProps<SharedProps>['defaultLayout']
}

type InertiaAppOptionsAuto<SharedProps extends PageProps> = Omit<
  CreateInertiaAppOptions<
    ComponentResolver,
    SetupOptions<HTMLElement | null, SharedProps>,
    JSX.Element | void,
    SolidInertiaAppConfig
  >,
  'setup' | 'layout'
> & {
  title?: never
  serverHead?: never
  page?: Page<SharedProps>
  render?: undefined
  layout?: InertiaAppProps<SharedProps>['defaultLayout']
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
    render,
    defaults = {},
    nonce,
    http,
    layout,
    withApp,
  }:
    | InertiaAppOptionsForCSR<SharedProps>
    | InertiaAppOptionsForSSR<SharedProps>
    | InertiaAppOptionsAuto<SharedProps> = {} as InertiaAppOptionsAuto<SharedProps>,
): Promise<InertiaAppSSRResponse | RenderFunction<SharedProps> | void> {
  config.replace(defaults)

  if (nonce) {
    config.set('nonce', nonce)
  }

  if (http) {
    httpModule.setClient(http)
  }

  const resolveComponent = (name: string, page?: Page) =>
    Promise.resolve(resolve!(name, page)).then((module) => {
      // return 'default' in module ? module.default : module
      return ((module as { default?: InertiaComponent }).default || module) as InertiaComponent
    })

  // SSR render function factory - when on server without page/render, return a render function
  // This is used by the Vite plugin's SSR transform
  if (isServer && !page && !render) {
    return async (page: Page<SharedProps>, renderToString: RenderToString) => {
      const initialComponent = await resolveComponent(page.component, page)

      const props: InertiaAppProps<SharedProps> = {
        initialPage: page,
        initialComponent,
        resolveComponent,
        defaultLayout: layout,
      }

      let solidApp: () => JSX.Element

      if (setup) {
        solidApp = () =>
          (setup as (options: SetupOptions<null, SharedProps>) => JSX.Element)({
            el: null,
            App,
            props,
          })
      } else {
        solidApp = () => createComponent(App<SharedProps>, props)

        if (withApp) {
          const _solidApp = solidApp
          solidApp = () => withApp(_solidApp, { ssr: true })
        }
      }

      const html = await renderToString(solidApp)
      const body = buildSSRBody(id, page, html)

      return {
        body,
        head: [getAssets(), generateHydrationScript()],
      }
    }
  }

  const initialPage = page || getInitialPageFromDOM<Page<SharedProps>>(id)!

  const solidApp = await Promise.all([
    resolveComponent(initialPage.component, initialPage),
    router.decryptHistory().catch(() => {}),
  ]).then(([initialComponent]) => {
    const props: InertiaAppProps<SharedProps> = {
      initialPage,
      initialComponent,
      resolveComponent,
      defaultLayout: layout,
    }

    if (isServer) {
      return () =>
        (setup as (options: SetupOptions<null, SharedProps>) => JSX.Element)({
          el: null,
          App,
          props,
        })
    }

    const el = document.getElementById(id)!

    if (setup) {
      ;(setup as (options: SetupOptions<HTMLElement, SharedProps>) => void)({
        el,
        App,
        props,
      })

      return
    }

    let appElement = () => createComponent(App<SharedProps>, props)

    if (withApp) {
      const _appElement = appElement
      appElement = () => withApp(_appElement, { ssr: false })
    }

    if (el.hasAttribute('data-server-rendered')) {
      hydrateRoot(appElement, el)
    } else {
      renderRoot(appElement, el)
    }
  })

  if (!isServer && progress) {
    setupProgress(progress)
  }

  if (isServer && render) {
    const html = await render(solidApp!)
    const body = buildSSRBody(id, initialPage, html)

    return {
      body,
      head: [getAssets(), generateHydrationScript()],
    }
  }
}
