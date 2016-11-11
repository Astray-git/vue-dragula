var Vue = require('vue')
var VueDragula = require('../dist/vue-dragula')

Vue.config.debug = true

Vue.use(VueDragula)

new Vue({
  el: 'body',
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
    ],
    categories: [
      [1, 2, 3],
      [4, 5, 6]
    ],
    copyOne: [
      'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.',
      'Aenean commodo ligula eget dolor. Aenean massa.'
    ],
    copyTwo: [
      'Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.',
      'Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.'
    ]
  },
  created: function () {
    Vue.vueDragula.options('third-bag', {
      copy: true
    })
  },
  ready: function () {
    var _this = this
    Vue.$dragula.eventBus.$on(
      'drop',
      function (args) {
        console.log('drop: ' + args[0])
        console.log(_this.categories)
      }
    )
    Vue.$dragula.eventBus.$on(
      'dropModel',
      function (args) {
        console.log('dropModel: ' + args)
        console.log(_this.categories)
      }
    )
  },
  methods: {
    onClick: function () {
      console.log(Vue.$dragula.find('first-bag'))
      window.alert('click event')
    },
    testModify: function () {
      this.categories = [
        ['a', 'b', 'c'],
        ['d', 'e', 'f']
      ]
    }
  }
})
