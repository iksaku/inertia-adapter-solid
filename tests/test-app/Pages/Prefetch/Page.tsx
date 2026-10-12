import Prefetch from '../../Layouts/Prefetch'

const Page = (props: { pageNumber: string; lastLoaded: number }) => (
  <div>
    <div>This is page {props.pageNumber}</div>
    <div>
      Last loaded at <span id="last-loaded">{props.lastLoaded}</span>
    </div>
  </div>
)
Page.layout = Prefetch
export default Page
