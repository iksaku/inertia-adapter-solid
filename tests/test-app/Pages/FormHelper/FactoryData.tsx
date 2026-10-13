import { useForm, useHttp, usePage } from 'inertia-adapter-solid'
import { createSignal } from 'solid-js'

export default () => {
  const hook = new URL(usePage().url, 'http://localhost').searchParams.get('hook')
  const [seed, setSeed] = createSignal({ profile: { name: 'first', count: 7 }, active: false })
  const factory = () => seed()
  const form = hook === 'useHttp' ? useHttp(factory) : useForm(factory)
  const [defaultsError, setDefaultsError] = createSignal('')

  const changeDefaults = () => setSeed({ profile: { name: 'second', count: 17 }, active: true })
  const falsyDefaults = () => setSeed({ profile: { name: '', count: 0 }, active: false })
  const seedErrors = () => form.setError({ 'profile.name': 'Name error', 'profile.count': 'Count error' })
  const overrideDefaults = () => {
    try {
      form.defaults()
      setDefaultsError('Manual defaults accepted')
    } catch (error) {
      setDefaultsError((error as Error).message)
    }
  }

  return (
    <main>
      <h1>{hook === 'useHttp' ? 'useHttp' : 'useForm'} factory defaults</h1>
      <fieldset>
        <legend>Current data</legend>
        <label>
          Name
          <input
            value={form.data.profile.name}
            onInput={(event) => form.setData('profile', 'name', event.currentTarget.value)}
          />
        </label>
        <label>
          Count
          <input
            type="number"
            value={form.data.profile.count}
            onInput={(event) => form.setData('profile', 'count', event.currentTarget.valueAsNumber)}
          />
        </label>
        <label>
          Active
          <input
            type="checkbox"
            checked={form.data.active}
            onInput={(event) => form.setData('active', event.currentTarget.checked)}
          />
        </label>
      </fieldset>
      <p>
        Data: <output id="factory-data">{JSON.stringify(form.data)}</output>
      </p>
      <p>
        Dirty: <output id="factory-dirty">{String(form.isDirty)}</output>
      </p>
      <p>
        Errors: <output id="factory-errors">{JSON.stringify(form.errors)}</output>
      </p>
      <div style={{ display: 'flex', gap: '8px', 'flex-wrap': 'wrap' }}>
        <button onClick={changeDefaults}>Change factory defaults</button>
        <button onClick={falsyDefaults}>Use falsy defaults</button>
        <button onClick={seedErrors}>Seed errors</button>
        <button onClick={() => form.resetAndClearErrors('profile.name')}>Reset name and clear its error</button>
        <button onClick={() => form.reset()}>Reset all data</button>
        <button onClick={() => form.resetAndClearErrors()}>Reset all data and errors</button>
        <button onClick={overrideDefaults}>Override defaults</button>
      </div>
      {defaultsError() && <p role="alert">{defaultsError()}</p>}
    </main>
  )
}
