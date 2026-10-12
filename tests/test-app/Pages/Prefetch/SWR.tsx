import SWRLayout from '../../Layouts/SWR'

const SWR = (props: { pageNumber: string; lastLoaded: number }) => (
  <div>
    <div>This is page {props.pageNumber}</div>
    <div>
      Last loaded at <span id="last-loaded">{props.lastLoaded}</span>
    </div>
  </div>
)
SWR.layout = SWRLayout
export default SWR
