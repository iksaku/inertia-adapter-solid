export default function PageE(props: { foo: string; bar: string }) {
  return (
    <>
      <p id="foo">Foo: {props.foo}</p>
      <p id="bar">Bar: {props.bar}</p>
    </>
  )
}
