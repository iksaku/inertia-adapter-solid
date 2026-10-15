import { Deferred } from 'inertia-adapter-solid'
export default (props0: {
  largeData?: string
}) => {
  return (
    <div>
      <h1>History Quota Test - Deferred</h1>

      <Deferred data="largeData" fallback={<p>Loading large data...</p>}>
        <p>Data size: {props0.largeData?.length?.toLocaleString()} bytes</p>
      </Deferred>
    </div>
  )
}
