import { Page, PageResolver, router } from '@inertiajs/core'
import { MetaProvider } from '@solidjs/meta'
import { Component, ParentComponent, ParentProps, mergeProps } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import { createComponent, isServer } from 'solid-js/web'
import PageContext from './PageContext'

export type InertiaAppProps = {
  initialPage: Page
  initialComponent?: Component<Page['props']> & { layout?: ParentComponent<any> | ParentComponent<any>[] }
  resolveComponent?: PageResolver
  head: Parameters<typeof MetaProvider>['0']['tags']
}

type InertiaAppState = {
  component: InertiaAppProps['initialComponent'] | null
  layouts: ParentComponent<any>[]
  page: InertiaAppProps['initialPage']
  key: any
}

function extractLayouts(component) {
  if (!component || !component.layout) {
    return []
  }

  return [component.layout].flat()
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
      swapComponent: async ({ component, page, preserveState }) => {
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
      return createComponent(current.component, current.page.props)
    }

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
    tags: props.head,
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
