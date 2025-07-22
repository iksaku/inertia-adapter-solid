import { type Page, type PageResolver, router } from '@inertiajs/core'
import { MetaProvider } from '@solidjs/meta'
import {
  type Component,
  type ParentComponent,
  type ParentProps,
  children,
  createComponent,
  createMemo,
  mergeProps,
} from 'solid-js'
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
  page: InertiaAppProps['initialPage']
  key: unknown
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
      async swapComponent({ component, page, preserveState }) {
        setCurrent(
          reconcile({
            component: component as InertiaComponent,
            page,
            key: preserveState ? current.key : Date.now(),
          }),
        )
      },
    })
  }

  const layouts = createMemo(() => {
    const component = current.component

    if (component) {
      if (typeof component.layout === 'function') {
        return [component.layout]
      }

      if (Array.isArray(component.layout)) {
        return component.layout
      }
    }

    return []
  })

  const renderChildren = (i = 0) => {
    const component = createMemo(() => layouts()[i])

    return children(() => {
      if (!component()) {
        return createComponent(
          current.component,
          mergeProps({ key: current.key }, () => current.page.props),
        )
      }

      // @ts-ignore
      return createComponent(
        component(),
        mergeProps(() => current.page.props, {
          get children() {
            return renderChildren(i + 1)
          },
        }),
      )
    })
  }

  return createComponent(MetaProvider, {
    get children() {
      return createComponent(PageContext.Provider, {
        get value() {
          return current.page
        },
        get children() {
          return renderChildren()
        },
      })
    },
  })
}
