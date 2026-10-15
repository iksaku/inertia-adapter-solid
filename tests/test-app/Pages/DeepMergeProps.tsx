import { router } from 'inertia-adapter-solid'
import { createSignal } from 'solid-js'

type Props = {
  bar: number[]
  baz: number[]
  foo: { page: number; data: number[]; per_page: number; meta: { label: string } }
}
export default function Merge(props: Props) {
  const [page, setPage] = createSignal(props.foo.page)
  const reload = () =>
    router.reload({
      data: { page: page() },
      only: ['foo', 'baz'],
      onSuccess(visit) {
        setPage((visit.props as unknown as Props).foo.page)
      },
    })
  const fresh = () => {
    setPage(0)
    router.visit('/deep-merge-props', { reset: ['foo', 'baz'] })
  }
  return (
    <>
      <div>bar count is {props.bar.length}</div>
      <div>baz count is {props.baz.length}</div>
      <div>foo.data count is {props.foo.data.length}</div>
      <div>foo.page is {props.foo.page}</div>
      <div>foo.per_page is {props.foo.per_page}</div>
      <div>foo.meta.label is {props.foo.meta.label}</div>
      <button onClick={reload}>Reload</button>
      <button onClick={fresh}>Get Fresh</button>
    </>
  )
}
