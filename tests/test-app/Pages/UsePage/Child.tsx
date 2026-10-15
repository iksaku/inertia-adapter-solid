import { usePage } from 'inertia-adapter-solid'

export default function Child(props: { parentPage: object }) {
  const page = usePage()
  return (
    <div>
      <p>
        <em>From child component:</em>
      </p>
      <p data-testid="child-url">URL: {page.url}</p>
      <p data-testid="child-component">Component: {page.component}</p>
      <p data-testid="child-same-ref">
        Same instance as parent: <strong>{page === props.parentPage ? 'yes' : 'no'}</strong>
      </p>
    </div>
  )
}
