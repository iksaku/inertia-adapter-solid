import {
  type Page,
  type PageProps,
  type PageResolver,
  type ServerHeadOption,
  resolveServerHead,
  router,
} from '@inertiajs/core'
import { cloneDeep } from 'es-toolkit'
import {
  type Component,
  type JSX,
  type ParentComponent,
  type ParentProps,
  createComponent,
  createMemo,
  mergeProps,
  onCleanup,
  useContext,
} from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import { isServer } from 'solid-js/web'
import HeadContext, { ServerHeadContext, createClientHeadManager, createServerHeadState } from './HeadContext'
import PageContext from './PageContext'
import type { InertiaTitleCallback } from './types'

type InertiaLayoutComponent = ParentComponent<Page['props']>

type InertiaComponent = Component<Page['props']> & {
  layout?: InertiaLayoutComponent | InertiaLayoutComponent[]
}

export type InertiaAppProps<SharedProps extends PageProps = PageProps> = {
  initialPage: Page<SharedProps>
  initialComponent?: InertiaComponent
  resolveComponent?: PageResolver
  titleCallback?: InertiaTitleCallback<SharedProps>
  serverHead?: ServerHeadOption
}

type InertiaAppState = {
  component: InertiaAppProps['initialComponent'] | null
  page: InertiaAppProps['initialPage']
  key: unknown
}

export default function App<SharedProps extends PageProps>(props: ParentProps<InertiaAppProps<SharedProps>>) {
  // Reconcile our own page tree without mutating core's page or pending deferred metadata.
  const [current, setCurrent] = createStore<InertiaAppState>({
    component: props.initialComponent || null,
    page: cloneDeep(props.initialPage),
    key: null,
  })

  const initialServerHead = resolveServerHead(props.initialPage, props.serverHead)
  const headManager = isServer
    ? (useContext(ServerHeadContext) ?? createServerHeadState())
    : createClientHeadManager(
        (title) => (props.titleCallback ? props.titleCallback(title, current.page as Page<SharedProps>) : title),
        initialServerHead,
      )

  if ('forceUpdate' in headManager) {
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
            key: preserveState ? current.key : Date.now(),
          }),
        )
      },
    })
    const syncServerHead = (event: { detail: { page: Page } }) => {
      headManager.updateServerHead(resolveServerHead(event.detail.page, props.serverHead))
    }
    onCleanup(router.on('navigate', syncServerHead))
    onCleanup(router.on('clientVisit', syncServerHead))
  } else {
    headManager.serverHead = initialServerHead
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

  const renderChildren = (i = 0): JSX.Element => {
    const layout = createMemo(() => layouts()[i])

    if (!layout()) {
      return createComponent(
        current.component!,
        mergeProps({ key: current.key }, () => current.page.props),
      )
    }

    return createComponent(
      layout(),
      mergeProps(() => current.page.props, {
        get children() {
          return renderChildren(i + 1) as Element
        },
      }),
    )
  }

  return createComponent(HeadContext.Provider, {
    value: headManager,
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
