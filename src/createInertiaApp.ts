import {
  type CreateInertiaAppOptionsForCSR,
  type CreateInertiaAppOptionsForSSR,
  type InertiaAppResponse,
  type InertiaAppSSRResponse,
  type Page,
  type PageProps,
  type SharedPageProps,
  config,
  getInitialPageFromDOM,
  router,
  setupProgress,
} from '@inertiajs/core'
import { type Component, type JSX, createComponent } from 'solid-js'
import {
  createDynamic,
  generateHydrationScript,
  getAssets,
  isServer,
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

type ComponentResolver = (name: string) => Component | Promise<Component> | { default: Component }

type InertiaAppOptionsForCSR<SharedProps extends PageProps> = CreateInertiaAppOptionsForCSR<
  SharedProps,
  ComponentResolver,
  SetupOptions<Element, SharedProps>,
  void,
  SolidInertiaAppConfig
> & { title: never; render: never }

type InertiaAppOptionsForSSR<SharedProps extends PageProps> = CreateInertiaAppOptionsForSSR<
  SharedProps,
  ComponentResolver,
  SetupOptions<null, SharedProps>,
  JSX.Element,
  SolidInertiaAppConfig
> & { title: never; render: typeof renderToString | typeof renderToStringAsync }

export default async function createInertiaApp<SharedProps extends PageProps = PageProps & SharedPageProps>(
  options: InertiaAppOptionsForCSR<SharedProps>,
): Promise<void>
export default async function createInertiaApp<SharedProps extends PageProps = PageProps & SharedPageProps>(
  options: InertiaAppOptionsForSSR<SharedProps>,
): Promise<InertiaAppSSRResponse>
export default async function createInertiaApp<SharedProps extends PageProps = PageProps & SharedPageProps>({
  id = 'app',
  page = undefined,
  resolve,
  setup,
  render = renderToString,
  progress = {},
  defaults = {},
}: InertiaAppOptionsForCSR<SharedProps> | InertiaAppOptionsForSSR<SharedProps>): InertiaAppResponse {
  config.replace(defaults)

  const useScriptElementForInitialPage = config.get('future.useScriptElementForInitialPage')
  // biome-ignore lint/style/noNonNullAssertion: Matching official adapters
  const initialPage = page || getInitialPageFromDOM<Page<SharedProps>>(id, useScriptElementForInitialPage)!

  const resolveComponent = (name: string) =>
    Promise.resolve(resolve(name)).then((module) => ('default' in module ? module.default : module))

  const solidApp = await Promise.all([
    resolveComponent(initialPage.component),
    router.decryptHistory().catch(() => {}),
  ]).then(([initialComponent]) => {
    const props: InertiaAppProps<SharedProps> = {
      initialPage,
      initialComponent,
      resolveComponent,
    }

    if (isServer) {
      const ssrSetup = setup as (options: SetupOptions<null, SharedProps>) => JSX.Element

      return ssrSetup({
        el: null,
        App,
        props,
      })
    }

    const csrSetup = setup as (options: SetupOptions<Element, SharedProps>) => void

    csrSetup({
      el: document.getElementById(id),
      App,
      props,
    })
  })

  if (!isServer && progress) {
    setupProgress(progress)
  }

  if (isServer) {
    const element = () => {
      if (!useScriptElementForInitialPage) {
        return createDynamic(() => 'div', {
          children: solidApp,
          id,
          // @ts-expect-error: data-* attributes are not typed.
          'data-page': JSON.stringify(initialPage),
        })
      }

      return [
        createDynamic(() => 'script', {
          type: 'application/json',
          innerHTML: JSON.stringify(initialPage).replace(/\//g, '\\/'),
          // @ts-expect-error: data-* attributes are not typed.
          'data-page': id,
        }),
        createDynamic(() => 'div', {
          children: solidApp,
          id,
        }),
      ]
    }

    const body = await render(element)

    const head = [getAssets(), generateHydrationScript()]

    return { head, body }
  }
}
