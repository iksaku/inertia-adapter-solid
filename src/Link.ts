import {
  type ActiveVisit,
  type LinkComponentBaseProps,
  type LinkPrefetchOption,
  type Method,
  type PendingVisit,
  type VisitOptions,
  isUrlMethodPair,
  mergeDataIntoQueryString,
  router,
  shouldIntercept,
  shouldNavigate,
} from '@inertiajs/core'
import {
  type JSX,
  type ParentProps,
  type Ref,
  type ValidComponent,
  createMemo,
  createSignal,
  mergeProps,
  onCleanup,
  onMount,
  splitProps,
} from 'solid-js'
import { createDynamic, isServer } from 'solid-js/web'
import type { DynamicProps, ElementOf } from './types'

export type InertiaLinkProps<T extends ValidComponent = 'a'> = DynamicProps<
  T,
  ParentProps<
    LinkComponentBaseProps & {
      onClick?: JSX.EventHandler<ElementOf<T>, MouseEvent>
    }
  >
>

const noop = () => {}

export default function Link<T extends ValidComponent = 'a'>(_props: InertiaLinkProps<T>) {
  let [props, attributes] = splitProps(_props, [
    'children',
    'as',
    'data',
    'href',
    'method',
    'preserveScroll',
    'preserveState',
    'preserveUrl',
    'replace',
    'only',
    'except',
    'headers',
    'queryStringArrayFormat',
    'async',
    'onClick',
    'onCancelToken',
    'onBefore',
    'onStart',
    'onProgress',
    'onFinish',
    'onCancel',
    'onSuccess',
    'onError',
    'onPrefetching',
    'onPrefetched',
    'prefetch',
    'cacheFor',
    'cacheTags',
  ])

  // Set default prop values
  props = mergeProps(
    {
      as: 'a',
      data: {},
      href: '',
      method: 'get',
      preserveScroll: false,
      preserveState: null,
      preserveUrl: false,
      replace: false,
      only: [],
      except: [],
      headers: {},
      queryStringArrayFormat: 'brackets',
      async: false,
      prefetch: false,
      cacheFor: 0,
      cacheTags: [],
    },
    props,
  )

  const [inFlightCount, setInFlightCount] = createSignal(0)
  let hoverTimeout: ReturnType<typeof setTimeout>

  const method = createMemo(() =>
    isUrlMethodPair(props.href) ? props.href.method : (props.method.toLowerCase() as Method),
  )

  const as = createMemo(() => {
    if (typeof props.as !== 'string' || props.as.toLowerCase() !== 'a') {
      // Custom component or element
      return props.as
    }

    return method() !== 'get' ? 'button' : props.as.toLowerCase()
  })

  const mergeDataArray = createMemo(() =>
    mergeDataIntoQueryString(
      method(),
      isUrlMethodPair(props.href) ? props.href.url : props.href,
      props.data,
      props.queryStringArrayFormat,
    ),
  )

  const url = createMemo(() => mergeDataArray()[0])
  const data = createMemo(() => mergeDataArray()[1])

  const baseParams = createMemo<VisitOptions>(() => ({
    data: data(),
    method: method(),
    preserveScroll: props.preserveScroll,
    preserveState: props.preserveState ?? method() !== 'get',
    preserveUrl: props.preserveUrl,
    replace: props.replace,
    only: props.only,
    except: props.except,
    headers: props.headers,
    async: props.async,
  }))

  const visitParams = createMemo<VisitOptions>(() => ({
    ...baseParams(),
    onCancelToken: props.onCancelToken ?? noop,
    onBefore: props.onBefore ?? noop,
    onStart(visit: PendingVisit) {
      setInFlightCount((count) => count + 1)
      props.onStart?.(visit)
    },
    onProgress: props.onProgress ?? noop,
    onFinish(visit: ActiveVisit) {
      setInFlightCount((count) => count - 1)
      props.onFinish?.(visit)
    },
    onCancel: props.onCancel ?? noop,
    onSuccess: props.onSuccess ?? noop,
    onError: props.onError ?? noop,
  }))

  const prefetchModes = createMemo<LinkPrefetchOption[]>(() => {
    if (props.prefetch === true) {
      return ['hover']
    }

    if (props.prefetch === false) {
      return []
    }

    if (Array.isArray(props.prefetch)) {
      return props.prefetch
    }

    return [props.prefetch]
  })

  const cacheForValue = createMemo(() => {
    if (props.cacheFor !== 0) {
      // If they've provided a value, respect it
      return props.cacheFor
    }

    if (prefetchModes().length === 1 && prefetchModes()[0] === 'click') {
      // If they've only provided a prefetch mode of 'click',
      // we should only prefetch for the next request but not keep it around
      return 0
    }

    // Otherwise, default to 30 seconds
    return 30_000
  })

  const prefetch = () => {
    if (isServer) return

    router.prefetch(
      url(),
      {
        ...baseParams(),
        onPrefetching: props.onPrefetching ?? noop,
        onPrefetched: props.onPrefetched ?? noop,
      },
      { cacheFor: cacheForValue(), cacheTags: props.cacheTags },
    )
  }

  onMount(() => {
    if (prefetchModes().includes('mount')) {
      prefetch()
    }
  })

  onCleanup(() => {
    clearTimeout(hoverTimeout)
  })

  const regularEvents = {
    onClick(event: MouseEvent) {
      props.onClick?.(event)

      if (shouldIntercept(event)) {
        event.preventDefault()
        router.visit(url(), visitParams())
      }
    },
  }

  const prefetchHoverEvents = {
    onMouseEnter() {
      hoverTimeout = setTimeout(() => {
        prefetch()
      }, 75)
    },
    onMouseLeave() {
      clearTimeout(hoverTimeout)
    },
    onClick: regularEvents.onClick,
  }

  const prefetchClickEvents = {
    onMouseDown(event: MouseEvent) {
      if (shouldIntercept(event)) {
        event.preventDefault()
        prefetch()
      }
    },
    onKeyDown(event: KeyboardEvent) {
      if (shouldNavigate(event)) {
        event.preventDefault()
        prefetch()
      }
    },
    onMouseUp(event: MouseEvent) {
      event.preventDefault()
      router.visit(url(), visitParams())
    },
    onKeyUp(event: KeyboardEvent) {
      if (shouldNavigate(event)) {
        event.preventDefault()
        router.visit(url(), visitParams())
      }
    },
    onClick(event: MouseEvent) {
      props.onClick?.(event)

      if (shouldIntercept(event)) {
        // Let the mouseup/keyup event handle the visit
        event.preventDefault()
      }
    },
  }

  const elProps = createMemo(() => {
    if (as() === 'button') {
      return { type: 'button' }
    }

    if (as() === 'a' || typeof as() !== 'string') {
      return { href: url() }
    }

    return {}
  })

  return createDynamic(
    () => as(),
    mergeProps(
      attributes,
      elProps,
      {
        get dataLoading() {
          return inFlightCount() > 0 ? '' : undefined
        },
        get children() {
          return props.children
        },
      },
      () => {
        if (isServer) return

        if (prefetchModes().includes('hover')) {
          return prefetchHoverEvents
        }

        if (prefetchModes().includes('click')) {
          return prefetchClickEvents
        }

        return regularEvents
      },
    ),
  )
}
