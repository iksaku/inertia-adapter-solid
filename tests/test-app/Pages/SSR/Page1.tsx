import { Link, usePage } from 'inertia-adapter-solid'
import { For } from 'solid-js'

export default function Page1(props: { user: { name: string; email: string }; items: string[]; count: number }) {
  const page = usePage()
  return <div>
    <h1 data-testid="ssr-title">SSR Page 1</h1>
    <p data-testid="page-url">URL: {page.url}</p>
    <div data-testid="user-info"><p data-testid="user-name">Name: {props.user.name}</p><p data-testid="user-email">Email: {props.user.email}</p></div>
    <ul data-testid="items-list"><For each={props.items}>{(item) => <li data-testid="item">{item}</li>}</For></ul>
    <p data-testid="count">Count: {props.count}</p>
    <Link href="/ssr/page2" data-testid="navigate-link">Navigate to another page</Link>
    <Link href="/ssr/when-mounted" data-testid="to-when-mounted-link">Navigate to WhenMounted page</Link>
  </div>
}
