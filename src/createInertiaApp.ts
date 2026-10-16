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
  hydrate as hydrateRoot,
  isServer,
  render as renderRoot,
  type renderToString,
  type renderToStringAsync,
  ssr,
} from 'solid-js/web'
import App, { type InertiaAppProps } from './App'
import { ServerHeadContext, createServerHeadState } from './HeadContext'
import type { InertiaTitleCallback, SolidInertiaAppConfig } from './types'

type SetupOptions<ElementType, SharedProps extends PageProps> = {
  el: ElementType
  App: typeof App
  props: InertiaAppProps<SharedProps>
}

type ComponentResolver = (
  name: string,
  page?: Page<SharedPageProps>,
) => Component | Promise<Component> | { default: Component }

type SolidWithApp = (app: Component, options: { ssr: boolean }) => JSX.Element

type WithTitleCallback<Options, SharedProps extends PageProps> = Omit<Options, 'title'> & {
  title?: InertiaTitleCallback<SharedProps>
}

type InertiaAppOptionsForCSR<SharedProps extends PageProps> = WithTitleCallback<
  CreateInertiaAppOptionsForCSR<
    SharedProps,
    ComponentResolver,
    SetupOptions<Element, SharedProps>,
    void,
    SolidInertiaAppConfig
  >,
  SharedProps
> & { withApp?: never }

type InertiaAppOptionsForSSR<SharedProps extends PageProps> = WithTitleCallback<
  CreateInertiaAppOptionsForSSR<
    SharedProps,
    ComponentResolver,
    SetupOptions<null, SharedProps>,
    JSX.Element,
    SolidInertiaAppConfig
  >,
  SharedProps
> & { render: RenderToString; withApp?: never }

type InertiaAppOptionsAuto<SharedProps extends PageProps> = WithTitleCallback<
  Omit<
    CreateInertiaAppOptions<
      ComponentResolver,
      SetupOptions<HTMLElement | null, SharedProps>,
      JSX.Element | void,
      SolidInertiaAppConfig
    >,
    'setup'
  >,
  SharedProps
> & {
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
    title,
    serverHead,
    progress = {},
    page,
    render,
    defaults = {},
    nonce,
    http,
    // TODO: layout
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

  // Capture before component resolution yields to another app's configuration.
  const renderNonce = config.get('nonce') ?? undefined

  const resolveComponent = (name: string, page?: Page) =>
    Promise.resolve(resolve!(name, page)).then((module) => {
      // return 'default' in module ? module.default : module
      return ((module as { default?: Component }).default || module) as Component
    })

  const renderSSR = async (
    page: Page<SharedProps>,
    renderer: RenderToString,
    app: () => JSX.Element,
  ): Promise<InertiaAppSSRResponse> => {
    const headState = createServerHeadState()
    // This request-only context must not introduce another hydration component
    // scope. The public provider establishes ownership without createComponent.
    const html = await renderer(
      () => [
        // Let Solid inject this render's assets before returning HTML. Reading
        // global getAssets() after awaiting a custom renderer can cross requests.
        ssr('<head></head>'),
        ServerHeadContext.Provider({
          value: headState,
          get children() {
            return app()
          },
        }),
      ],
      { nonce: renderNonce },
    )
    // Solid's browser declarations omit the server generator's options.
    const hydrationScript = (generateHydrationScript as (options: { nonce?: string }) => string)({
      nonce: renderNonce,
    })
    const { extractHead } = await import('./serverHead')
    const result = await extractHead(
      html,
      (value) => (title ? title(value, page) : value),
      headState.titles,
      headState.serverHead,
    )

    return {
      body: buildSSRBody(id, page, result.body),
      head: [...result.head, result.assets, hydrationScript],
    }
  }

  // SSR render function factory - when on server without page/render, return a render function
  // This is used by the Vite plugin's SSR transform
  if (isServer && !page && !render) {
    return async (page: Page<SharedProps>, renderToString: RenderToString) => {
      const initialComponent = await resolveComponent(page.component, page)

      const props: InertiaAppProps<SharedProps> = {
        initialPage: page,
        initialComponent,
        resolveComponent,
        titleCallback: title,
        serverHead,
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
        solidApp = () => createComponent(App, props)

        if (withApp) {
          const _solidApp = solidApp
          solidApp = () => withApp(_solidApp, { ssr: true })
        }
      }

      return renderSSR(page, renderToString, solidApp)
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
      titleCallback: title,
      serverHead,
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

    let appElement = () => createComponent(App, props)

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
    return renderSSR(initialPage, render, solidApp!)
  }
}
