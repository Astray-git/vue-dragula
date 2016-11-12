# vue-dragula
> :ok_hand: Drag and drop so simple it hurts

Vue wrapper for [`dragula`][1].

## Status

- Make it better work with Vue 2.x
- Make service and directive more flexible and granular as needed

### Changelog

- Changed life cycle method `ready` to `mounted` with `$nextTick`
- Add `$dragula` to Vue.prototype to make available on each component instance
- Add ability to create DragulaServices per container.
- Add ability to create and set eventbus per service, either shared or independent
- Add methods on `$dragula`
  - `create({name, eventBus})` : create new service
  - `allOn(handlerConfig = {})` : add set of eventBus handlers to all services
  - `service(name)` : access individual service
- Make `bind` try to bind directive (with bags) to a matching named component service before falling back to bind to global dragula service.

The DragulaService now takes an options hash:

```js
  constructor ({name, eventBus, bags}) {
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

### Binding models to dragable elements

Please note that vue-dragula expects the `v-dragula` expression to be linked to an underlying model in the VM. When you move the elements in the UI you also rearrange the underlying model data (using `findModelForContainer`). 
This is VERY POWERFUL!!

Note that the special Vue events `removeModel` and `dropModel` are emitted as models are shifted around.

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

Each `bag` is setup to delegate dragula events to Vue eventbus events of the same name. This allows you to define custom event handling as regular Vue event handlers.

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

You can access them from `Vue.vueDragula`

### `options(name, options)`

Set dragula options, refer to: https://github.com/bevacqua/dragula#optionscontainers
```js
...
new Vue({
  ...
  created: function () {
    Vue.vueDragula.options('my-bag', {
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
    Vue.vueDragula.eventBus.$on('drop', function (args) {
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

## Issues on Vue 2

```
  function ready () {
    
    domReadyTime = Date.now() ;
      
    // First, check if it's a PRE and exit if not
      var bodyChildren = document.body.childNodes ;
```

```
Exception:
TypeError: Cannot read property 'childNodes' of null at HTMLDocument.ready
```       

### Recommendations

Basically, the example needs to use proper `.vue` templates to work as discussed [here](https://github.com/vuejs-templates/webpack/issues/215)

So please update example to use webpack or better yet, create demo app using basic Vue2 setup with webpack :)  

I've started such a [demo app](https://github.com/kristianmandrup/vue2-dragula-demo) but having problems :() 

I don't yet understand the Vue2 plugin architecture! Please help out...

### Vue 2 Plugin

Trying to add dragula as a [Vue 2 plugin](https://vuejs.org/v2/guide/plugins.html)

```js
  // 3. inject some component options
  Vue.mixin({
    created: function () {
      // something logic ...
    }
    ...
  })
  // 4. add an instance method
  Vue.prototype.$myMethod = function (options) {
    // something logic ...
  }  
```

Looks correct to add `$dragula` to `Vue.prototype` as shown [here](https://github.com/aarondfrancis/vue-model/blob/master/src/VueModel.js#L99)

```js
function plugin (Vue, options = {}) {
  if (plugin.installed) {
    console.warn('[vue-dragula] already installed.')
  }

  console.log('Add Dragula plugin:', options)
  VueDragula(Vue, options)
}
```


We then call the function in `vue-dragula.js` which adds `$dragula` to `Vue.prototype` in accordance with Vue 2 specs on plugins.
What is missing!?!?! WTF!!!

```js
export default function (Vue, options = {}) {
  const service = new DragulaService(Vue)

  let name = 'globalBag'
  let drake

  console.log('Adding Dragula as plugin...')
  Vue.$dragula = {
    options: service.setOptions.bind(service),
    find: service.find.bind(service),
    eventBus: service.eventBus
  }
  Vue.prototype.$dragula = Vue.$dragula 
}
```