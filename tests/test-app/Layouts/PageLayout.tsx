import { type JSX } from 'solid-js'
export default (props0: {
  children: JSX.Element
}) => {
  return (
    <div id="page-layout">
      <span>Page Layout</span>
      {props0.children}
    </div>
  )
}
