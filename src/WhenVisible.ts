import { type ReloadOptions, router } from '@inertiajs/core'
import {
  type JSX,
  type ParentProps,
  Show,
  type ValidComponent,
  createComponent,
  createSignal,
  mergeProps,
  onCleanup,
  onMount,
} from 'solid-js'
import { createDynamic } from 'solid-js/web'

type WhenVisibleProps = ParentProps<{
  fallback?: JSX.Element
  data?: string | string[]
  params?: ReloadOptions
  buffer?: number
  as?: ValidComponent
  always?: boolean
}>

export default function WhenVisible(_props: WhenVisibleProps) {
  const props = mergeProps(
    {
      fallback: null,
      buffer: 0,
      as: 'div',
      always: false,
    },
    _props,
  )

  const [loaded, setLoaded] = createSignal(false)
  const [fetching, setFetching] = createSignal(false)

  const getReloadParams = (): Partial<ReloadOptions> => {
    if (props.data) {
      return {
        only: (Array.isArray(props.data) ? props.data : [props.data]) as string[],
      }
    }

    if (!props.params.data) {
      throw new Error('You must provide either a `data` or `params` prop.')
    }

    return props.params
  }

  let observer: IntersectionObserver | null = null

  let currentElement: Element | null

  onMount(() => {
    observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return

        if (!props.always) {
          observer.disconnect()
        }

        if (fetching()) {
          return
        }

        setFetching(true)

        const reloadParams = getReloadParams()

        router.reload({
          ...reloadParams,
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

    observer.observe(currentElement)
  })

  onCleanup(() => {
    observer?.disconnect()
  })

  return [
    createComponent(Show, {
      keyed: undefined,
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
      keyed: undefined,
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
