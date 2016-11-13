import dragula from 'dragula'
import { DragulaService } from './service'
import merge from 'lodash.merge'

if (!dragula) {
  throw new Error('[vue-dragula] cannot locate dragula.')
}

const defaults = {
  createService: function ({name, eventBus, bags}) {
    return new DragulaService({
      name,
      eventBus,
      bags
    })
  },
  createEventBus: function(Vue, options = {}) {
    return new Vue()
  }
}

export default function (Vue, options = {}) {
  function logPlugin(...args) {
    if (!options.logging) return
    console.log('vue-dragula plugin', ...args)
  }

  function logDir(...args) {
    return logPlugin('v-dragula directive', ...args);
  }

  logPlugin('Initializing vue-dragula plugin', options)

  let createService = options.createService || defaults.createService
  let createEventBus = options.createEventBus || defaults.createEventBus

  const eventBus = createEventBus(Vue, options)

  // global service
  const service = createService({
    name: 'global.dragula',
    eventBus,
    bags: options.bags
  })

  let name = 'globalBag'
  let drake

  class Dragula {
    constructor(options) {
      this.options = options

      // convenience functions on global service
      this.$service = {
        options: service.setOptions.bind(service),
        find: service.find.bind(service),
        eventBus: this.eventBus = service.eventBus
      }
    }

    optionsFor(name, opts = {}) {
      this.service(name).setOptions(opts)
      return this
    }

    create(serviceOpts = {}) {
      this._serviceMap = this._serviceMap || {};
      let names = serviceOpts.names || []
      let name = serviceOpts.name || []
      let bags = serviceOpts.bags || {}
      let opts = merge(options, serviceOpts)
      names = names || [name]
      let eventBus = serviceOpts.eventBus || eventBus


      for (let name of names) {
        let newService = new DragulaService({
          name,
          eventBus,
          bags,
          otions: opts
        })

        this._serviceMap[name] = newService

        if (bags) {
          this.bagsFor(name, bags)
        }
      }
      return this
    }

    bagsFor(name, bags = {}) {
      let service = this.service(name)

      let bagNames = Object.keys(bags)
      for (let bagName of bagNames) {
        let bagOpts = bags[bagName]
        if (bagOpts === true) {
          bagOpts = {}
        }
        service.setOptions(bagName, bagOpts)
      }
      return this
    }

    on(handlerConfig = {}) {
      let services = Object.values(this.serviceMap)
      for (let service of services) {
        service.on(handlerConfig)
      }
      return this
    }

    get serviceNames() {
      return Object.keys(this._serviceMap)
    }

    get services() {
      return Object.values(this._serviceMap)
    }

    // return named service or first service
    service(name) {
      let found = this._serviceMap[name]
      if (!found || !name) {
        let keys = this.servicesNames
        found = this._serviceMap[keys[0]]
      }
      return found
    }
  }

  Vue.$dragula = new Dragula(options)

  Vue.prototype.$dragula = Vue.$dragula

  function findService(name, vnode, serviceName) {
    // first try to register on DragulaService of component
    if (vnode) {
      let $dragulaOfComponent = vnode.context.$dragula
      if ($dragulaOfComponent) {
        logDir('trying to find and use component service')

        let componentService = $dragulaOfComponent.services[serviceName]
        if (componentService) {
          logDir('using component service', componentService)
          return componentService
        }
      }
    }
    logDir('using global service', service)
    return service.find(name, vnode)
  }

  function findBag(name, vnode, serviceName) {
    return findService(name, vnode, serviceName).find(name, vnode)
  }

  function calcNames(name, vnode, ctx) {
    const bagName = vnode
      ? vnode.data.attrs.bag // Vue 2
      : this.params.bag // Vue 1

    const serviceName = vnode
      ? vnode.data.attrs.service // Vue 2
      : this.params.service // Vue 1

    if (bagName !== undefined && bagName.length !== 0) {
      name = bagName
    }
    return {name, bagName, serviceName}
  }

  Vue.directive('dragula', {
    params: ['bag', 'service'],

    bind (container, binding, vnode) {
      logDir('bind', container, binding, vnode)

      const { name, bagName, serviceName } = calcNames('globalBag', vnode, this)
      const service = findService(name, vnode, serviceName)
      const bag = service.find(name, vnode)

      if (!vnode) {
        container = this.el // Vue 1
      }

      logDir({
        service: {
          name: serviceName,
          instance: service
        },
        bag: {
          name: bagName,
          instance: bag
        },
        container
      })

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
      logDir('update', container, binding, vnode)

      const newValue = vnode
        ? binding.value // Vue 2
        : container // Vue 1
      if (!newValue) { return }

      const { name, bagName, serviceName } = calcNames('globalBag', vnode, this)
      const service = findService(name, vnode, serviceName)
      const bag = service.find(name, vnode)

      drake = bag.drake
      if (!drake.models) {
        drake.models = []
      }

      if (!vnode) {
        container = this.el // Vue 1
      }

      let modelContainer = service.findModelContainerByContainer(container, drake)

      logDir({
        service: {
          name: serviceName,
          instance: service
        },
        bag: {
          name: bagName,
          instance: bag
        },
        container,
        modelContainer
      })

      if (modelContainer) {
        logDir('set model of container', newValue)
        modelContainer.model = newValue
      } else {
        logDir('push model and container on drake', newValue, container)
        drake.models.push({
          model: newValue,
          container: container
        })
      }
    },

    unbind (container, binding, vnode) {
      logDir('unbind', container, binding, vnode)

      const { name, serviceName } = calcNames('globalBag', vnode, this)
      const service = findService(name, vnode, serviceName)
      const bag = service.find(name, vnode)

      logDir({
        service: {
          name: serviceName,
          instance: service
        },
        bag: {
          name: bagName,
          instance: bag
        },
        container
      })

      var drake = bag.drake
      if (!drake) { return }

      var containerIndex = drake.containers.indexOf(container)

      if (containerIndex > -1) {
        logDir('remove container', containerIndex)
        drake.containers.splice(containerIndex, 1)
      }

      if (drake.containers.length === 0) {
        logDir('destroy service')
        service.destroy(name)
      }
    }

  })
}

