## Changelog

## 2.x

Removed old `/example` app. Doesn't work with Vue2 or new design.

Removed the concept of bags. Not needed now that named drakes of a service are stored in a Hash object, indexed by key. We just have services with a map of drakes that have drag options, containers and models. Much simpler to understand!

Old bag flags/data (life cycle metadata) such as `initEvents` 
and `registered` are stored directly on each drake instead.

- Changed life cycle method `ready` to `mounted` with `$nextTick`
- Add `$dragula` to Vue.prototype to make available on each component instance
- Make `$dragula.$service` a shortcut to access key methods on global service
- Add `service` property to `v-dragula` directive to indicate service to use for container
- Add ability to add `DragulaService` per service name of component via 
`service="name"` on `v-dragula` element or by default use the global service.
- Add ability to create and set `eventBus` per service, either as shared bus or independent
- Add ability to set `drakes` on creation of `DragulaService` via `drakes` option
- Add ability to create and use custom `DragulaService` via `createService`  plugin option
- Add ability to create and use custom `eventBus` via `createEventBus` plugin option
- Make `bind` try to bind directive (with drakes) to a matching named component service before falling back to bind to global dragula service.
- Add detailed logging via `logging: true` option on plugin
- Extracted common logic of directive functions into reusable functions
- Add `.bagNames` getter on `DragulaService`
