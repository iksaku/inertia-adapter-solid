import CustomTriggersRef from './CustomTriggersRef'
import type { User } from './UserCard'
// Solid's equivalent of React ref objects is a callback-set element read by an accessor.
export default function CustomTriggersRefObject(props: { users: { data: User[] } }) {
  return <CustomTriggersRef users={props.users} heading="Custom Triggers with React Ref Objects Test" />
}
