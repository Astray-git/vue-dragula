# vue-dragula
:ok_hand: Drag and drop so simple it hurts

> Vue wrapper for dragula


## Setup
script:
``` javascript
var Vue = require('vue');
var VueDragula = require('vue-dragula');

Vue.use(VueDragula);
```

template:
``` html
<div class="wrapper">
  <div class="container" v-dragula="colOne" bag="first-bag">
    <div v-for="text in colOne" @click="onClick">{{text}} [click me]</div>
  </div>
  <div class="container" v-dragula="colTwo" bag="first-bag">
    <div v-for="text in colTwo">{{text}}</div>
  </div>
</div>
```
