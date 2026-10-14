import { App, createInertiaApp, Deferred, Form, Link, useForm, usePage, WhenMounted, WhenVisible } from 'inertia-adapter-solid'
import createServer from 'inertia-adapter-solid/server'
import framework from 'inertia-adapter-solid/vite'
import type { InertiaAppSSRResponse, Page, SharedPageProps } from '@inertiajs/core'
import { renderToString, renderToStringAsync } from 'solid-js/web'
import type { JSX } from 'solid-js'

declare module '@inertiajs/core' {
  interface InertiaConfig { sharedPageProps: { account: { id: number; name: string } } }
}

const form = useForm({ profile: { name: 'Ada', age: 31 }, tags: ['blue'], enabled: false })
form.setData('profile', 'age', 42)
form.setData('tags', 0, 'gold')
form.defaults('profile.age', 50).reset('profile.name', 'tags.0')
form.defaults({ enabled: true }).defaults()
form.setError('profile.name', 'Required').clearErrors('profile.age')
form.setError({ 'profile.age': 'Too young' })
form.resetAndClearErrors('tags.0')
form.submit('post', '/profile')
form.submit({ method: 'patch', url: '/profile' })
form.transform(data => ({ ...data, enabled: !data.enabled }))
// @ts-expect-error nested key does not exist
form.reset('profile.missing')
// @ts-expect-error nested default value must be numeric
form.defaults('profile.age', 'old')
// @ts-expect-error store path preserves value types
form.setData('profile', 'age', false)
// @ts-expect-error unknown error key
form.setError('missing', 'error')
useForm('remembered', { name: 'Ada' }).dontRemember('name')
useForm(() => ({ name: 'factory' }))
useForm('post', '/validate', { email: '' }).validate('email')
useForm({ method: 'post', url: '/validate' }, { email: '' }).touch('email')

const shared: SharedPageProps = usePage().props
const accountId: number = shared.account.id
const defaultAccountId: number = usePage().props.account.id
const explicitlyShared: number = usePage<SharedPageProps>().props.account.id
const custom = usePage<{ count: number }>()
const count: number = custom.props.count
const customAccountName: string = custom.props.account.name
// @ts-expect-error custom count is not a string
const wrongCount: string = custom.props.count
// @ts-expect-error configured shared id remains numeric without a page generic
const wrongAccountId: string = usePage().props.account.id
// @ts-expect-error an explicit page generic preserves known shared nested keys
const missingAccountEmail = custom.props.account.email

const jsx: JSX.Element = <>
  <Link href="/profile" method="post" data={{ enabled: false }}>Save</Link>
  <Deferred data={['profile', 'count']} fallback={<span>Loading</span>}><span>Ready</span></Deferred>
  <WhenMounted fallback={0}>{false}</WhenMounted>
  <WhenVisible data="profile" fallback={<span>waiting</span>}><span>visible</span></WhenVisible>
  <Form action="/profile" method="post">{props => <span>{String(props.isDirty)}</span>}</Form>
</>
// @ts-expect-error Deferred requires a fallback
const missingFallback = <Deferred data="profile">Ready</Deferred>
// @ts-expect-error link methods are HTTP methods
const wrongMethod = <Link href="/profile" method="save" />
// @ts-expect-error deferred data accepts strings rather than numbers
const wrongData = <Deferred data={42} fallback="Loading" />

declare const page: Page<SharedPageProps>
const resolve = () => () => <main>Consumer</main>
const manual: Promise<void> = createInertiaApp({ resolve, setup: ({ el, App, props }) => {
  const element: Element = el
  const app: JSX.Element = <App {...props} />
  void [element, app]
} })
const automatic = createInertiaApp({ resolve, withApp: (Component, { ssr }) => <section data-ssr={ssr}><Component /></section> })
createInertiaApp()
for (const render of [renderToString, renderToStringAsync]) {
  const response: Promise<InertiaAppSSRResponse> = createInertiaApp({ page, resolve, render, setup: ({ el, App, props }) => {
    const noElement: null = el
    void noElement
    return <App {...props} />
  } })
  void response
}
// @ts-expect-error manual setup and automatic wrapper are mutually exclusive
createInertiaApp({ resolve, setup: () => undefined, withApp: () => <main /> })
// @ts-expect-error renderer must return HTML, not a number
createInertiaApp({ page, resolve, render: () => 42, setup: () => <main /> })
const server: typeof createServer = createServer
const frameworkName: string = framework.package
void [accountId, defaultAccountId, customAccountName, count, jsx, manual, automatic, server, frameworkName, App]
