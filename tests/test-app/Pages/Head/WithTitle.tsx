import { Head } from 'inertia-adapter-solid'
export default () => (
  <>
    <Head>
      <title>Title from Children</title>
      <meta name="description" content="Title set via children, not prop" />
    </Head>
    <h1>Title in Children</h1>
  </>
)
