import { createContext, createSignal, onMount, Show, useContext } from 'solid-js'
import { usePage } from 'inertia-adapter-solid'
export const WithAppContext = createContext({ injected: 'not-injected', ssr: false })
export default function WithApp() {
  const value = useContext(WithAppContext)
  const page = usePage<{ locale: string }>()
  const [mounted, setMounted] = createSignal(false)
  onMount(() => setMounted(true))
  return (
    <div>
      <h1 data-testid="with-app-title">SSR WithApp</h1>
      <p data-testid="with-app-value">Value: {value.injected}</p>
      <p data-testid="with-app-locale">Locale: {page.props.locale}</p>
      <p data-testid="with-app-component">Component: {page.component}</p>
      <p data-testid="with-app-ssr">SSR: {String(value.ssr)}</p>
      <Show when={mounted()}>
        <p data-testid="with-app-csr">CSR option: {String(value.ssr)}</p>
      </Show>
    </div>
  )
}
