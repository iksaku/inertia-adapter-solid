import {
  type InfiniteScrollActionSlotProps,
  type InfiniteScrollComponentBaseProps,
  getScrollableParent,
  useInfiniteScroll,
} from '@inertiajs/core'
import { createLazyMemo } from '@solid-primitives/memo'
import {
  type Component,
  type ComponentProps,
  type JSX,
  Show,
  batch,
  children,
  createComponent,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  on,
  onMount,
  splitProps,
  untrack,
} from 'solid-js'
import { createDynamic } from 'solid-js/web'

type InfiniteScrollRef = `#${string}` | HTMLElement | (() => HTMLElement | null | undefined)

type SlotComponent<TProps = unknown> = keyof JSX.IntrinsicElements | Component<TProps> | (string & {})

type InfiniteScrollProps = Omit<InfiniteScrollComponentBaseProps, 'as'> & {
  as?: keyof JSX.IntrinsicElements

  itemsElement?: InfiniteScrollRef
  startElement?: InfiniteScrollRef
  endElement?: InfiniteScrollRef

  // Children Slots
  loading?: SlotComponent<InfiniteScrollActionSlotProps>
  previous?: SlotComponent<InfiniteScrollActionSlotProps>
  next?: SlotComponent<InfiniteScrollActionSlotProps>
  children: SlotComponent
}

function resolveHTMLElement(value: InfiniteScrollRef, fallback: HTMLElement | null): HTMLElement | null {
  if (!value) {
    return fallback
  }

  if (typeof value === 'string') {
    return document.querySelector(value) as HTMLElement | null
  }

  if (typeof value === 'function') {
    return value() || null
  }

  return fallback
}

export default function InfiniteScroll(_props: InfiniteScrollProps & ComponentProps<InfiniteScrollProps['as']>) {
  const [props, childrenProps] = splitProps(
    mergeProps(
      {
        buffer: 0,
        as: 'div',
        manual: false,
        manualAfter: 0,
        preserveUrl: false,
        reverse: false,
        autoScroll: undefined,
        onlyNext: false,
        onlyPrevious: false,
        itemsElement: null,
        startElement: null,
        endElement: null,
      },
      _props,
    ),
    [
      'data',
      'buffer',
      'as',
      'manual',
      'manualAfter',
      'preserveUrl',
      'reverse',
      'autoScroll',
      'children',
      'startElement',
      'endElement',
      'itemsElement',
      'previous',
      'next',
      'loading',
      'onlyNext',
      'onlyPrevious',
    ],
  )

  const [itemsElementRef, setItemsElementRef] = createSignal<HTMLElement | null>(null)
  const [startElementRef, setStartElementRef] = createSignal<HTMLElement | null>(null)
  const [endElementRef, setEndElementRef] = createSignal<HTMLElement | null>(null)

  const resolvedItemsElement = createLazyMemo(() => resolveHTMLElement(props.itemsElement, itemsElementRef()))
  const resolvedStartElement = createLazyMemo(() => resolveHTMLElement(props.startElement, startElementRef()))
  const resolvedEndElement = createLazyMemo(() => resolveHTMLElement(props.endElement, endElementRef()))

  const scrollableParent = createLazyMemo(() => getScrollableParent(resolvedItemsElement()))

  const manualMode = createMemo(() => props.manual || (props.manualAfter > 0 && requestCount() >= props.manualAfter))
  const autoLoad = createMemo(() => !manualMode())

  const { dataManager, elementManager, flush } = useInfiniteScroll({
    // Data
    getPropName: () => props.data,
    inReverseMode: () => props.reverse,
    shouldFetchNext: () => !props.onlyPrevious,
    shouldFetchPrevious: () => !props.onlyNext,
    shouldPreserveUrl: () => props.preserveUrl,

    // Elements
    getTriggerMargin: () => props.buffer,
    getStartElement: () => resolvedStartElement(),
    getEndElement: () => resolvedEndElement(),
    getItemsElement: () => resolvedItemsElement(),
    getScrollableParent: () => scrollableParent(),

    // Request callbacks
    onBeforePreviousRequest: () => setLoadingPrevious(true),
    onBeforeNextRequest: () => setLoadingNext(true),
    onCompletePreviousRequest: () => {
      batch(() => {
        setLoadingPrevious(false)
        setRequestCount(dataManager.getRequestCount())
      })

      setHasPrevious(dataManager.hasPrevious())
    },
    onCompleteNextRequest: () => {
      batch(() => {
        setLoadingNext(false)
        setRequestCount(dataManager.getRequestCount())
      })

      setHasNext(dataManager.hasNext())
    },
  })

  const [loadingPrevious, setLoadingPrevious] = createSignal(false)
  const [loadingNext, setLoadingNext] = createSignal(false)
  const [requestCount, setRequestCount] = createSignal(dataManager.getRequestCount())

  const [hasPrevious, setHasPrevious] = createSignal(dataManager.hasPrevious())
  const [hasNext, setHasNext] = createSignal(dataManager.hasNext())

  function scrollToBottom() {
    if (scrollableParent()) {
      scrollableParent().scrollTo({
        top: scrollableParent().scrollHeight,
        behavior: 'instant',
      })
    } else {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'instant',
      })
    }
  }

  onMount(() => {
    elementManager.setupObservers()
    elementManager.processServerLoadedElements(dataManager.getLastLoadedPage())

    const shouldAutoScroll = props.autoScroll !== undefined ? props.autoScroll : props.reverse

    if (shouldAutoScroll) {
      scrollToBottom()
    }

    if (autoLoad()) {
      elementManager.enableTriggers()
    }
  })

  createEffect(
    on(
      [autoLoad, () => props.onlyNext, () => props.onlyPrevious],
      ([autoLoad]) => {
        if (autoLoad) {
          elementManager.enableTriggers()
        } else {
          elementManager.disableTriggers()
        }
      },
      // We already enable triggers `onMount`, so don't re-run until the next change "after" mount.
      { defer: true },
    ),
  )

  const sharedExposed: Pick<
    InfiniteScrollActionSlotProps,
    'loadingPrevious' | 'loadingNext' | 'hasPrevious' | 'hasNext'
  > = {
    get loadingPrevious() {
      return loadingPrevious()
    },
    get loadingNext() {
      return loadingNext()
    },
    get hasPrevious() {
      return hasPrevious()
    },
    get hasNext() {
      return hasNext()
    },
  }

  const renderedChildren = children(() => [
    // Start Element
    createComponent(Show, {
      keyed: undefined,
      get when() {
        return !props.startElement
      },
      get children() {
        return createDynamic(() => 'div', {
          ref(el: HTMLElement) {
            setStartElementRef(el)
          },
          get children() {
            const headerAutoMode = createMemo(() => autoLoad() && !props.onlyNext)

            return createDynamic(
              () => (props.previous ? props.previous : props.loading && loadingPrevious() ? props.loading : undefined),
              mergeProps(
                {
                  get loading() {
                    return loadingPrevious()
                  },
                  fetch: dataManager?.fetchPrevious ?? (() => {}),
                  get autoMode() {
                    return headerAutoMode()
                  },
                  get manualMode() {
                    return !headerAutoMode()
                  },
                  get hasMore() {
                    return hasPrevious()
                  },
                },
                sharedExposed,
              ),
            )
          },
        })
      },
    }),

    // Children
    createDynamic(
      () => props.as,
      mergeProps(
        {
          ref(el: HTMLElement) {
            setItemsElementRef(el)
          },
          get children() {
            if (typeof props.children !== 'function') {
              return props.children
            }

            return props.children({
              get loading() {
                return loadingPrevious() || loadingNext()
              },
              get loadingPrevious() {
                return loadingPrevious()
              },
              get loadingNext() {
                return loadingNext()
              },
            })
          },
        },
        childrenProps,
      ),
    ),

    // End Element
    createComponent(Show, {
      keyed: undefined,
      get when() {
        return !props.endElement
      },
      get children() {
        return createDynamic(() => 'div', {
          ref(el: HTMLElement) {
            setEndElementRef(el)
          },
          get children() {
            const footerAutoMode = createMemo(() => autoLoad() && !props.onlyPrevious)

            return createDynamic(
              () => (props.next ? props.next : props.loading && loadingNext() ? props.loading : undefined),
              mergeProps(
                {
                  get loading() {
                    return loadingNext()
                  },
                  fetch: dataManager?.fetchNext ?? (() => {}),
                  get autoMode() {
                    return footerAutoMode()
                  },
                  get manualMode() {
                    return !footerAutoMode()
                  },
                  get hasMore() {
                    return hasNext()
                  },
                },
                sharedExposed,
              ),
            )
          },
        })
      },
    }),
  ])

  return createMemo(() => {
    const reverse = props.reverse

    return untrack(() => {
      if (reverse) {
        return renderedChildren.toArray().toReversed()
      }

      return renderedChildren()
    })
  })
}
