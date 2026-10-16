import { type Page, type PageProps, type PageResolver, router } from '@inertiajs/core'
import { MetaProvider } from '@solidjs/meta'
import { cloneDeep } from 'es-toolkit'
import {
  type Component,
  type JSX,
  type ParentComponent,
  type ParentProps,
  Show,
  createComponent,
  createMemo,
  mergeProps,
} from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import { createDynamic, isServer } from 'solid-js/web'
import PageContext from './PageContext'

type InertiaLayoutComponent = ParentComponent<Page['props']>

type InertiaComponent = Component<Page['props']> & {
  layout?: InertiaLayoutComponent | InertiaLayoutComponent[]
}

type LayoutNode = {
  component: InertiaLayoutComponent
  child?: LayoutNode
}

export type InertiaAppProps<SharedProps extends PageProps = PageProps> = {
  initialPage: Page<SharedProps>
  initialComponent?: InertiaComponent
  resolveComponent?: PageResolver
}

type InertiaAppState = {
  component: InertiaAppProps['initialComponent'] | null
  page: InertiaAppProps['initialPage']
  key: number
}

export default function App(props: ParentProps<InertiaAppProps>) {
  // Reconcile our own page tree without mutating core's page or pending deferred metadata.
  const [current, setCurrent] = createStore<InertiaAppState>({
    component: props.initialComponent || null,
    page: cloneDeep(props.initialPage),
    key: 1,
  })

  if (!isServer) {
    router.init({
      initialPage: props.initialPage,
      resolveComponent: props.resolveComponent!,
      onFlash(flash) {
        setCurrent('page', 'flash', reconcile(flash))
      },
      async swapComponent({ component, page, preserveState }) {
        setCurrent(
          reconcile({
            component: component as InertiaComponent,
            page: cloneDeep(page),
            key: preserveState ? current.key : current.key + 1,
          }),
        )
      },
    })
  }

  // Reset only the page's owner on a non-preserving visit, not its layouts.
  const renderPage = () =>
    createComponent(Show, {
      keyed: true,
      get when() {
        return current.key
      },
      get children() {
        return createDynamic(
          () => current.component || undefined,
          mergeProps({ key: current.key }, () => current.page.props),
        )
      },
    })

  // Fold descriptions, not elements: creating components here would remount the tree.
  const layoutTree = createMemo(() => {
    const layout = current.component?.layout
    const layouts = typeof layout === 'function' ? [layout] : Array.isArray(layout) ? layout : []

    return layouts.reduceRight<LayoutNode>((child, component) => ({ component, child }), { component: renderPage })
  })

  const RenderLayout: Component<{ node?: LayoutNode }> = (props) =>
    createDynamic(
      // A new description updates inputs; only a new component replaces this owner.
      () => props.node?.component,
      mergeProps(() => current.page.props, {
        get children(): JSX.Element {
          // Resolve descendants inside the layout's owner/context, not ahead of it.
          return createComponent(RenderLayout, {
            get node() {
              return props.node?.child
            },
          })
        },
      }) as ParentProps<Page['props']>,
    )

  return createComponent(MetaProvider, {
    get children() {
      return createComponent(PageContext.Provider, {
        get value() {
          return current.page
        },
        get children() {
          return createComponent(RenderLayout, {
            get node() {
              return layoutTree()
            },
          })
        },
      })
    },
  })
}
