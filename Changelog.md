## Changelog

## 2.x

- Changed life cycle method `ready` to `mounted` with `$nextTick`
- Add `$dragula` to Vue.prototype to make available on each component instance
- Make `$dragula.$service` a shortcut to access key methods on global service
- Add `service` property to `v-dragula` directive to indicate service to use for container
- Add ability to add `DragulaService` per service name of component via `service="name"` on `v-dragula` element or by default use the global service.
- Add ability to create and set `eventBus` per service, either as shared bus or independent
- Add ability to set `bags` on creation of `DragulaService` via `bags` option
- Add ability to create and use custom `DragulaService` via `createService`  plugin option
- Add ability to create and use custom `eventBus` via `createEventBus` plugin option
- Make `bind` try to bind directive (with bags) to a matching named component service before falling back to bind to global dragula service.
- Add detailed logging via `logging: true` option on plugin
- Extracted common logic of directive functions into reusable functions
- Add `.bagNames` getter on `DragulaService`