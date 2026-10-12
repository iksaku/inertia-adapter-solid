import { Deferred, usePage } from 'inertia-adapter-solid'
export default function WithQueryParams() {
  const page = usePage<{ filter: string; users?: { text: string } }>()
  return (
    <>
      <div>Filter: {page.props.filter}</div>
      <Deferred data="users" fallback={<div>Loading users...</div>}>
        <div>{page.props.users?.text}</div>
      </Deferred>
    </>
  )
}
