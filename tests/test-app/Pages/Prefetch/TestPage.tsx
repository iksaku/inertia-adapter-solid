import { Link } from 'inertia-adapter-solid'

export default function TestPage() {
  return (
    <div>
      <Link href="/prefetch/form" prefetch>
        Go to Prefetch Form
      </Link>
    </div>
  )
}
