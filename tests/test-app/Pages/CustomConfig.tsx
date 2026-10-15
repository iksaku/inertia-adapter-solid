import { config, Link, useForm, usePage } from 'inertia-adapter-solid'
import { Show } from 'solid-js'
import type { VisitOptions } from '@inertiajs/core'
export default function CustomConfig() {
  const page = usePage()
  const form = useForm({})
  config.set({ 'form.recentlySuccessfulDuration': 1000, 'prefetch.cacheFor': '2s' })
  config.set('visitOptions', (href: string, options: VisitOptions) => href === '/dump/post' ? { headers: { ...options.headers, 'X-From-Callback': 'bar' } } : {})
  return <div><Link prefetch href="/dump/get">Prefetch Link</Link>
    <Link method="post" headers={{ 'X-From-Link': 'foo' }} href="/dump/post">Post Dump</Link>
    <button onClick={() => form.post(page.url)}>Submit Form</button>
    <Show when={form.recentlySuccessful}><p>Form was recently successful!</p></Show>
  </div>
}
