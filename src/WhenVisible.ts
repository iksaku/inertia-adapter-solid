import { type ReloadOptions, router } from '@inertiajs/core'
import { get } from 'es-toolkit/compat'
import {
  type JSX,
  type ParentProps,
  Show,
  type ValidComponent,
  createComponent,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  on,
  onCleanup,
} from 'solid-js'
import { createDynamic, isServer } from 'solid-js/web'
import type { DynamicProps } from './types'
import usePage from './usePage'

type WhenVisibleProps<T extends ValidComponent = 'div'> = DynamicProps<
  T,
  ParentProps<{
    fallback?: JSX.Element
    data?: string | string[]
    params?: ReloadOptions
    buffer?: number
    always?: boolean
  }>
>

export default function WhenVisible<T extends ValidComponent = 'div'>(_props: WhenVisibleProps<T>) {
  const props = mergeProps(
    {
      fallback: null,
      buffer: 0,
      as: 'div',
      always: false,
    },
    _props,
  )

  const page = usePage()

  const [loaded, setLoaded] = createSignal(false)
  const [fetching, setFetching] = createSignal(false)

  const keys = createMemo<string[]>(() => (props.data ? (Array.isArray(props.data) ? props.data : [props.data]) : []))

  const getReloadParams = (): Partial<ReloadOptions> => {
    const reloadParams: Partial<ReloadOptions> = { preserveErrors: true, ...props.params }

    if (keys().length > 0) {
      reloadParams.only = keys()
    }

    return reloadParams
  }

  let observer: IntersectionObserver | null = null

  let currentElement: Element | null

  const createObserver = () => {
    if (isServer) {
      return
    }

    const newObserver = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return

        if (!props.always) {
          newObserver.disconnect()
        }

        if (fetching()) {
          return
        }

        setFetching(true)

        const reloadParams = getReloadParams()

        router.reload({
          ...reloadParams,
          preserveErrors: reloadParams.preserveErrors ?? true,
          onStart: (e) => {
            setFetching(true)
            reloadParams.onStart?.(e)
          },
          onFinish: (e) => {
            setLoaded(true)
            setFetching(false)
            reloadParams.onFinish?.(e)
          },
        })
      },
      {
        rootMargin: `${props.buffer}px`,
      },
    )

    observer = newObserver

    if (currentElement) {
      newObserver.observe(currentElement)
    }
  }

  createEffect(
    on(
      () => keys().every((key) => get(page.props, key)),
      () => {
        const exists = keys().length > 0 && keys().every((key) => get(page.props, key) !== undefined)
        setLoaded(exists)

        if (exists && !props.always) {
          return
        }

        if (!observer || !exists) {
          queueMicrotask(createObserver)
        }
      },
    ),
  )

  onCleanup(() => {
    observer?.disconnect()
  })

  return [
    createComponent(Show, {
      // @ts-ignore: This is the intended `keyed` behavior. See: https://docs.solidjs.com/reference/components/show#behavior
      keyed: false,
      get when() {
        return props.always || !loaded()
      },
      get children() {
        return createDynamic(() => props.as, {
          ref(el: Element) {
            currentElement = el
          },
        })
      },
    }),

    createComponent(Show, {
      // @ts-ignore: This is the intended `keyed` behavior. See: https://docs.solidjs.com/reference/components/show#behavior
      keyed: false,
      get when() {
        return loaded()
      },
      get children() {
        return props.children
      },
      get fallback() {
        return props.fallback
      },
    }),
  ]
}
