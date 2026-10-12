import { useForm } from 'inertia-adapter-solid'
export default () => {
  const form = useForm('set-data-then-post-remember', { code: 'initial', name: 'initial-name' })
  const handleSetAndPost = () => {
    form.setData('code', 'remembered-code')
    form.post('/dump/post')
  }
  return (
    <div>
      <span id="current-code">{form.data.code}</span>
      <button onClick={handleSetAndPost} class="set-and-post">
        Set and POST
      </button>
    </div>
  )
}
