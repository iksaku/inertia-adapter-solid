import { http } from 'inertia-adapter-solid'
declare global {
  interface Window {
    _raw_body_response?: any
  }
}
export default () => {
  const send = async (data: unknown, headers?: Record<string, string>) => {
    const response = await http.getClient().request({
      method: 'post',
      url: '/api/raw-body',
      data,
      headers,
    })
    window._raw_body_response = JSON.parse(response.data)
  }
  const urlSearchParamsMethod = async (e: MouseEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    params.append('foo', 'bar')
    await send(params)
  }
  const stringMethod = async (e: MouseEvent) => {
    e.preventDefault()
    await send('raw string contents', { 'Content-Type': 'text/plain' })
  }
  const blobMethod = async (e: MouseEvent) => {
    e.preventDefault()
    const blob = new Blob(['raw blob contents'], { type: 'text/plain' })
    await send(blob)
  }
  const arrayBufferMethod = async (e: MouseEvent) => {
    e.preventDefault()
    const buffer = new TextEncoder().encode('raw array buffer contents').buffer
    await send(buffer)
  }
  const arrayBufferViewMethod = async (e: MouseEvent) => {
    e.preventDefault()
    const bytes = new TextEncoder().encode('raw array buffer view contents')
    await send(bytes)
  }
  return (
    <div>
      <span class="text">This is the page that demonstrates HTTP client raw request bodies</span>

      <a href="#" onClick={urlSearchParamsMethod} class="url-search-params">
        URLSearchParams Link
      </a>
      <a href="#" onClick={stringMethod} class="string">
        String Link
      </a>
      <a href="#" onClick={blobMethod} class="blob">
        Blob Link
      </a>
      <a href="#" onClick={arrayBufferMethod} class="array-buffer">
        ArrayBuffer Link
      </a>
      <a href="#" onClick={arrayBufferViewMethod} class="array-buffer-view">
        ArrayBufferView Link
      </a>
    </div>
  )
}
