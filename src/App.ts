import { type Page, type PageResolver, router } from '@inertiajs/core'
import { MetaProvider } from '@solidjs/meta'
import { type Component, type ParentComponent, type ParentProps, createComponent, mergeProps } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import { isServer } from 'solid-js/web'
import PageContext from './PageContext'

type InertiaLayoutComponent = ParentComponent<Page['props']>

type InertiaComponent = Component<Page['props']> & {
  layout?: InertiaLayoutComponent | InertiaLayoutComponent[]
}

export type InertiaAppProps = {
  initialPage: Page
  initialComponent?: InertiaComponent
  resolveComponent?: PageResolver
}

type InertiaAppState = {
  component: InertiaAppProps['initialComponent'] | null
  layouts: ParentComponent<unknown>[]
  page: InertiaAppProps['initialPage']
  key: unknown
}

function extractLayouts(component) {
  if (!component) {
    return []
  }

  if (typeof component.layout === 'function') {
    return [component.layout]
  }

  if (Array.isArray(component.layout)) {
    return component.layout
  }

  return []
}

export default function App(props: ParentProps<InertiaAppProps>) {
  const [current, setCurrent] = createStore<InertiaAppState>({
    component: props.initialComponent || null,
    layouts: extractLayouts(props.initialComponent || null),
    page: props.initialPage,
    key: null,
  })

  if (!isServer) {
    router.init({
      initialPage: props.initialPage,
      resolveComponent: props.resolveComponent,
      async swapComponent({ component, page, preserveState }) {
        setCurrent(
          reconcile({
            component: component as Component,
            layouts: extractLayouts(component),
            page,
            key: preserveState ? current.key : Date.now(),
          }),
        )
      },
    })
  }

  const children = (i = 0) => {
    const layout = current.layouts[i]

    if (!layout) {
      return createComponent(
        current.component,
        mergeProps(
          {
            key: current.key,
          },
          () => current.page.props,
        ),
      )
    }

    // @ts-ignore
    return createComponent(
      layout,
      mergeProps(() => current.page.props, {
        get children() {
          return children(i + 1)
        },
      }),
    )
  }

  return createComponent(MetaProvider, {
    get children() {
      return createComponent(PageContext.Provider, {
        get value() {
          return current.page
        },
        get children() {
          return children()
        },
      })
    },
  })
}
