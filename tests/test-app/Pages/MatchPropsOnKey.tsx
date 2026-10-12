import { router } from 'inertia-adapter-solid'
import { createSignal } from 'solid-js'

type Item = { name: string }
type Props = {
  bar: number[]
  baz: number[]
  foo: { page: number; data: Item[]; companies: Item[]; teams: Item[]; per_page: number; meta: { label: string } }
}
export default function Merge(props: Props) {
  const [page, setPage] = createSignal(props.foo.page)
  const reload = () =>
    router.visit('/match-props-on-key', {
      data: { page: page() },
      only: ['foo', 'baz'],
      onSuccess(visit) {
        setPage((visit.props as unknown as Props).foo.page)
      },
    })
  const fresh = () => {
    setPage(0)
    router.visit('/match-props-on-key', { reset: ['foo', 'baz'] })
  }
  return (
    <>
      <div>bar count is {props.bar.length}</div>
      <div>baz count is {props.baz.length}</div>
      <div>foo.data count is {props.foo.data.length}</div>
      <div>first foo.data name is {props.foo.data[0].name}</div>
      <div>last foo.data name is {props.foo.data[props.foo.data.length - 1].name}</div>
      <div>foo.companies count is {props.foo.companies.length}</div>
      <div>first foo.companies name is {props.foo.companies[0].name}</div>
      <div>last foo.companies name is {props.foo.companies[props.foo.companies.length - 1].name}</div>
      <div>foo.teams count is {props.foo.teams.length}</div>
      <div>first foo.teams name is {props.foo.teams[0].name}</div>
      <div>last foo.teams name is {props.foo.teams[props.foo.teams.length - 1].name}</div>
      <div>foo.page is {props.foo.page}</div>
      <div>foo.per_page is {props.foo.per_page}</div>
      <div>foo.meta.label is {props.foo.meta.label}</div>
      <button onClick={reload}>Reload</button>
      <button onClick={fresh}>Get Fresh</button>
    </>
  )
}
