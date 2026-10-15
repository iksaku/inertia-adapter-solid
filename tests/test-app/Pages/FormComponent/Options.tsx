import { createSignal, createMemo } from 'solid-js'
import type { Method, QueryStringArrayFormatOption } from '@inertiajs/core'
import { Form } from 'inertia-adapter-solid'
import Article from './../Article'
export default () => {
  const [only, setOnlyValues] = createSignal<string[]>([])
  const [except, setExceptValues] = createSignal<string[]>([])
  const [reset, setResetValues] = createSignal<string[]>([])
  const [replace, setReplace] = createSignal(false)
  const [state, setState] = createSignal('Default State')
  const [preserveScroll, setPreserveScroll] = createSignal(false)
  const [preserveState, setPreserveState] = createSignal(false)
  const [preserveUrl, setPreserveUrl] = createSignal(false)
  const [queryStringArrayFormat, setQueryStringArrayFormat] = createSignal<QueryStringArrayFormatOption | undefined>(
    undefined,
  )
  function setOnly() {
    setOnlyValues(['users'])
  }
  function setExcept() {
    setExceptValues(['stats'])
  }
  function setReset() {
    setResetValues(['orders'])
  }
  function enableReplace() {
    setReplace(true)
  }
  function enablePreserveScroll() {
    setPreserveScroll(true)
  }
  function enablePreserveState() {
    setPreserveState(true)
    setState('Replaced State')
  }
  function enablePreserveUrl() {
    setPreserveUrl(true)
  }
  const action = createMemo(() => {
    if (preserveScroll()) {
      return '/article'
    }
    if (preserveState()) {
      return '/form-component/options'
    }
    if (preserveUrl()) {
      return '/form-component/options?page=2'
    }
    return queryStringArrayFormat() ? '/dump/get' : '/dump/post'
  })
  const method = createMemo((): Method => {
    if (preserveScroll() || preserveState() || preserveUrl()) {
      return 'get'
    }
    return queryStringArrayFormat() ? 'get' : 'post'
  })
  return (
    <Form
      action={action()}
      method={method()}
      options={{
        only: only(),
        except: except(),
        reset: reset(),
        replace: replace(),
        preserveScroll: preserveScroll(),
        preserveState: preserveState(),
        preserveUrl: preserveUrl(),
      }}
      queryStringArrayFormat={queryStringArrayFormat()}
    >
      {() => (
        <>
          <h1>Form Options</h1>

          <input type="text" name="tags[]" value="alpha" readOnly />
          <input type="text" name="tags[]" value="beta" readOnly />

          <div>
            State: <span id="state">{state()}</span>
          </div>

          <div>
            <button type="button" onClick={setOnly}>
              Set Only (users)
            </button>
            <button type="button" onClick={setExcept}>
              Set Except (stats)
            </button>
            <button type="button" onClick={setReset}>
              Set Reset (orders)
            </button>
            <button type="button" onClick={() => setQueryStringArrayFormat('brackets')}>
              Use Brackets Format
            </button>
            <button type="button" onClick={() => setQueryStringArrayFormat('indices')}>
              Use Indices Format
            </button>
            <button type="button" onClick={enablePreserveScroll}>
              Enable Preserve Scroll
            </button>
            <button type="button" onClick={enablePreserveState}>
              Enable Preserve State
            </button>
            <button type="button" onClick={enablePreserveUrl}>
              Enable Preserve URL
            </button>
            <button type="button" onClick={enableReplace}>
              Enable Replace
            </button>
            <button type="submit">Submit</button>
          </div>

          {preserveScroll() && <Article />}
        </>
      )}
    </Form>
  )
}
