import { JSX, ParentComponent, Show, createComponent, createMemo, mergeProps, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'

export default function DynamicLayout<P = {}>(_props: P & { _component: JSX.Element; _layouts: ParentComponent<P>[] }) {
  const [p, props] = splitProps(_props, ['_component', '_layouts'])

  const current = createMemo(() => p._layouts[0])
  const rest = createMemo(() => p._layouts.slice(1))

  const children = createComponent(Show, {
    keyed: undefined,
    get when() {
      return rest().length > 0
    },
    get fallback() {
      return p._component
    },
    get children() {
      return createComponent(
        // @ts-ignore
        DynamicLayout,
        mergeProps(
          {
            get _layouts() {
              return rest()
            },
            _component: p._component,
          },
          () => props,
        ),
      )
    },
  })

  return createComponent(
    // @ts-ignore
    Dynamic,
    mergeProps(
      {
        get component() {
          return current()
        },
        children,
      },
      () => props,
    ),
  )
}
