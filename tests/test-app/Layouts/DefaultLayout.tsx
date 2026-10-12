import { type JSX } from 'solid-js'
export default (props0: {
  children: JSX.Element
}) => {
  return (
    <div id="default-layout">
      <span>Default Layout</span>
      {props0.children}
    </div>
  )
}
