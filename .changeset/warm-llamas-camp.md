---
"inertia-adapter-solid": major
---

Initial Inertia.js v3.x compatibility

This release brings initial compatibility with InertiaJS v3. Key changes include:

- Bumped `@inertiajs/core` to `^3.1.1` and `laravel-precognition` to `^2.0.0`.
- `createInertiaApp()` now supports an auto-mode that automatically renders and hydrates without requiring a `setup` function.
- Added `inertia-adapter-solid/vite` export for Inertia Vite plugin framework configuration.
  This allows for automatic client-side and server-side configurations, along with automatic component discovery. 

### Migration Notes

#### Vite Config:
If you are using the Inertia Vite plugin, you must now register the Solid framework:

```js
import inertia from '@inertiajs/vite'
import inertiaSolidFramework from 'inertia-adapter-solid/vite'

export default defineConfig({
  plugins: [
    inertia({
      // ...
      frameworks: inertiaSolidFramework,
    }),
  ],
})
```

The vite plugin now automatically configures the SSR entry point, so you no longer need to manually configure it.

#### Client Side Entrypoint
Your client-side entrypoint can be simplified:

```jsx
import { createInertiaApp } from 'inertia-adapter-solid'

createInertiaApp()
```

#### Server Side Entrypoint
It is now possible to skip the SSR entrypoint file as
the Inertia Vite plugin automatically handles that
for you.

If you opt to keep it, please read the updated documentation
to know more about the new setup.
