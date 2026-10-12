import { Link, usePage } from 'inertia-adapter-solid'
import Child from './Child'

export default function Page1(props: { name: string }) {
  const pageA = usePage<{ name: string }>()
  const pageB = usePage()
  return (
    <div>
      <h2>Page 1</h2>
      <p data-testid="name-props">
        Name (props): <strong>{props.name}</strong>
      </p>
      <p data-testid="name-usepage">
        Name (usePage): <strong>{pageA.props.name}</strong>
      </p>
      <p data-testid="url">URL: {pageA.url}</p>
      <p data-testid="same-ref">
        usePage() same instance: <strong>{pageA === pageB ? 'yes' : 'no'}</strong>
      </p>
      <hr />
      <Child parentPage={pageA} />
      <hr />
      <Link data-testid="go-page2" href="/use-page/page2">
        Go to Page 2
      </Link>
    </div>
  )
}
