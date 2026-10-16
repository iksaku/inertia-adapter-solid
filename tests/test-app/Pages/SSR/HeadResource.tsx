import { Head } from 'inertia-adapter-solid'
import { Suspense, createResource, createSignal } from 'solid-js'
import { isServer } from 'solid-js/web'

export default function HeadResource() {
  const [id, setId] = createSignal('A')
  const [fetches, setFetches] = createSignal(0)
  const ArticleHead = (props: { id: string }) => {
    const [article] = createResource(
      () => props.id,
      (id) => {
        if (!isServer) setFetches((count) => count + 1)
        return Promise.resolve(`${isServer ? 'Server' : 'Client'} ${id}`)
      },
    )
    return (
      <Suspense>
        <Head title={article()}>
          <meta name="article" content={article()} head-key="article" />
        </Head>
      </Suspense>
    )
  }
  return (
    <>
      <ArticleHead id={id()} />
      <output data-testid="resource-fetches">{fetches()}</output>
      <button type="button" onClick={() => setId('B')}>
        Next article
      </button>
    </>
  )
}
