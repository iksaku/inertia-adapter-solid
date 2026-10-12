import { createContext, useContext } from 'solid-js'
import { usePage } from 'inertia-adapter-solid'
export const WithAppContext = createContext({ injected: 'not-injected', ssr: false })
export default function WithApp() {
  const value = useContext(WithAppContext)
  const page = usePage<{ locale: string }>()
  return <div>
    <h1 data-testid="with-app-title">SSR WithApp</h1>
    <p data-testid="with-app-value">Value: {value.injected}</p>
    <p data-testid="with-app-locale">Locale: {page.props.locale}</p>
    <p data-testid="with-app-component">Component: {page.component}</p>
    <p data-testid="with-app-ssr">SSR: {String(value.ssr)}</p>
  </div>
}
