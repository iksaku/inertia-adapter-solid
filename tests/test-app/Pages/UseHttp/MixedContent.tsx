import { createSignal } from 'solid-js'
import { useHttp } from 'inertia-adapter-solid'
interface MixedContentResponse {
  success: boolean
  files: Array<{
    fieldname: string
    originalname: string
    mimetype: string
    size: number
  }>
  fileCount: number
  formData: Record<string, unknown>
}
export default () => {
  const mixedContent = useHttp<
    {
      title: string
      user: {
        name: string
        email: string
      }
      tags: string[]
      document?: File
    },
    MixedContentResponse
  >({
    title: '',
    user: {
      name: '',
      email: '',
    },
    tags: [],
    document: undefined,
  })
  const [lastMixedResponse, setLastMixedResponse] = createSignal<MixedContentResponse | null>(null)
  const handleMixedFileChange = (
    e: Event & {
      currentTarget: HTMLInputElement
    },
  ) => {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      mixedContent.setData('document', e.currentTarget.files[0])
    }
  }
  const performMixedContent = async () => {
    try {
      const result = await mixedContent.post('/api/mixed')
      setLastMixedResponse(result ?? null)
    } catch (e) {
      console.error('Mixed content failed:', e)
    }
  }
  return (
    <div>
      <h1>useHttp Mixed Content Test</h1>

      {/* Mixed Content Test (Files + Nested Data) */}
      <section id="mixed-test">
        <h2>Mixed Content (Files + Nested Data)</h2>
        <label>
          Title
          <input
            type="text"
            id="mixed-title"
            value={mixedContent.data.title}
            onInput={(e) => mixedContent.setData('title', e.currentTarget.value)}
          />
        </label>
        <label>
          User Name
          <input
            type="text"
            id="mixed-user-name"
            value={mixedContent.data.user.name}
            onInput={(e) => mixedContent.setData('user', { ...mixedContent.data.user, name: e.currentTarget.value })}
          />
        </label>
        <label>
          User Email
          <input
            type="email"
            id="mixed-user-email"
            value={mixedContent.data.user.email}
            onInput={(e) => mixedContent.setData('user', { ...mixedContent.data.user, email: e.currentTarget.value })}
          />
        </label>
        <label>
          Tags (comma-separated)
          <input
            type="text"
            id="mixed-tags"
            onInput={(e) =>
              mixedContent.setData(
                'tags',
                e.currentTarget.value.split(',').map((t) => t.trim()),
              )
            }
          />
        </label>
        <label>
          Document
          <input type="file" id="mixed-document" onInput={handleMixedFileChange} />
        </label>
        <button onClick={performMixedContent} id="mixed-button">
          Submit Mixed Content
        </button>
        {mixedContent.processing && <div id="mixed-processing">Submitting...</div>}
        {lastMixedResponse() && (
          <div id="mixed-result">
            Files: {lastMixedResponse()!.fileCount}
            {lastMixedResponse()!.files.length > 0 && (
              <span>
                {' '}
                (
                {lastMixedResponse()!
                  .files.map((f) => f.originalname)
                  .join(', ')}
                )
              </span>
            )}
            <br />
            Form Data: {JSON.stringify(lastMixedResponse()!.formData)}
          </div>
        )}
      </section>
    </div>
  )
}
