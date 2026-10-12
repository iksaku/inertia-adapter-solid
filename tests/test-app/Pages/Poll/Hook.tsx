import { Link, usePoll } from 'inertia-adapter-solid'

export default function Hook() {
  usePoll(500, {
    only: ['custom_prop'],
    onFinish() {
      console.log('hook poll finished')
    },
  })
  return <Link href="/">Home</Link>
}
