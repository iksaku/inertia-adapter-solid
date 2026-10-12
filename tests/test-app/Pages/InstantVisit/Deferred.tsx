import { Deferred } from 'inertia-adapter-solid'
export default (props0: {
  title?: string
  heavyData?: string
}) => {
  return (
    <div>
      <div id="deferred">This is Deferred</div>
      <div id="title">Title: {props0.title ?? 'none'}</div>

      <Deferred data="heavyData" fallback={<div id="heavy-loading">Loading heavy data...</div>}>
        <div id="heavy-data">Heavy: {props0.heavyData}</div>
      </Deferred>
    </div>
  )
}
