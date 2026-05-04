---
"inertia-adapter-solid": major
---

### Breaking Changes
- Server-Side Rendering configuration now expects a `setup` function to be provided:
  ```js
  createServer(
    createInertiaApp({
      // ...
      setup: ({ App, props }) => <App {...props} />
    })
  )
  ```
  This helps in customizing the setup process for SSR to match the CSR setup.

### Enhancements
- Initial page loading now uses `getInitialPageFromDOM` from `@inertiajs/core`, enabling support for the `future.useScriptElementForInitialPage` config option. When enabled, the initial page data is injected as a `<script type="application/json">` tag instead of `data-page`.
- Server-Side Rendering configuration now supports defining a custom `render` function.
  - Supported functions are [`renderToString`](https://docs.solidjs.com/reference/rendering/render-to-string) and [`renderToStringAsync`](https://docs.solidjs.com/reference/rendering/render-to-string-async):
    ```js
    import { renderToString } from 'solid-js/web';
    
    createServer(
      createInertiaApp({
        // ...
        render: renderToString,
      })
    )
    
    // Or...
    
    import { renderToStringAsync } from 'solid-js/web';
    
    createServer(
      createInertiaApp({
        // ...
        render: renderToStringAsync,
      })
    )
    ```
    If no `render` function is provided, `renderToString` will be used by default, as it was the behavior in previous versions of the adapter.
- `InertiaAppProps` is now generic: `InertiaAppProps<SharedProps>`. The default remains `PageProps`, so existing code continues to work unchanged.
