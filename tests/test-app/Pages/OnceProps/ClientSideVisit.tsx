import { router } from 'inertia-adapter-solid'
export default function ClientSideVisit(props: { foo: string; bar: string }) {
  return (
    <>
      <p id="foo">Foo: {props.foo}</p>
      <p id="bar">Bar: {props.bar}</p>
      <button
        onClick={() =>
          router.push({
            url: '/once-props/client-side-visit',
            component: 'OnceProps/ClientSideVisit',
            props: { bar: 'bar-updated' },
          })
        }
      >
        Push without preserving
      </button>
      <button
        onClick={() =>
          router.push({
            url: '/once-props/client-side-visit',
            component: 'OnceProps/ClientSideVisit',
            props: (_currentProps, onceProps) => ({ ...onceProps, bar: 'bar-updated' }),
          })
        }
      >
        Push with once props
      </button>
    </>
  )
}
