import { Page, PageResolver, router } from '@inertiajs/core'
import { MetaProvider } from '@solidjs/meta'
import { Component, ParentComponent, ParentProps, mergeProps } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import { Dynamic, createComponent, isServer } from 'solid-js/web'
import PageContext from './PageContext'

export type InertiaAppProps = {
  initialPage: Page
  initialComponent?: Component<Page['props']> & { layout?: ParentComponent | ParentComponent[] }
  resolveComponent?: PageResolver
  head: Parameters<typeof MetaProvider>['0']['tags']
}

type InertiaAppState = {
  component: InertiaAppProps['initialComponent'] | null
  page: InertiaAppProps['initialPage']
  key: any
}

export default function App(props: ParentProps<InertiaAppProps>) {
  const [current, setCurrent] = createStore<InertiaAppState>({
    component: props.initialComponent || null,
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
            page,
            key: preserveState ? current.key : Date.now(),
          }),
        )
      },
    })
  }

  const children = () => {
    if (!current.component) {
      return undefined
    }

    const PageComponent = current.component

    const child = createComponent(
      // @ts-expect-error
      Dynamic,
      mergeProps(
        {
          component: PageComponent,
          get key() {
            return current.key
          },
        },
        () => current.page.props,
      ),
    )

    if (typeof PageComponent.layout === 'function') {
      return createComponent(PageComponent.layout, {
        children: child,
      })
    }

    if (Array.isArray(PageComponent.layout)) {
      return PageComponent.layout.reverse().reduce((children, Layout) => createComponent(Layout, { children }), child)
    }

    return child
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
