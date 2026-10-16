import { Head } from 'inertia-adapter-solid'
export default (props: { title: string }) => (
  <>
    <Head title={props.title} />
    <p>Head title escaping test</p>
  </>
)
