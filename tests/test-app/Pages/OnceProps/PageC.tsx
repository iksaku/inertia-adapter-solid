import { Link } from 'inertia-adapter-solid'
export default function PageC() {
  return (
    <>
      <Link href="/once-props/page-a">Go to Page A</Link>
      <Link href="/once-props/page-b">Go to Page B</Link>
      <Link href="/once-props/page-d" prefetch="mount">
        Go to Page D
      </Link>
    </>
  )
}
