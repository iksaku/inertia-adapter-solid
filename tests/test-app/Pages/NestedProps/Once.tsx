import { router, usePage } from 'inertia-adapter-solid'
export default () => {
  const reactiveProps0Page = usePage<{
      config: {
        locale?: string
        timezone: string
      }
    }>(),
    reactiveProps0 = () => reactiveProps0Page.props
  return (
    <>
      <p id="locale">Locale: {reactiveProps0().config.locale}</p>
      <p id="timezone">Timezone: {reactiveProps0().config.timezone}</p>
      <button onClick={() => router.reload()}>Reload</button>
      <button onClick={() => router.reload({ only: ['config'] })}>Reload only config</button>
    </>
  )
}
