import { Link, usePage } from 'inertia-adapter-solid'
import Child from './Child'

export default function Page2(props: { title: string }) {
  const pageA = usePage<{ title: string }>()
  const pageB = usePage()
  return (
    <div>
      <h2>Page 2</h2>
      <p data-testid="title-props">
        Title (props): <strong>{props.title}</strong>
      </p>
      <p data-testid="title-usepage">
        Title (usePage): <strong>{pageA.props.title}</strong>
      </p>
      <p data-testid="url">URL: {pageA.url}</p>
      <p data-testid="same-ref">
        usePage() same instance: <strong>{pageA === pageB ? 'yes' : 'no'}</strong>
      </p>
      <hr />
      <Child parentPage={pageA} />
      <hr />
      <Link data-testid="go-page1" href="/use-page/page1">
        Go to Page 1
      </Link>
    </div>
  )
}
