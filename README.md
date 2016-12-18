# vue-dragula
> :ok_hand: Drag and drop so simple it hurts

Vue wrapper for [`dragula`][1].

## Install
#### CommonJS

- Available through npm as `vue-dragula`, add `@next` to install the pre-release version.
  ``` bash
  npm install vue-dragula@next
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

You can access them from `Vue.dragula` or `this.$dragula`

### `options(name, options)`

Set dragula options, refer to: https://github.com/bevacqua/dragula#optionscontainers
```js
...
new Vue({
  ...
  created: function () {
    Vue.dragula.options('my-bag', {
      direction: 'vertical'
    })
  }
})
```

### `getDrake(name)`

Returns the `drake` instance  according the given name of a bag.

## Events
For drake events, refer to: https://github.com/bevacqua/dragula#drakeon-events


```js
...
new Vue({
  mounted: function () {
    Vue.dragula.eventBus.$on('drop', function (args) {
      console.log('drop: ' + args[0])
    })
  }
})
```


## Special Events for vue-dragula

| Event Name |      Listener Arguments      |
| :-------------: |:-------------:| -----|
| drop-model | bagName, el, dropTarget, dropSource, dropIndex |
| remove-model | bagName, el, dropTarget, dropSource, dropIndex |

`dropTarget`, `dropSource`, properties:

- `el`: the DOM element
- `model`: updated model
- `expression`: the expression for directive

A sample function to update model on events:
```js
function updateModel (vm, dropTarget, dropSource) {
  vm[dropSource.expression] = dropSource.model
  if (dropTarget.el === dropSource.el) { return }
  vm[dropTarget.expression] = dropTarget.model
}
```

[1]: https://github.com/bevacqua/dragula
