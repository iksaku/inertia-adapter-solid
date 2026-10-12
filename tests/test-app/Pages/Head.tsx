import { Meta, Title } from '@solidjs/meta'
export default () => <>
  <Title>Test Head Component</Title>
  <Meta name="viewport" content="width=device-width, initial-scale=1" />
  <Meta name="description" content={'This is an "escape" example'} />
  <Meta name="xss" content="<script>alert('xss')</script>" />
  <Meta name="ampersand" content="Laravel & Inertia" />
  <Meta name="unicode" content="Hélló! 🎉" />
  <h1>Head Component</h1>
</>
