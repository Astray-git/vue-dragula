var Vue = require('vue');
var VueDragula = require('../vue-dragula');

Vue.config.debug = true;

Vue.use(VueDragula);

new Vue({
  el: '#examples',
  data: {
    colOne: [
      'You can move these elements between these two containers',
      'Moving them anywhere else isn"t quite possible',
      'There"s also the possibility of moving elements around in the same container, changing their position'
    ],
    colTwo: [
      'This is the default use case. You only need to specify the containers you want to use',
      'More interactive use cases lie ahead',
      'Another message'
    ]
  },
  methods: {
    onClick: function () {
      window.alert('click event');
    }
  },
  created: function () {
    console.log('new');
  }
});