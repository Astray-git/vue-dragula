# vue-dragula
> :ok_hand: Drag and drop so simple it hurts

Vue wrapper for [`dragula`][1].

## Status

- Make it work with Vue 2.x
- Make service and directive more flexible with granular control as needed

## Install
#### CommonJS

Available through npm as `vue-dragula`.

  ``` bash
  npm install vue-dragula
  ```

  ``` js
  var Vue = require('vue');
  var VueDragula = require('vue-dragula');

  Vue.use(VueDragula);
  ```

#### Direct include

You can also directly include it with a `<script>` tag when you have Vue and dragula already included globally. It will automatically install itself.

## Usage

In a template

``` html
<div class="wrapper">
  <div class="container" v-dragula="colOne" bag="first-bag">
    <!-- with click -->
    <div v-for="text in colOne" @click="onClick">{{text}} [click me]</div>
  </div>
  <div class="container" v-dragula="colTwo" bag="first-bag">
    <div v-for="text in colTwo">{{text}}</div>
  </div>
</div>
```

## APIs

You can access the main API from `Vue.$dragula.$service` or from within a component via `this.$dragula.$service`. This references the application level dragula service. You can created named services for more fine grained control (more on this later)

### `options(name, options)`

Set [dragula options](https://github.com/bevacqua/dragula#optionscontainers)

```js
...
new Vue({
  ...
  created: function () {
    Vue.$dragula.$service.options('my-bag', {
      direction: 'vertical'
    })
  }
})
```

### `find(name)`

Returns the `bag` for a `drake` instance. Contains the following properties:

- `name` the name that identifies the bag
- `drake` the raw `drake` instance

## Events
For [drake events](https://github.com/bevacqua/dragula#drakeon-events)

```js
...
new Vue({
  ready: function () {
    Vue.$dragula.$service.eventBus.$on('drop', function (args) {
      console.log('drop: ' + args[0])
    })
  }
})
```


## Special Events for vue-dragula

| Event Name |      Listener Arguments      |  Event Description |
| :-------------: |:-------------:| -----|
| dropModel | bagName, el, target, source, dropIndex | model was synced, dropIndex exposed |
| removeModel | bagName, el, container, removeIndex | model was synced, removeIndex exposed |

[1]: https://github.com/bevacqua/dragula

## Development

Following npm scripts are included:

- `npm run build` to build new distribution in `/dist`
- `npm run dev` run example in dev mode
- `npm run lint` lint code using ESlint

How to view the example? Start a simple Http server, like the pythong [simplehttpserver](http://angusjune.github.io/blog/2014/08/16/python-3-dot-x-no-module-named-simplehttpserver/)

`python -m http.server`

The open in browser: `open localhost:8000`

Note: The included `/example` demo is for Vue 1.x only. For Vue 2.x try [this demo](https://github.com/kristianmandrup/vue2-dragula-demo/)

## The API in more depth

Access `this.$dragula` in your `created () { ... }` life cycle hook of any component which uses the `v-dragula` directive. Add named service(s) via `this.$dragula.createService` and initialise with the bags you want to use (see more on bags below).

### $dragula

`$dragula` service API

  - `createService({name, eventBus, bags})` : to create a named service
  - `createServices({names, ...})` : to create multiple services (`names` list)
  - `on(handlerConfig = {})` : add event handlers to all services
  - `on(name, handlerConfig = {})` : add event handlers to specific service
  - `bagsFor(name, bags = {})` : configure a service with empty bags
  - `service(name)` : get named service
  - `.services` : get list of all registered services
  - `.serviceNames` : get list of names for all registered services

### DragulaService

The `DragulaService` constructor takes the following deconstructed arguments

```js
  constructor ({name, eventBus, bags, options}) {
    console.log('Create Dragula service')
    this.name = name
    this.bags = bags || {} // bag store
    this.eventBus = eventBus
    ...
  }
```

Bags are stored as an Oobject, where each key is the name of the bag that points to a dragula instance (`drake`). The `drake` instance can have event handlers, models, containers etc. See [dragula options](https://github.com/bevacqua/dragula#dragulacontainers-options)

## Model mechanics

The drake event handlers have default mechanics for how to operated on the underlyng models. These can be customized as needed.
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

You might want more fine grained control on how nodes are added/removed from the various lists. Some lists might only allow that nodes added at the front or back, some might have validation/business rules etc.

These scenarios are enabled via a `dragHandler` instance of a `DragHandler` class which encapsulates the states and logic of dragging and re-shuffling the underlying models.

Sample code taken from the `handleModels` method of `DragulaService`

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

The `DragHandler` class can be subclassed and the model operations customized as needed. You can pass a custom factory method `createDragHandler` as a service option.

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
  // setup services with bags
  created () {
    this.$dragula.create({
      name: 'myService',
      createDragHandler,
      bags: {
        third: true
      }
    })
  }
}
```

Note that you can set a bag to `true` as a convenience to create it with default bag options (ie. default dragula behavior). 
This is a simply a shorthand for `third: {}`. You can also pass an array of bag names, ie `bags: ['third', 'fourth']`

### Binding models to dragable elements

Please note that `vue-dragula` expects the `v-dragula` binding expression to point to a model in the VM of the component.

When you move the elements in the UI you also (by default) rearrange the underlying model list items (using `findModelForContainer` in the service). This is VERY powerful!

Note that special Vue events `removeModel` and `dropModel` are emitted as model items are moved around (using [splice](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/splice) by default).

If you need more advanced control over models (such as filtering, conditions etc.) you can use watchers on these models and then create derived models in response, perhaps dispatching local model state to a [Vuex](vuex.vuejs.org) store. We recommend keeping the "raw" dragula models intact and in sync with the UI models/elements.

Each `bag` is setup to delegate dragula events to the Vue event system (`$emit`) ie. to use `eventBus` to send events of the same name. This lets you define custom drag'n drop event handling as regular Vue event handlers.

```js
  setupEvents (bag) {
    bag.initEvents = true
    let _this = this
    let emitter = type => {
      function replicate () {
        let args = Array.prototype.slice.call(arguments)
        _this.eventBus.$emit(type, [bag.name].concat(args))
      }
      bag.drake.on(type, replicate)
    }
    this.events.forEach(emitter)
  }
```

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

function createService({name, eventBus, bags}) {
  return new MyDragulaService({
    name,
    eventBus,
    bags
  })
}

Vue.use(VueDragula, { createService });
```

### Custom event bus

You can also customize the event bus used via the `createEventBus` option. 
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

## How do the bags work!?

In the directive `bind` function we have the following core logic:

```js
  if (bag) {
    drake = bag.drake
    drake.containers.push(container)
    return
  }
  drake = dragula({
    containers: [container]
  })
  service.add(name, drake)
```

If the bag already exists, ie. `if (bag) { ... }` then we add the container directly into a pre-existing bag created in the `created` lifecycle hook of the component. Otherwise it tries to add it as a new bag. 

*Bags conflict warning*

You can get a conflict if multiple bags are added via directives, and the bags have not been pre-initialized in the VM. This conflict is caused by race conditions, as the directives are evaluated asynchronously for enhanced view performance!

Thanks to [@Astray-git](https://github.com/Astray-git) for [making this clear](https://github.com/Astray-git/vue-dragula/issues/12#issuecomment-260134897)

Note: He is the original author of this plugin :)

Setup a service with one or more bags ready for drag'n drop action

```js
created () {
  this.$dragula.create({
    name: 'myService',
    bags: {
      'first-bag': {
        copy: true
      }
    }
  }).on({
    // ... event handler map
  })
}
```

You can also use the `bagsFor` method on a registered service.

```
  this.$dragula.bagsFor('myService', {
    'first-bag': {
      copy: true
    }
  })
}
```

This ensures that the `DragulaService` instance `myService` is registered and contains one or more bags which are ready to be populated by `v-dragula` container elements.

``` html
<div class="wrapper">
  <div class="container" v-dragula="colOne" service="myService" bag="first-bag">
    <!-- with click -->
    <div v-for="text in colOne" @click="onClick">{{text}} [click me]</div>
  </div>
  <div class="container" v-dragula="colTwo" service="myService" bag="first-bag">
    <div v-for="text in colTwo">{{text}}</div>
  </div>
</div>
```

Now when the `v-dragula` directives are evaluated and bound to the component (via directive `bind` method), they will each find an existing bag of that name and push their `container` to the list of `drake.containers`.

```js
  if (bag) {
    drake = bag.drake
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
let drake = this.$dragula.service('my-list').find('third-bag')
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

MIT