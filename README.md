# vue-dragula
> :ok_hand: Drag and drop so simple it hurts

Vue wrapper for [`dragula`][1].

## Status

WIP attempting to make example work with Vue 2.x

### Changelog

- Changed life cycle method `ready` to `mounted`
- Using `$nextTick` callback as recommended in Vue2 guide
- Using `this.$dragula` to access dragula extension/plugin  via Vue prototype global inherited by components 

### TODO

Check new [directives API](https://vuejs.org/v2/guide/custom-directive.html) and modify as needed:

`bind`: called only once, when the directive is first bound to the element. This is where you can do one-time setup work.

`inserted`: called when the bound element has been inserted into its parent node (this only guarantees parent node presence, not necessarily in-document).

`update`: called after the containing component has updated, but possibly before its children have updated. The directive’s value may or may not have changed, but you can skip unnecessary updates by comparing the binding’s current and old values (see below on hook arguments).

`componentUpdated`: called after the containing component and its children have updated.

`unbind`: called only once, when the directive is unbound from the element.


Currently, `bind`, `update` and `unbind` hooks are used.

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

**NOTE** Vuejs 2.x 

To make sure a correct update for DOM element order, we must provide a `key` for `v-for` directive inside a dragula container. https://vuejs.org/v2/guide/list.html#key  
With `v-for="item in list"`, we need `:key="item.id"` for object items, `:key="item"` for plain string.



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