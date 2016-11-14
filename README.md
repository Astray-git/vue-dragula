# vue-dragula
> :ok_hand: Drag and drop so simple it hurts

Vue wrapper for [`dragula`][1].

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
