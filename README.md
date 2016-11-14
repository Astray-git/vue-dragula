# vue2-dragula
> :ok_hand: Drag and drop so simple it hurts

Vue wrapper for [dragula](https://github.com/bevacqua/dragula) drag'n drop library, based on [vue-dragula](https://github.com/Astray-git/vue-dragula) by [@Astray-git](https://github.com/Astray-git). 

This library has been refactored, upgraded and extended with powerful new features for use with Vue 2.

## Status
- Works with [Vue 2](https://medium.com/the-vue-point/vue-2-0-is-here-ef1f26acf4b8#.c089dtgol)
- Service and directive are more flexible and powerful
- Removed concept of bags. References named drakes directly
- [Vue2 demo app](https://github.com/kristianmandrup/vue2-dragula-demo/)

See [Changelog](https://github.com/kristianmandrup/vue-dragula/blob/dev/Changelog.md) for more details.

## Install
#### CommonJS

Note: Library will soon be available as `vue2-dragula`.

```bash
npm install kristianmandrup/vue-dragula#dev --save
```

```bash
yarn add kristianmandrup/vue-dragula#dev
```

*Vue configuration*

```js
var Vue = require('vue');
var VueDragula = require('vue2-dragula');

Vue.use(VueDragula);
```

#### Direct include
You can directly include the library with a `<script>` tag when you have Vue and dragula already included globally. It will automatically install itself.

## Template Usage
``` html
<div class="wrapper">
  <div class="container" v-dragula="colOne" drake="first">
    <!-- with click -->
    <div v-for="text in colOne" @click="onClick">{{text}} [click me]</div>
  </div>
  <div class="container" v-dragula="colTwo" drake="first">
    <div v-for="text in colTwo">{{text}}</div>
  </div>
</div>
```

**NOTE** Vuejs 2.x 

To make sure a correct update for DOM element order, we must provide a `key` for `v-for` directive inside a dragula container. https://vuejs.org/v2/guide/list.html#key  
With `v-for="item in list"`, we need `:key="item.id"` for object items, `:key="item"` for plain string.



## APIs
You can access the main API from `Vue.$dragula.$service` or from within a component via `this.$dragula.$service`. This references the application level dragula service.

You can also create named services for more fine grained control (more on this later)

### `options(name, options)`
Set [dragula options](https://github.com/bevacqua/dragula#optionscontainers)

```js
...
new Vue({
  ...
  created: function () {
    const service = Vue.$dragula.$service
    service.options('my-drake', {
      direction: 'vertical'
    })
  }
})
```

### `find(name)`
Returns the named `drake` instance of the service.

## Events
For [drake events](https://github.com/bevacqua/dragula#drakeon-events)

```js
  service.eventBus.$on('drop', (args) => {
    console.log('drop: ' + args[0])
  })
})
```


## Special Events for vue-dragula

| Event Name |      Listener Arguments      |  Event Description |
| :-------------: |:-------------:| -----|
| dropModel | drakeName, el, target, source, dropIndex | model was synced, dropIndex exposed |
| removeModel | drakeName, el, container, removeIndex | model was synced, removeIndex exposed |

[1]: https://github.com/bevacqua/dragula

## Development
`npm` scripts included:

- `npm run build` to build new distribution in `/dist`
- `npm run dev` run example in dev mode
- `npm run lint` lint code using ESlint

[Vue 2 demo app](https://github.com/kristianmandrup/vue2-dragula-demo/)

## The API in more depth
Access `this.$dragula` in your `created () { ... }` life cycle hook of any component which uses the `v-dragula` directive. Add named service(s) via `this.$dragula.createService` and initialise with the drakes you want to use.

### $dragula
`$dragula` API:
  - `createService({name, eventBus, drakes})` : to create a named service
  - `createServices({names, ...})` : to create multiple services (`names` list)
  - `on(handlerConfig = {})` : add event handlers to all services
  - `on(name, handlerConfig = {})` : add event handlers to specific service
  - `drakesFor(name, drakes = {})` : configure a service with drakes
  - `service(name)` : get named service
  - `.services` : get list of all registered services
  - `.serviceNames` : get list of names for all registered services

### DragulaService
The `DragulaService` constructor takes the following deconstructed arguments.
Only `name` is required

```js
class DragulaService {
  constructor ({name, eventBus, drakes, options}) {
    ...
  }
  // ...
}
```

Drakes are indexed by name in the `drakes` Object of the service. Each key is the name of a drake and points to a `drake` instance. The `drake` can have event handlers, models, containers etc. See [dragula options](https://github.com/bevacqua/dragula#dragulacontainers-options)

## Model mechanics
The `drake` event handlers have default mechanics for how to operated on the underlyng models. These can be customized as needed.

A common schenario is to have a tree of node objects, where each node has 
a `children` key. We should be able to drag elements to modify the node tree stucture.

```js
{
  type: 'container'
  children: [
    {
      type: 'form',
      children: [
        {
          type: 'input'
          as: 'text'
          value: 'hello'
          label: 'Your name'
        },
        {
          type: 'input'
          as: 'checkbox'
          value: 'yes'
          label: 'Feeling good?'
        }
      ]
    },
    {
      type: 'form',
      children: [
      ]
    }
  ]
}
```

In this example we should be able to move a form input specication object from one form container node into another. This is possible simply by 
setting `<template>` elements with `v-dragula` directive to point to `children[0].children` and `children[1].children` respectively. We can use the rest of the node tree data to visualize the various different nodes, f.ex for a Visual editor/IDE :)

### DragHandler for fine-grained control
For fine-grained control on how nodes are added/removed from the various lists. Some lists might only allow that nodes added at the front or back, some might have validation/business rules etc.

The `dragHandler` instance of the `DragHandler` class encapsulates the states and logic of dragging and re-arranging the underlying models.

Sample code taken from `handleModels` method of `DragulaService`

```js
const dragHandler = this.createDragHandler({ ctx: this, name, drake })

drake.on('remove', dragHandler.remove)
drake.on('drag', dragHandler.drag)
drake.on('drop', dragHandler.drop)
```

Key model operation methods in `DragHandler`
- on `remove` drag action: `removeModel`
- on `drop` drag action: `dropModelSame` and `insertModel`

```js
removeModel(el, container, source) {
  this.sourceModel.splice(this.dragIndex, 1)
}

dropModelSame(dropElm, target, source) {
  this.sourceModel.splice(this.dropIndex, 0, this.sourceModel.splice(this.dragIndex, 1)[0])
}

insertModel(targetModel, dropElmModel) {
  targetModel.splice(this.dropIndex, 0, dropElmModel)
}
```

The `DragHandler` class can be subclassed and the model operations customized as needed. You can pass a custom factory method `createDragHandler` as a service option. Let's assume we have a `MyDragHandler` class which extends `DragHandler` and overrides key methods with custom logic. Now lets use it!

```js
function createDragHandler({ctx, name, drake}) {
  return new MyDragHandler({ ctx, name, drake })
}

export default {
  props: [],
  data() {
    return {
      //...
    }
  },
  // setup services with drakes
  created () {
    this.$dragula.create({
      name: 'myService',
      createDragHandler,
      drakes: {
        third: true,
        fourth: {
          copy : true
        }
      }
    })
  }
}
```

Note that you can set a drake to `true` as a convenience to configure it with default options. This is a shorthand for `third: {}`. You can also pass an array of drake names, ie `drakes: ['third', 'fourth']`

### Binding models to dragable elements
Please note that `vue-dragula` expects the `v-dragula` binding expression to point to a model in the VM of the component.

When you move the elements in the UI you also (by default) rearrange the underlying model list items (using `findModelForContainer` in the service). This is VERY powerful!

Note that special Vue events `removeModel` and `dropModel` are emitted as model items are moved around (using [splice](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/splice) by default).

If you need more advanced control over models (such as filtering, conditions etc.) you can use watchers on these models and then create derived models in response, perhaps dispatching local model state to a [Vuex](vuex.vuejs.org) store. We recommend keeping the "raw" dragula models intact and in sync with the UI models/elements.

Each `drake` is setup to delegate dragula events to the Vue event system (`$emit`) ie. to use `eventBus` to send events of the same name. This lets you define custom drag'n drop event handling as regular Vue event handlers.

### Logging
You can pass a `logging: true` as an option when initialising the plugin or when you create a new service.

```js
Vue.use(VueDragula, {
  // ...
  logging: true
});
```

Logging is essential in development mode!!

### Customis DragulaService
You can also subclass `DragulaService` or create your own, then pass a `createService` option for you install the plugin:

```js
import { DragulaService } from 'vue-dragula'

class MyDragulaService extends DragulaService {
  /// ...
}

function createService({name, eventBus, drakes}) {
  return new MyDragulaService({
    name,
    eventBus,
    drakes
  })
}

Vue.use(VueDragula, { createService });
```

### Custom event bus
You can customize the event bus used via the `createEventBus` option. 
You could f.ex create an event bus factory method to always log events emitted if logging is turned on.

```js
function createEventBus(Vue, options = {}) {
  const eventBus = new Vue()
  return {
    $emit: function(event, args) {
      if (options.logging) {
        console.log('emit:', event, args)
      }
      eventBus.$emit(event, args)
    }
  })
}

Vue.use(VueDragula, { createEventBus });
```

## How do the drakes work!?
In the directive `bind` function we have the following core logic:

```js
  if (drake) {
    drake.containers.push(container)
    return
  }
  drake = dragula({
    containers: [container]
  })
  service.add(name, drake)
```

If the drake already exists, ie. `if (drake) { ... }` then we add the container directly into a pre-existing drake created in the `created` lifecycle hook of the component. Otherwise it tries to register as a new named drake in the service `drakes` map (Object).

*Drake conflict warning*

You can get a conflict if one or more drakes are added via directives, and the drakes have not been pre-configured in the VM. This conflict is caused by race conditions, as the directives are evaluated asynchronously for enhanced view performance!

Thanks to [@Astray-git](https://github.com/Astray-git) for [making this clear](https://github.com/Astray-git/vue-dragula/issues/12#issuecomment-260134897)

Note: *@Astray-git* is the original author of this plugin :)

Note: In the near future we will likely try to overcome this constraint, by always inserting the new container in an existing drake or simply overwriting.

Setup a service with one or more drakes ready for drag'n drop action

```js
created () {
  this.$dragula.create({
    name: 'myService',
    drakes: {
      'first': {
        copy: true
      }
    }
  }).on({
    // ... event handler map
  })
}
```

You can also use the `drakesFor` method on a registered service.

```
  this.$dragula.drakesFor('myService', {
    'first': {
      copy: true
    }
  })
}
```

This ensures that the `DragulaService` instance `myService` is registered and contains one or more drakes which are ready to be populated by `v-dragula` container elements.

``` html
<div class="wrapper">
  <div class="container" v-dragula="colOne" service="myService" drake="first">
    <!-- with click -->
    <div v-for="text in colOne" @click="onClick">{{text}} [click me]</div>
  </div>
  <div class="container" v-dragula="colTwo" service="myService" drake="first">
    <div v-for="text in colTwo">{{text}}</div>
  </div>
</div>
```

Now when the `v-dragula` directives are evaluated and bound to the component (via directive `bind` method), they will each find an existing drake of that name and push their `container` to the list of `drake.containers`.

```js
  if (drake) {
    drake.containers.push(container)
    return
  }
```

Sweet :)

### Advanced drake Magic
If you need to add [dragula containers and models](https://github.com/bevacqua/dragula#dragulacontainers-options) programmatically, try something like this:

```js
  drake.models.push({
    model: model,
    container: container
  })
```

Here the `model` is a pointer to a list in the model data of your VM. The container is a DOM element which contains a list of elements that an be dragged and rearranged and their ordering reflected (mirrored) in the model.

To access and modify a particular drake models and containers:

```js
let drake = this.$dragula.service('my-list').find('third')
drake.models.push({
  model: model,
  container: container
})
drake.containers.push(container)
```

You will need a good understanding of the inner workings of Dragula in order to get this right, so do this at your own risk and experiment.
Feel free to improve the API to make this easier and less "risky".
Enjoy :)

## License

MIT Kristian Mandrup 2016