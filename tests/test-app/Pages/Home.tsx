import { Title } from '@solidjs/meta'
import { Link, router } from 'inertia-adapter-solid'

export default function Home(props: { example?: string }) {
  window._inertia_props = props
  const visit = (url: string, method: 'get' | 'post' = 'get') => (event: MouseEvent) => {
    event.preventDefault()
    router[method](url)
  }
  return <>
    <Title>Home</Title>
    <span class="text">This is the Test App Entrypoint page</span>
    <Link href="/links/method" class="links-method">Basic Links</Link>
    <Link href="/links/replace" class="links-replace">'Replace' Links</Link>
    <Link href="/links/as-component" class="links-as-component">As Component</Link>
    <Link href="/links/as-element" class="links-as-component">As Element</Link>
    <a href="#" onClick={visit('/visits/method')} class="visits-method">Manual basic visits</a>
    <a href="#" onClick={visit('/visits/replace')} class="visits-replace">Manual 'Replace' visits</a>
    <Link href="/redirect" method="post" class="links-redirect">Internal Redirect Link</Link>
    <a href="#" onClick={visit('/redirect', 'post')} class="visits-redirect">Manual Redirect visit</a>
    <Link href="/redirect-external" method="post" class="links-redirect-external">External Redirect Link</Link>
    <a href="#" onClick={visit('/redirect-external', 'post')} class="visits-redirect-external">Manual External Redirect visit</a>
    <a href="#" onClick={visit('/redirect-hash')} class="visits-redirect-hash">Manual Hash Redirect visit</a>
    <a href="#" onClick={visit('/redirect-hash', 'post')} class="visits-redirect-hash-post">Manual Hash Redirect POST visit</a>
    <Link id="navigate-back" href="/head/mixed">Go to Mixed Head</Link>
    <Link href="/links/as-element" class="link-targets-self" target="_self">Target _self</Link>
    <Link href="/links/as-element" class="link-targets-blank" target="_blank">Target _blank</Link>
  </>
}
