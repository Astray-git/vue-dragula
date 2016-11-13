# vue-dragula
> :ok_hand: Drag and drop so simple it hurts

Vue wrapper for [`dragula`][1].

## Status

- Make it better work with Vue 2.x
- Make service and directive more flexible and granular as needed

### Changelog (since 1.x)

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

### $dragula

`$dragula` named service API

  - `create({name, eventBus, bags})` : to create a named service
  - `create({names, ...})` : to create multiple services (`names`)
  - `on(handlerConfig = {})` : add set of eventBus handlers to all services
  - `bagsFor` : configure a service with empty bags
  - `service(name)` : access individual service
  - `.services` : get list of all registered services
  - `.serviceNames` : get list of names for all registered services

### DragulaService

The `DragulaService` now takes an options hash:

```js
  constructor ({name, eventBus, bags, options}) {
    console.log('Create Dragula service')
    this.name = name
    this.bags = bags || [] // bag store
    this.eventBus = eventBus
    ...
  }
```

A bag must be of the form:

```js
  bag = {
    name,
    drake
  }
```

This allows you to add bags dynamically/programatically if needed.
The `drake` instance of each bag must be a dragula instance (with its own event handlers etc).

```js
bag.drake.on(type, replicate)
```

## Model mechanics

We should ability to customize the drake even handler mechanics on the underlying models to allow for other types of models.

A typical schenario is to have node objects, where each node has 
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

In this example we should be able to move a form input from one form container node into a another. This is already possible, just by setting `v-dragula` to `children[0] and children[1]`. Then we use the rest of the node tree to visualize the various different nodes :)

However we might still want more fine grained control on how nodes are added/removed from the lists. Some lists might only allow ned nodes added at the front or the back, some might have validation rules etc.
We have enabled this via a dragHandler instance of a DragHandler class which encapsulates the states and logic of dragging and re/shuffling the underlying models. From `handleModels` method of `DragulaService`:

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

The `DragHandler` class can now easily be subclassed and the model operations customized as needed. You can then pass a factory method `createDragHandler` as a service option.

```js
function createDragHandler({ctx, name, drake}) {
  return new MyDragHandler({ ctx, name, drake })
}

created () {
  this.$dragula.create({
    name: 'myService',
    createDragHandler,
    bags: {
      third: true
    }
  })

  // setup bags
}
```

Note that you can set a bag to `true` as a convenience to signify no bag options (ie. default drake/dragula behavior for that bag). To be more clear you could also do `third: {}` which is the same.

### Binding models to dragable elements

Please note that `vue-dragula` expects the `v-dragula` binding expression to link to an underlying model in the VM. 

When you move the elements in the UI you also rearrange the underlying model data (using `findModelForContainer`). This is VERY powerful!

Note that the special Vue events `removeModel` and `dropModel` are emitted as models are operated on (using [splice](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)).

```js
    drake.on('remove', (el, container, source) => {
      if (!drake.models) {
        return
      }
      sourceModel = this.findModelForContainer(source, drake)
      sourceModel.splice(dragIndex, 1)
      drake.cancel(true)
      this.eventBus.$emit('removeModel', [name, el, source, dragIndex])
    })

    drake.on('drag', (el, source) => {
      dragElm = el
      dragIndex = this.domIndexOf(el, source)
    })

    drake.on('drop', (dropElm, target, source) => {
      if (!drake.models || !target) {
        return
      }
      dropIndex = this.domIndexOf(dropElm, target)
      sourceModel = this.findModelForContainer(source, drake)

      if (target === source) {
        sourceModel.splice(dropIndex, 0, sourceModel.splice(dragIndex, 1)[0])
      } else {
        let notCopy = dragElm === dropElm
        let targetModel = this.findModelForContainer(target, drake)
        let dropElmModel = notCopy ? sourceModel[dragIndex] : JSON.parse(JSON.stringify(sourceModel[dragIndex]))

        if (notCopy) {
          waitForTransition(() => {
            sourceModel.splice(dragIndex, 1)
          })
        }
        targetModel.splice(dropIndex, 0, dropElmModel)
        drake.cancel(true)
      }
      this.eventBus.$emit('dropModel', [name, dropElm, target, source, dropIndex])
    })
    drake.registered = true
  }
```

Please be advised not to change the default behavior of this key functionality.

If you need more control over models (such as filtering, conditions etc.), use watchers on these models and then create derived models in response. 
Keep the "raw" dragula models intact and in perfect sync with the models in the UI.

Each `bag` is setup to delegate dragula events to the `eventBus` events of the same name. This lets you to define custom event handling as regular Vue event handlers.

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

You can now pass a `{logging: true}`

```
Vue.use(VueDragula, {
  // ...
  logging: true
});
```

### Customis DragulaService

For even more customization, you can also subclass `DragulaService` or create your own, then pass a `createService` option for you install the plugin:

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

You could create an event bus factory method to always log events emitted if logging is turned on.

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

In the directive `bind` we have the following core logic:

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

If the bag already exists, ie. `if (bag)` then we add the container directly into pre-existing bag created via `service.options` call (in `created` lifecycle hook). Otherwise we try to add it as a new bag and we could get into conflict if we have multiple bags added via directives that have not been pre-initialized in the VM. The conflict can be caused by race conditions, as the directives are evaluated asynchronously for enhanced view performance!

Thanks to @Astray-git for [finally making me understand this](https://github.com/Astray-git/vue-dragula/issues/12#issuecomment-260134897)

The correct way to use this plugin now:

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

OR using `bagsFor` method

```
  this.$dragula.bagsFor('myService', {
    'first-bag': {
      copy: true
    }
  })
}
```

This ensures that the `DragulaService` instance `myService` has been registered and contains one or more empty bags which are ready to be populated by containers to be used for drag'n drop by Dragula.

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

Now when `v-dragula` directives are evaluated and bound to the component (via `bind`) they will each find the empty bag of that name and each push their `container` to the list of `drake.containers`.

```js
  if (bag) {
    drake = bag.drake
    drake.containers.push(container)
    return
  }
```

### Advanced drake Magic

Note that dragula containers should always be linked to an underlying model. 
If you really need to add a container/model binding programmatically, try this:

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

You need a deep understanding of the inner workings of Dragula in order to get this right, so do this at your own risk and experiment.

## Install
#### CommonJS

- Available through npm as `vue-dragula`.
  ``` bash
  npm install vue-dragula
  ```

  ``` js
  var Vue = require('vue');
  var VueDragula = require('vue-dragula');

  Vue.use(VueDragula);
  ```

#### Direct include

- You can also directly include it with a `<script>` tag when you have Vue and dragula already included globally. It will automatically install itself.

## Usage

template:
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

You can access the main API from `Vue.$dragula.$service` or from within a component via `this.$dragula.$service` (using global service). For using named services that have more fine grained control, see above (note: designed for Vue2).

### `options(name, options)`

Set dragula options, refer to: https://github.com/bevacqua/dragula#optionscontainers
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
For drake events, refer to: https://github.com/bevacqua/dragula#drakeon-events


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

## License

MIT