import { Page, PageResolver, router } from '@inertiajs/core'
import { MetaProvider } from '@solidjs/meta'
import { Component, ParentComponent, ParentProps, Show, createMemo, mergeProps } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import { Dynamic, createComponent, isServer } from 'solid-js/web'
import DynamicLayout from './DynamicLayout'
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
    const child = createComponent(
      // @ts-ignore
      Dynamic,
      mergeProps(
        {
          get component() {
            return current.component
          },
          get key() {
            return current.key
          },
        },
        () => current.page.props,
      ),
    )

    const layouts = createMemo(() => {
      if (typeof current.component.layout === 'function') {
        return [current.component.layout]
      }

      if (Array.isArray(current.component.layout)) {
        return [...current.component.layout]
      }

      return []
    })

    return createComponent(Show, {
      keyed: undefined,
      get when() {
        return layouts().length > 0
      },
      get fallback() {
        return child
      },
      children: createComponent(
        DynamicLayout,
        mergeProps(
          {
            _component: child,
            get _layouts() {
              return layouts()
            },
          },
          () => current.page.props,
        ),
      ),
    })
  }

  return createComponent(MetaProvider, {
    tags: props.head,
    get children() {
      return createComponent(PageContext.Provider, {
        get value() {
          return current.page
        },
        // @ts-ignore
        children,
      })
    },
  })
}
