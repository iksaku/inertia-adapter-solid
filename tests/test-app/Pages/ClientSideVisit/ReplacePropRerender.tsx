import { router } from 'inertia-adapter-solid'
const MemoChild = (props0: {
  prefix: string
  item: {
    label: string
  }
}) => {
  let renderCount = 0
  renderCount++
  return (
    <div>
      <div id={`${props0.prefix}-render-count`}>Render count: {renderCount}</div>
      <div id={`${props0.prefix}-value`}>Value: {props0.item.label}</div>
    </div>
  )
}
export default (props1: {
  user: {
    name: string
  }
  other: {
    label: string
  }
  profile: {
    name: string
    avatar: {
      label: string
    }
  }
}) => {
  return (
    <div>
      <h1>replaceProp Identity Test</h1>
      <div id="current-value">Current value: {props1.user.name}</div>
      <div id="profile-name">Profile name: {props1.profile.name}</div>

      <MemoChild prefix="memo" item={props1.other} />
      <MemoChild prefix="avatar" item={props1.profile.avatar} />

      <button onClick={() => router.replaceProp('user.name', 'Jane Smith')}>Replace user.name</button>
      <button onClick={() => router.replaceProp('profile.name', 'Jane Smith')}>Replace profile.name</button>
    </div>
  )
}
