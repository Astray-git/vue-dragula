var Vue = require('vue/dist/vue')
var VueDragula = require('vue-dragula')

Vue.use(VueDragula)

new Vue({
  el: '#app',
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
    ],
    wrapOne: [
      {
        name: 'one'
      },
      {
        name: 'two'
      },
      {
        name: 'three'
      }
    ],
    wrapTwo: [
      {
        name: 'one1'
      },
      {
        name: 'two1'
      },
      {
        name: 'three1'
      }
    ]
  },
  created: function () {

  },
  mounted: function () {
    Vue.dragula.options('third-bag', {
      copy: true
    })
    var vm = this
    Vue.dragula.eventBus.$on(
      'drop',
      function (bagName, el) {
        console.log(bagName)
      }
    )
    this.$dragula.eventBus.$on(
      'drop-model',
      function (bagName, el, dropTarget, dropSource, dropIndex) {
        console.log('dropModel: ' + bagName)
        updateModel(vm, dropTarget, dropSource)
      }
    )
  },
  methods: {
    onClick: function () {
      console.log(this.$dragula.getDrake('first-bag'))
      window.alert('click event')
    },
    testModify: function () {
      this.categories = [
        ['a', 'b', 'c'],
        ['d', 'e', 'f']
      ]
    }
  },
  filters: {
    json: function (value) {
      return JSON.stringify(value)
    }
  },
  components: {
    wrapper: {
      template: '<div class="test"><div>{{item.name}}</div></div>',
      props: {
        item: {type: Object}
      }
    }
  }
})

function updateModel (vm, dropTarget, dropSource) {
  vm[dropSource.expression] = dropSource.model
  if (dropTarget.el === dropSource.el) { return }
  vm[dropTarget.expression] = dropTarget.model
}
