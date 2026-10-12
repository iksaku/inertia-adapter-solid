import { createSignal } from 'solid-js'
import { useHttp } from 'inertia-adapter-solid'
interface UploadResponse {
  success: boolean
  files: Array<{
    fieldname: string
    originalname: string
    mimetype: string
    size: number
  }>
  fileCount: number
  formData: Record<string, string>
}
export default () => {
  const fileUpload = useHttp<
    {
      description: string
      file?: File
      files?: File[]
    },
    UploadResponse
  >({
    description: '',
    file: undefined,
    files: undefined,
  })
  const [lastUploadResponse, setLastUploadResponse] = createSignal<UploadResponse | null>(null)
  const [uploadProgress, setUploadProgress] = createSignal<number | null>(null)
  const handleFileChange = (
    e: Event & {
      currentTarget: HTMLInputElement
    },
  ) => {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      fileUpload.setData('file', e.currentTarget.files[0])
    }
  }
  const handleMultipleFilesChange = (
    e: Event & {
      currentTarget: HTMLInputElement
    },
  ) => {
    if (e.currentTarget.files) {
      fileUpload.setData('files', Array.from(e.currentTarget.files))
    }
  }
  const performUpload = async () => {
    setUploadProgress(null)
    try {
      const result = await fileUpload.post('/api/upload', {
        onProgress: (progress) => {
          setUploadProgress(progress.percentage ?? null)
        },
      })
      setLastUploadResponse(result ?? null)
    } catch (e) {
      console.error('Upload failed:', e)
    }
  }
  return (
    <div>
      <h1>useHttp File Upload Test</h1>

      {/* File Upload Test */}
      <section id="upload-test">
        <h2>File Upload</h2>
        <label>
          Description
          <input
            type="text"
            id="upload-description"
            value={fileUpload.data.description}
            onInput={(e) => fileUpload.setData('description', e.currentTarget.value)}
          />
        </label>
        <label>
          Single File
          <input type="file" id="upload-file" onInput={handleFileChange} />
        </label>
        <label>
          Multiple Files
          <input type="file" id="upload-files" multiple onInput={handleMultipleFilesChange} />
        </label>
        <button onClick={performUpload} id="upload-button">
          Upload
        </button>
        {fileUpload.processing && <div id="upload-processing">Uploading...</div>}
        {uploadProgress() !== null && <div id="upload-progress">Progress: {uploadProgress()}%</div>}
        {lastUploadResponse() && (
          <div id="upload-result">
            Upload Success - Files: {lastUploadResponse()!.fileCount}
            {lastUploadResponse()!.files.length > 0 && (
              <span>
                {' '}
                -{' '}
                {lastUploadResponse()!
                  .files.map((f) => f.originalname)
                  .join(', ')}
              </span>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
