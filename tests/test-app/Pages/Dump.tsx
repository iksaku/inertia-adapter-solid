import type { Method } from '@inertiajs/core'
import { usePage } from 'inertia-adapter-solid'
import { createEffect, createMemo } from 'solid-js'
import type { MulterFile } from '../types'

export default function Dump(props: {
  headers: Record<string, string>
  method: Method
  form: Record<string, unknown>
  query: Record<string, unknown>
  url: string
  files: MulterFile[] | object
}) {
  const page = usePage()
  const dump = createMemo(() => ({
    headers: props.headers,
    method: props.method,
    form: props.form,
    files: props.files || {},
    query: props.query,
    url: props.url,
    $page: page,
  }))
  createEffect(() => { window._inertia_request_dump = dump() })
  return <div>
    <div class="text">This is Inertia page component containing a data dump of the request</div>
    <hr />
    <pre class="dump">{JSON.stringify(dump(), null, 2)}</pre>
  </div>
}
