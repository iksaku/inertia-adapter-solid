import { Meta, Title, Link as HeadLink } from '@solidjs/meta'
import { Link } from 'inertia-adapter-solid'
export default () => <><Title>Multiple Elements Test</Title><Meta charset="utf-8" />
  <Meta name="viewport" content="width=device-width, initial-scale=1" /><Meta name="description" content="Testing multiple head elements" />
  <Meta name="keywords" content="test, vue, inertia" /><Meta property="og:title" content="Open Graph Title" /><Meta property="og:description" content="Open Graph Description" />
  <HeadLink rel="icon" href="/favicon.ico" /><HeadLink rel="stylesheet" href="/custom.css" /><HeadLink rel="canonical" href="https://example.com/page" />
  <h1>Multiple Head Elements</h1><p>Check the document head for multiple elements</p>
  <Link id="navigate-away" href="/">Go Home</Link><Link id="navigate-back" href="/head/mixed">Back to Mixed</Link>
</>
