import { router } from 'inertia-adapter-solid'

export default function Merge(props: {
  users: { data: { id: number; name: string }[]; meta: { page: number; perPage: number } }
}) {
  return (
    <div>
      <p id="users">{props.users.data.map((user) => user.name).join(', ')}</p>
      <p id="meta">
        Page: {props.users.meta.page}, Per Page: {props.users.meta.perPage}
      </p>
      <button onClick={() => router.reload({ only: ['users'], data: { page: props.users.meta.page + 1 } })}>
        Load More
      </button>
    </div>
  )
}
