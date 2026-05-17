# inertia-adapter-solid

## 1.0.0-beta.5

### Major Changes


- 1f879da: Enhancements to SSR configuration
  
  ### Breaking Changes
  - Server-Side Rendering configuration now expects a `setup` function to be provided:
    ```js
    createServer(
      createInertiaApp({
        // ...
        setup: ({ App, props }) => <App {...props} />,
      })
    );
    ```
    This helps in customizing the setup process for SSR to match the CSR setup.

  ### Enhancements

  - Initial page loading now uses `getInitialPageFromDOM` from `@inertiajs/core`, enabling support for the `future.useScriptElementForInitialPage` config option. When enabled, the initial page data is injected as a `<script type="application/json">` tag instead of `data-page`.
  - Server-Side Rendering configuration now supports defining a custom `render` function.

    - Supported functions are [`renderToString`](https://docs.solidjs.com/reference/rendering/render-to-string) and [`renderToStringAsync`](https://docs.solidjs.com/reference/rendering/render-to-string-async):

      ```js
      import { renderToString } from "solid-js/web";

      createServer(
        createInertiaApp({
          // ...
          render: renderToString,
        })
      );

      // Or...

      import { renderToStringAsync } from "solid-js/web";

      createServer(
        createInertiaApp({
          // ...
          render: renderToStringAsync,
        })
      );
      ```

      If no `render` function is provided, `renderToString` will be used by default, as it was the behavior in previous versions of the adapter.

  - `InertiaAppProps` is now generic: `InertiaAppProps<SharedProps>`. The default remains `PageProps`, so existing code continues to work unchanged.

### Patch Changes

- dfcdaa0: Bump dependencies
- 4bd1a29: Support `useForm()` with zero arguments
- 1c0d1ed: Simplify layout rendering
- 618c737: Fix types in useForm
- 45b4712: Export `App` component

## 1.0.0-beta.4

### Patch Changes

- 6e7e44c: Ability to reference `Form` API via SolidJS `ref`
- d7873bd: View Transitions support for `Link` component
- ab9f9df: Form Precognition support

## 1.0.0-beta.3

### Minor Changes

- aa14a47: Add support for Inertia config to change default values
- 080f23f: Added useFormContext hook for accessing Form state from child components
- 959c534: Added `useForm().resetAndClearErrors()` method
- ba34618: Match some `useForm` and `Form` typings with official adapters

### Patch Changes

- 9218012: Ensure Defer component is reactive to page prop changes

## 1.0.0-beta.2

### Patch Changes

- 848af0b: chore: Bump `@inertiajs/core` to v2.2.11

## 1.0.0-beta.1

### Patch Changes

- 0df24d7: bug: Fix typings for dynamic components (InfiniteScroll, Link, WhenVisible)

## 1.0.0-beta.0

### Major Changes

- 563e9f6: enhancement: Upgrade @inertiajs/core to v2
- bf07e97: enhancement(components): Implement `<WhenVisible />` component
- 7f97fa5: enhancement(components): Implement `<Deferred />` component
- 7f97fa5: enhancement(util): Implement `usePoll()` utility
- 7f97fa5: enhancement(util): Implement `usePrefetch()` utility
- da1488a: enhancement: Upgrade implementation of `<Link />` and `useForm()` for Inertia v2
- 7b1f079: enhancement(components): Implement `<Form />` component
- 337dea3: enhancement(components): Implement `<InfiniteScroll />` component

## 0.3.1

### Patch Changes

- 59c03ba: fix(deps): Fix @solid-primitives/deep dependency placement
