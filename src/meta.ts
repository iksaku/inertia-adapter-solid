/**
 * Original code by Ryan Carniato.
 *
 * Credits to the SolidJs team:
 * https://github.com/solidjs/solid-meta/blob/main/src/index.tsx
 */

import { escape } from 'solid-js/web'

interface TagDescription {
  tag: string
  props: Record<string, unknown>
  setting?: {
    escape?: boolean
  }
  id: string
  name?: string
  ref?: Element
}

// Render tags and return as an array instead of joining as a string
export function renderTags(tags: Array<TagDescription>): string[] {
  return tags.map((tag) => {
    const keys = Object.keys(tag.props) // @ts-expect-error

    const props = keys.map((k) => (k === 'children' ? '' : ` ${k}="${escape(tag.props[k], true)}"`)).join('')

    if (tag.props.children) {
      // Tags might contain multiple text children:
      //   <Title>example - {myCompany}</Title>
      const children = Array.isArray(tag.props.children) ? tag.props.children.join('') : tag.props.children

      if (tag.setting?.escape && typeof children === 'string') {
        return `<${tag.tag} data-sm="${tag.id}"${props}>${escape(children)}</${tag.tag}>`
      }

      return `<${tag.tag} data-sm="${tag.id}"${props}>${children}</${tag.tag}>`
    }

    return `<${tag.tag} data-sm="${tag.id}"${props}/>`
  })
}
