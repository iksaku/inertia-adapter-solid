import { Show } from 'solid-js'
import { Link } from 'inertia-adapter-solid'
export default (props0: {
  title: string
  token?: string
}) => {
  return (
    <>
      <Link href="/encrypted-history/public">Public page</Link>
      <Link href="/encrypted-history/private">Private page</Link>
      <Link href="/encrypted-history/logout">Log out</Link>

      <h1>{props0.title}</h1>

      <Show when={props0.token}>
        {
          <div>
            Token: <span id="token">{props0.token}</span>
          </div>
        }
      </Show>
    </>
  )
}
