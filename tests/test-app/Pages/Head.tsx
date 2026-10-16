import { Head } from 'inertia-adapter-solid'
export default () => (
  <>
    <Head title="Test Head Component">
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content={'This is an "escape" example'} />
      <meta name="undefined" content={undefined} />
      {/* @ts-expect-error Exercise upstream's non-string attribute compatibility inputs. */}
      <meta name="number" content={0} />
      {/* @ts-expect-error Exercise upstream's non-string attribute compatibility inputs. */}
      <meta name="boolean" content={true} />
      {/* @ts-expect-error Exercise upstream's non-string attribute compatibility inputs. */}
      <meta name="false" content={false} />
      {/* @ts-expect-error Exercise upstream's non-string attribute compatibility inputs. */}
      <meta name="null" content={null} />
      {/* @ts-expect-error Exercise upstream's non-string attribute compatibility inputs. */}
      <meta name="float" content={3.14} />
      <meta name="xss" content="<script>alert('xss')</script>" />
      <meta name="ampersand" content="Laravel & Inertia" />
      <meta name="unicode" content="Hélló! 🎉" />
    </Head>
    <h1>Head Component</h1>
  </>
)
