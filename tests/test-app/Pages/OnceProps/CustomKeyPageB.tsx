import { Link } from 'inertia-adapter-solid'
export default function PageB(props: { permissions: string; bar: string }) {
  return (
    <>
      <p id="permissions">Permissions: {props.permissions}</p>
      <p id="bar">Bar: {props.bar}</p>
      <Link href="/once-props/custom-key/a">Go to Custom Key Page A</Link>
    </>
  )
}
