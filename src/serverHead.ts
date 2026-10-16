import { createHeadManager } from '@inertiajs/core'
import { escape as escapeHtml } from 'es-toolkit/compat'
import type { DefaultTreeAdapterTypes } from 'parse5'

type HtmlNode = DefaultTreeAdapterTypes.Node
type HtmlElement = DefaultTreeAdapterTypes.Element

type HeadSlot = {
  order: number
  start: number
  end: number
  content: string
}

function isElement(node: HtmlNode): node is HtmlElement {
  return 'tagName' in node
}

function getAttribute(element: HtmlElement, name: string): string | undefined {
  return element.attrs.find((attribute) => attribute.name === name)?.value
}

function collectSlots(html: string, root: HtmlNode): HeadSlot[] {
  const slots: HeadSlot[] = []

  function visit(node: HtmlNode): void {
    if (isElement(node) && node.tagName === 'template' && getAttribute(node, 'data-inertia-head') !== undefined) {
      const location = node.sourceCodeLocation

      if (!location?.startTag || !location.endTag) {
        throw new Error('An Inertia <Head> SSR marker is missing its closing tag.')
      }

      slots.push({
        order: Number(getAttribute(node, 'data-inertia-head')),
        start: location.startOffset,
        end: location.endOffset,
        content: html.slice(location.startTag.endOffset, location.endTag.startOffset),
      })

      return
    }

    if ('childNodes' in node) {
      for (const child of node.childNodes) {
        visit(child)
      }
    }

    if ('content' in node) {
      for (const child of node.content.childNodes) {
        visit(child)
      }
    }
  }

  visit(root)
  return slots.sort((a, b) => a.start - b.start)
}

function serializeTag(source: string, element: HtmlElement): string {
  const location = element.sourceCodeLocation

  if (!location?.startTag) {
    throw new Error('A <Head> child could not be serialized from the SSR output.')
  }

  const start = location.startTag
  let openingTag = source.slice(start.startOffset, start.endOffset)
  const removedAttributes = ['data-hk', 'head-key', 'data-inertia']
    .map((name) => location.attrs?.[name])
    .filter((attributeLocation) => attributeLocation !== undefined)
    .sort((a, b) => b.startOffset - a.startOffset)

  for (const attribute of removedAttributes) {
    openingTag =
      openingTag.slice(0, attribute.startOffset - start.startOffset) +
      openingTag.slice(attribute.endOffset - start.startOffset)
  }

  const key = getAttribute(element, 'head-key') ?? ''
  openingTag = openingTag.replace(
    /^(<[a-zA-Z][^\s/>]*)/,
    (_match, prefix: string) => `${prefix} data-inertia="${escapeHtml(key)}"`,
  )

  return openingTag + source.slice(start.endOffset, location.endOffset)
}

function serializeSlot(
  content: string,
  title: string | undefined,
  parseFragment: typeof import('parse5').parseFragment,
): string[] {
  const elements: string[] = []
  let hasTitleChild = false
  const fragment = parseFragment(content, { sourceCodeLocationInfo: true })

  for (const child of fragment.childNodes) {
    if (!isElement(child)) {
      continue
    }

    if (child.tagName === 'template' && getAttribute(child, 'data-inertia-head') !== undefined) {
      throw new Error('An Inertia <Head> cannot be nested inside another <Head>.')
    }

    hasTitleChild ||= child.tagName === 'title'
    elements.push(serializeTag(content, child))
  }

  if (title && !hasTitleChild) {
    elements.push(`<title data-inertia="">${escapeHtml(title)}</title>`)
  }

  return elements
}

export async function extractHead(
  html: string,
  titleCallback: (title: string) => string,
  titles: ReadonlyMap<number, string | undefined>,
  initialServerHead: string[],
): Promise<{ body: string; head: string[]; assets: string }> {
  // Parse only after SSR. This keeps parse5 out of the browser execution path.
  const { parse, parseFragment } = await import('parse5')
  const root = parse(html, { sourceCodeLocationInfo: true })
  const assetLocation = root.childNodes
    .filter(isElement)
    .find((node) => node.tagName === 'html')
    ?.childNodes.filter(isElement)
    .find((node) => node.tagName === 'head')?.sourceCodeLocation

  if (!assetLocation?.startTag || !assetLocation.endTag) {
    throw new Error("The Solid SSR renderer must preserve the adapter's head asset boundary.")
  }

  // Parsers can reopen head for later templates. Its explicit closing tag,
  // rather than the element's expanded endOffset, delimits Solid's assets.
  const assetEnd = assetLocation.endTag.endOffset
  const assets = html.slice(assetLocation.startTag.endOffset, assetLocation.endTag.startOffset)
  const slots = collectSlots(html, root).filter((slot) => slot.start >= assetEnd)
  let head: string[] = []
  const manager = createHeadManager(
    true,
    titleCallback,
    (elements) => {
      head = elements
    },
    initialServerHead,
  )

  // Core precedence follows provider creation, which can differ from body order.
  for (const slot of [...slots].sort((a, b) => a.order - b.order)) {
    manager.createProvider().update(serializeSlot(slot.content, titles.get(slot.order), parseFragment))
  }

  let cursor = assetEnd
  let body = ''

  for (const slot of slots) {
    body += html.slice(cursor, slot.start)
    cursor = slot.end
  }

  body += html.slice(cursor)

  return { body, head, assets }
}
