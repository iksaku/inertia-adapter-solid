import { Link } from 'inertia-adapter-solid'
export default (props: { pageNumber: string }) => <><h1>Page {props.pageNumber}</h1><Link href="/progress/1">Page 1</Link><Link href="/progress/2">Page 2</Link><Link prefetch href="/progress/3">Page 3</Link></>
