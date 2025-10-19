import {
  type InfiniteScrollActionSlotProps,
  type InfiniteScrollComponentBaseProps,
  getScrollableParent,
  useInfiniteScroll,
} from '@inertiajs/core'
import { createLazyMemo } from '@solid-primitives/memo'
import {
  type Component,
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
  onCleanup,
  onMount,
  splitProps,
  untrack,
} from 'solid-js'
import { createDynamic } from 'solid-js/web'

type InfiniteScrollRef = `#${string}` | HTMLElement | (() => HTMLElement | null | undefined)

type SlotComponent<TProps = unknown> = (string & {}) | Component<TProps>

type InfiniteScrollProps = Omit<InfiniteScrollComponentBaseProps, 'as'> & {
  as?: keyof JSX.IntrinsicElements

  itemsElement?: InfiniteScrollRef
  startElement?: InfiniteScrollRef
  endElement?: InfiniteScrollRef

  // Children Slots
  loading?: SlotComponent<InfiniteScrollActionSlotProps>
  previous?: SlotComponent<InfiniteScrollActionSlotProps>
  next?: SlotComponent<InfiniteScrollActionSlotProps>
  children: JSX.Element | Component
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

export default function InfiniteScroll(_props: InfiniteScrollProps) {
  const [props, attributes] = splitProps(
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

  let itemsElementRef: HTMLElement
  let startElementRef: HTMLElement
  let endElementRef: HTMLElement

  const resolvedItemsElement = createLazyMemo(() => resolveHTMLElement(props.itemsElement, itemsElementRef))
  const resolvedStartElement = createLazyMemo(() => resolveHTMLElement(props.startElement, startElementRef))
  const resolvedEndElement = createLazyMemo(() => resolveHTMLElement(props.endElement, endElementRef))

  const scrollableParent = createLazyMemo(() => getScrollableParent(resolvedItemsElement()))

  const {
    dataManager,
    elementManager,
    flush: flushInfiniteScroll,
  } = useInfiniteScroll({
    // Data
    getPropName: () => props.data,
    inReverseMode: () => props.reverse,
    shouldFetchNext: () => !props.onlyPrevious,
    shouldFetchPrevious: () => !props.onlyNext,
    shouldPreserveUrl: () => props.preserveUrl,

    // Elements
    getTriggerMargin: () => props.buffer,
    getStartElement: resolvedStartElement,
    getEndElement: resolvedEndElement,
    getItemsElement: resolvedItemsElement,
    getScrollableParent: scrollableParent,

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

  const manualMode = createMemo(() => props.manual || (props.manualAfter > 0 && requestCount() >= props.manualAfter))
  const autoLoad = createMemo(() => !manualMode())

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

    // autoScroll defaults to reverse value if not explicitly set
    const shouldAutoScroll = props.autoScroll ?? props.reverse

    if (shouldAutoScroll) {
      scrollToBottom()
    }

    if (autoLoad()) {
      elementManager.enableTriggers()
    }
  })

  onCleanup(() => {
    flushInfiniteScroll()
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
    createBoundaryElement(
      mergeProps(
        {
          get when() {
            return !props.startElement
          },
          get component() {
            return props.previous || (props.loading && loadingPrevious()) ? props.loading : undefined
          },
          ref(el: HTMLElement) {
            startElementRef = el
          },
          get autoMode() {
            return autoLoad() && !props.onlyNext
          },
          get loading() {
            return loadingPrevious()
          },
          fetch: dataManager?.fetchPrevious ?? (() => {}),
          get hasMore() {
            return hasPrevious()
          },
        },
        sharedExposed,
      ),
    ),

    // Children
    createDynamic(
      () => props.as,
      mergeProps(
        {
          ref(el: HTMLElement) {
            itemsElementRef = el
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
        attributes,
      ),
    ),

    // End Element
    createBoundaryElement(
      mergeProps(
        {
          get when() {
            return !props.endElement
          },
          get component() {
            return props.next || (props.loading && loadingNext()) ? props.loading : undefined
          },
          ref(el: HTMLElement) {
            endElementRef = el
          },
          get autoMode() {
            return autoLoad() && !props.onlyPrevious
          },
          get loading() {
            return loadingNext()
          },
          fetch: dataManager?.fetchNext ?? (() => {}),
          get hasMore() {
            return hasNext()
          },
        },
        sharedExposed,
      ),
    ),
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

function createBoundaryElement(
  _props: {
    when: boolean
    component?: SlotComponent<InfiniteScrollActionSlotProps>
    ref(el: HTMLElement): void
  } & Omit<InfiniteScrollActionSlotProps, 'manualMode'>,
) {
  const [control, props] = splitProps(_props, ['when', 'component', 'ref'])

  return createComponent(Show, {
    keyed: undefined,
    get when() {
      return control.when
    },
    get children() {
      return createDynamic(() => 'div', {
        ref: control.ref,
        get children() {
          return createDynamic(
            () => control.component,
            mergeProps(props, {
              get manualMode() {
                return !props.autoMode
              },
            }),
          )
        },
      })
    },
  })
}
