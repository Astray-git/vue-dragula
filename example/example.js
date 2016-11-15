var Vue = require('vue')
var VueDragula = require('../dist/vue-dragula')
Vue.config.debug = true

Vue.use(VueDragula)

let template = require('./template');

new Vue({
  el: '#app',

  // Does NOT seem to work anymore...
  // template: require('./template'),

  // Would needs to convert into manual VDOM 
  // render () {
  //   return template
  // },

  data () {
    return {
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
    }
  },
  created () {
    console.log(Vue, Vue.prototype)

    Vue.$dragula.options('third-bag', {
      copy: true
    })
  },
  // See https://vuejs.org/v2/guide/instance.html#Instance-Lifecycle-Hooks
  mounted () {
    console.log('Mounted')    
    this.$nextTick(() => {
      console.log('Comfig $dragula.eventBus', this.$dragula.eventBus)
      // since $dragula in on Vue.prototype which all Components inherit from
      // you should also be able to do: this.$dragula  
      this.$dragula.eventBus.$on(
        'drop',
        function (args) {
          console.log('drop: ' + args[0])
          console.log(this.categories)
        }
      )
      this.$dragula.eventBus.$on(
        'dropModel',
        function (args) {
          console.log('dropModel: ' + args)
          console.log(this.categories)
        }
      )
    })
  },
  methods: {
    onClick () {
      console.log(this.$dragula.find('first-bag'))
      window.alert('click event')
    },
    testModify () {
      this.categories = [
        ['a', 'b', 'c'],
        ['d', 'e', 'f']
      ]
    }
  }
}) //.$mount('#app')
