import { escape as escapeHtml } from 'es-toolkit/compat'
import {
  type JSX,
  type ParentProps,
  children,
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  useContext,
} from 'solid-js'
import { insert, ssrElement } from 'solid-js/web'
import { useHeadManager } from './HeadContext'

export type InertiaHeadProps = ParentProps<{
  title?: string
}>

const HeadChildrenContext = createContext(false)

const unaryTags = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]

function renderTag(element: Element): string {
  const tag = element.tagName.toLowerCase()
  let html = `<${tag}`

  for (const attr of element.attributes) {
    if (attr.name === 'head-key' || attr.name === 'data-inertia' || attr.name === 'data-hk') {
      continue
    }

    html += attr.value === '' ? ` ${attr.name}` : ` ${attr.name}="${escapeHtml(attr.value)}"`
  }

  // `head-key` maps to the `data-inertia` attribute `@inertiajs/core` dedups on.
  html += ` data-inertia="${escapeHtml(element.getAttribute('head-key') ?? '')}">`

  if (unaryTags.includes(tag)) {
    return html
  }

  return `${html}${element.innerHTML}</${tag}>`
}

function addTitleElement(elements: string[], title?: string): string[] {
  if (title && !elements.some((tag) => /^<title(?:\s|>)/.test(tag))) {
    elements.push(`<title data-inertia="">${escapeHtml(title)}</title>`)
  }

  return elements
}

export default function Head(props: InertiaHeadProps) {
  if (useContext(HeadChildrenContext)) {
    throw new Error('An Inertia <Head> cannot be nested inside another <Head>.')
  }

  const manager = useHeadManager()
  const childProps = {
    value: true,
    get children() {
      return props.children
    },
  }
  if ('register' in manager) {
    // Keep head children in Solid's render until Suspense has settled. The
    // adapter extracts these templates from the completed HTML before returning it.
    return ssrElement(
      'template',
      {
        'data-inertia-head': manager.register(() => props.title),
        get children() {
          return HeadChildrenContext.Provider(childProps)
        },
      },
      undefined,
      false,
    ) as unknown as JSX.Element
  }

  const provider = manager.createProvider()
  const container = document.createElement('div')
  const [revision, setRevision] = createSignal(0)

  // Head children live outside the app's hydration root. Resolve them once
  // hydration has finished, while retaining this component's reactive owner.
  onMount(() => {
    const resolved = children(() => HeadChildrenContext.Provider(childProps))
    insert(container, () => resolved.toArray())
  })

  const update = () => {
    const elements = Array.from(container.childNodes)
      .filter((node): node is Element => node.nodeType === Node.ELEMENT_NODE)
      .map(renderTag)

    provider.update(addTitleElement(elements, props.title))
  }

  const observer = new MutationObserver(() => setRevision((value) => value + 1))
  observer.observe(container, { childList: true, subtree: true, characterData: true, attributes: true })

  // Both DOM changes and the direct title prop publish through an owned effect.
  createEffect(() => {
    revision()
    update()
  })

  onCleanup(() => {
    observer.disconnect()
    provider.disconnect()
  })

  return null
}
