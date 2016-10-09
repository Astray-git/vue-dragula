var Vue = require('vue')
var VueDragula = require('../dist/vue-dragula')

Vue.config.debug = true

Vue.use(VueDragula)

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
    ],
    categories: [
      [1, 2, 3],
      [4, 5, 6]
    ]
  },
  created: function () {
    var filterContainer = this.$els.filter
    Vue.vueDragula.options('first-bag', {
      copy: function () {
        console.log(filterContainer)
        return true
      },
      removeOnSpill: true
    })
  },
  ready: function () {
    var _this = this
    Vue.vueDragula.eventBus.$on(
      'drop',
      function (args) {
        console.log('drop: ' + args[0])
        console.log(_this.categories)
      }
    )
    Vue.vueDragula.eventBus.$on(
      'dropModel',
      function (args) {
        console.log('dropModel: ' + args)
        console.log(_this.categories)
      }
    )
  },
  methods: {
    onClick: function () {
      console.log(Vue.vueDragula.find('first-bag'))
      window.alert('click event')
    },
    test: function () {
      // this.categories = []
      // this.$nextTick(function () {
      //   this.categories = [
      //     ['a', 'b', 'c'],
      //     ['d', 'e', 'f']
      //   ]
      // })
      // this.categories = [
      //   ['a', 'b', 'c'],
      //   ['d', 'e', 'f']
      // ]
      var sec = this.categories[1]
      sec.splice(sec.length - 1, 1)
      //this.categories[0].push(this.categories[1][])
    }
  }
})
