import { Link } from 'inertia-adapter-solid'
export default function PageA(props: { userPermissions: string; bar: string }) {
  return (
    <>
      <p id="permissions">Permissions: {props.userPermissions}</p>
      <p id="bar">Bar: {props.bar}</p>
      <Link href="/once-props/custom-key/b">Go to Custom Key Page B</Link>
    </>
  )
}
