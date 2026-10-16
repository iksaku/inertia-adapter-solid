import {
  type LayoutDefinition,
  type LayoutProps,
  type Page,
  type PageProps,
  type PageResolver,
  isPropsObject,
  normalizeLayouts,
  router,
} from '@inertiajs/core'
import { MetaProvider } from '@solidjs/meta'
import { cloneDeep } from 'es-toolkit'
import {
  $PROXY,
  type Accessor,
  type Component,
  type JSX,
  type ParentProps,
  Show,
  batch,
  createComponent,
  createMemo,
  getOwner,
  mergeProps,
  runWithOwner,
} from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import { createDynamic, isServer } from 'solid-js/web'
import PageContext from './PageContext'
import { layoutProps, resetLayoutProps } from './layoutProps'

// Layouts have their own prop contracts, not necessarily the page's prop contract.
// biome-ignore lint/suspicious/noExplicitAny: Component props are erased at the dynamic rendering boundary.
export type InertiaLayoutComponent = Component<any>

type LayoutEntry =
  | InertiaLayoutComponent
  | [InertiaLayoutComponent, Record<string, unknown>?]
  | { component: InertiaLayoutComponent; props?: Record<string, unknown> }

export type InertiaLayout =
  | LayoutEntry
  | LayoutEntry[]
  | Record<string, LayoutEntry>
  | Partial<LayoutProps>
  | null
  | false

export type InertiaComponent = Component<Page['props']> & {
  layout?: InertiaLayout
}

type LayoutNode = LayoutDefinition<InertiaLayoutComponent> & {
  child?: LayoutNode
}

export type InertiaAppProps<SharedProps extends PageProps = PageProps> = {
  initialPage: Page<SharedProps>
  initialComponent?: InertiaComponent
  resolveComponent?: PageResolver
  defaultLayout?: (name: string, page: Page<SharedProps>) => InertiaLayout | undefined
}

type InertiaAppState<SharedProps extends PageProps> = {
  component: InertiaAppProps['initialComponent'] | null
  page: Page<SharedProps>
  key: number
}

const isLayoutComponent = (value: unknown): value is InertiaLayoutComponent => typeof value === 'function'

// Unlike mergeProps, an explicitly present undefined masks lower-priority values.
// Cache each property's computation under the renderer owner, not its first consumer.
function createLayoutProps(sources: Accessor<(object | undefined)[]>, children: Accessor<JSX.Element>) {
  const owner = getOwner()
  const values = new Map<string | symbol, Accessor<unknown>>()
  const hasOwn = (source: object | undefined, key: string | symbol): source is Record<string | symbol, unknown> =>
    source !== undefined && Object.prototype.propertyIsEnumerable.call(source, key)
  const keys = createMemo(
    () => [
      ...new Set([
        ...sources().flatMap((source) => (source ? Reflect.ownKeys(source).filter((key) => hasOwn(source, key)) : [])),
        'children',
      ]),
    ],
    undefined,
    { equals: (a, b) => a.length === b.length && a.every((key, index) => key === b[index]) },
  )

  const result: ParentProps<Page['props']> = new Proxy({} as ParentProps<Page['props']>, {
    get(_target, key, receiver) {
      if (key === $PROXY) return receiver
      if (key === 'children') return children()
      if (!values.has(key)) {
        values.set(
          key,
          runWithOwner(owner, () =>
            createMemo(() => {
              const layers = sources()
              for (let index = layers.length - 1; index >= 0; index--) {
                const source = layers[index]
                if (hasOwn(source, key)) return source[key]
              }
            }),
          )!,
        )
      }
      return values.get(key)!()
    },
    has: (_target, key) => key === $PROXY || key === 'children' || sources().some((source) => hasOwn(source, key)),
    ownKeys: () => keys(),
    getOwnPropertyDescriptor(_target, key) {
      if (key === 'children' || sources().some((source) => hasOwn(source, key))) {
        return { configurable: true, enumerable: true, get: () => Reflect.get(result, key) }
      }
    },
  })
  return result
}

export default function App<SharedProps extends PageProps = PageProps>(
  props: ParentProps<InertiaAppProps<SharedProps>>,
) {
  // Reconcile our own page tree without mutating core's page or pending deferred metadata.
  const [current, setCurrent] = createStore<InertiaAppState<SharedProps>>({
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
        batch(() => {
          if (!preserveState) resetLayoutProps()
          setCurrent(
            reconcile({
              component: component as InertiaComponent,
              page: cloneDeep(page) as Page<SharedProps>,
              key: preserveState ? current.key : current.key + 1,
            }),
          )
        })
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
    const overrides = isPropsObject(layout, isLayoutComponent) ? (layout as Record<string, unknown>) : undefined
    const effectiveLayout =
      overrides || layout == null ? props.defaultLayout?.(current.page.component, current.page) : layout
    let layouts = normalizeLayouts(effectiveLayout, isLayoutComponent)

    if (overrides) {
      layouts = layouts.map((layout) => ({ ...layout, props: { ...layout.props, ...overrides } }))
    }

    return layouts.reduceRight<LayoutNode>((child, definition) => ({ ...definition, child }), {
      component: renderPage,
      props: {},
    })
  })

  const RenderLayout: Component<{ node?: LayoutNode }> = (props) =>
    createDynamic(
      // A new description updates inputs; only a new component replaces this owner.
      () => props.node?.component,
      createLayoutProps(
        () => {
          const node = props.node
          const dynamic = layoutProps()
          return [current.page.props, node?.props, dynamic.shared, node?.name ? dynamic.named[node.name] : undefined]
        },
        () => {
          // Resolve descendants inside the layout's owner/context, not ahead of it.
          return createComponent(RenderLayout, {
            get node() {
              return props.node?.child
            },
          })
        },
      ),
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
