import dragula from 'dragula'
import DragulaService from './service'

if (!dragula) {
  throw new Error('[vue-dragula] cannot locate dragula.')
}

export default function (Vue, options = {}) {
  const eventBus = new Vue()
  const service = new DragulaService({
    name: 'global.dragula',
    eventBus,
    bags: options.bags
  })

  let name = 'globalBag'
  let drake

  console.log('Adding Dragula as plugin...')

  Vue.prototype.$dragula = {
    options: service.setOptions.bind(service),
    find: service.find.bind(service),
    eventBus: service.eventBus,

    create: function(serviceOpts = {}) {
      this.services = this.services || {};
      let containers = serviceOpts.containers || []
      let eventBus = serviceOpts.eventBus || eventBus
      let bags = serviceOpts.bags || []

      for (let container of containers) {
        let name = container
        let service = new DragulaService({
          name,
          eventBus,
          bags
        })
        this.services[name] = service
      }
      return this
    },
    allOn: function(handlerConfig = {}) {
      let services = Object.values(this.services)
      for (let service of services) {
        service.on(handlerConfig)
      }
    },
    // allow specifying individual handlers on particular servic
    service: function(name) {
      return this.services[name]
    }
  }

  Vue.directive('dragula', {
    params: ['bag'],

    bind (container, binding, vnode) {
      console.log('bind Dragula', container)

      const bagName = vnode
        ? vnode.data.attrs.bag // Vue 2
        : this.params.bag // Vue 1
      if (!vnode) {
        container = this.el // Vue 1
      }
      if (bagName !== undefined && bagName.length !== 0) {
        name = bagName
      }

      // first try to register on DragulaService of component
      let $dragulaOfComponent = vnode.context.$dragula
      if ($dragulaOfComponent) {
        containerName = binding.expression

        drake = dragula({
          containers: [container]
        })

        let containerService = $dragulaOfComponent.services[containerName]

        if (containerService) {
          containerService.add(name, drake)
          containerService.handleModels(name, drake)
          return
        }
      }

      const bag = service.find(name)
      if (bag) {
        drake = bag.drake
        drake.containers.push(container)
        return
      }
      drake = dragula({
        containers: [container]
      })
      service.add(name, drake)

      service.handleModels(name, drake)
    },

    update (container, binding, vnode, oldVnode) {
      console.log('update Dragula', container, binding, vnode)
      console.log('context', vnode.context)

      const newValue = vnode
        ? binding.value // Vue 2
        : container // Vue 1
      if (!newValue) { return }

      const bagName = vnode
        ? vnode.data.attrs.bag  // Vue 2
        : this.params.bag // Vue 1
      if (bagName !== undefined && bagName.length !== 0) {
        name = bagName
      }
      const bag = service.find(name)
      drake = bag.drake
      if (!drake.models) {
        drake.models = []
      }

      if (!vnode) {
        container = this.el // Vue 1
      }
      let modelContainer = service.findModelContainerByContainer(container, drake)

      if (modelContainer) {
        modelContainer.model = newValue
      } else {
        drake.models.push({
          model: newValue,
          container: container
        })
      }
    },

    unbind (container, binding, vnode) {
      console.log('unbind Dragula', container)

      let unbindBagName = 'globalBag'
      const bagName = vnode
        ? vnode.data.attrs.bag // Vue 2
        : this.params.bag // Vue 1
      if (bagName !== undefined && bagName.length !== 0) {
        unbindBagName = bagName
      }
      var drake = service.find(unbindBagName).drake
      if (!drake) { return }
      var containerIndex = drake.containers.indexOf(container)
      if (containerIndex > -1) {
        drake.containers.splice(containerIndex, 1)
      }
      if (drake.containers.length === 0) {
        service.destroy(unbindBagName)
      }
    }

  })
}

