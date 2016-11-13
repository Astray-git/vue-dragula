import dragula from 'dragula'
import { DragulaService } from './service'

if (!dragula) {
  throw new Error('[vue-dragula] cannot locate dragula.')
}

const defaults = {
  createService: function ({name, eventBus, drakes}) {
    return new DragulaService({
      name,
      eventBus,
      drakes
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
    drakes: options.drakes
  })

  let globalName = 'globalDrake'
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

      // alias
      this.createServices = this.createService
    }

    optionsFor(name, opts = {}) {
      this.service(name).setOptions(opts)
      return this
    }

    createService(serviceOpts = {}) {
      this._serviceMap = this._serviceMap || {};
      let names = serviceOpts.names || []
      let name = serviceOpts.name || []
      let drakes = serviceOpts.drakes || {}
      let opts = Object.assign({}, options, serviceOpts)
      names = names || [name]
      let eventBus = serviceOpts.eventBus || eventBus


      for (let name of names) {
        let newService = new DragulaService({
          name,
          eventBus,
          options: opts
        })

        this._serviceMap[name] = newService

        if (drakes) {
          this.drakesFor(name, drakes)
        }
      }
      return this
    }

    drakesFor(name, drakes = {}) {
      let service = this.service(name)

      if (Array.isArray(drakes)) {
        // turn Array into object of [name]: true
        drakes = drakes.reduce((obj, name) => {
          obj[name] = true
          return obj
        }, {})
      }

      let drakeNames = Object.keys(drakes)
      for (let drakeName of drakeNames) {
        let drakeOpts = drakes[drakeName]
        if (drakeOpts === true) {
          drakeOpts = {}
        }

        service.setOptions(drakeName, drakeOpts)
      }
      return this
    }

    on(name, handlerConfig = {}) {
      if (typeof name === 'object') {
        handlerConfig = name
        // add event handlers for all services
        let services = Object.values(this.serviceMap)
        for (let service of services) {
          service.on(handlerConfig)
        }
      } else {
        this.service(name).on(handlerConfig)
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
      let dragula = vnode.context.$dragula
      if (dragula) {
        logDir('trying to find and use component service')

        let componentService = dragula.services[serviceName]
        if (componentService) {
          logDir('using component service', componentService)
          return componentService
        }
      }
    }
    logDir('using global service', service)
    return service.find(name, vnode)
  }

  function findDrake(name, vnode, serviceName) {
    return findService(name, vnode, serviceName).find(name, vnode)
  }

  function calcNames(name, vnode, ctx) {
    const drakeName = vnode
      ? vnode.data.attrs.drake // Vue 2
      : this.params.drake // Vue 1

    const serviceName = vnode
      ? vnode.data.attrs.service // Vue 2
      : this.params.service // Vue 1

    if (drakeName !== undefined && drakeName.length !== 0) {
      name = drakeName
    }
    return {name, drakeName, serviceName}
  }

  Vue.directive('dragula', {
    params: ['drake', 'service'],

    bind (container, binding, vnode) {
      logDir('bind', container, binding, vnode)

      const { name, drakeName, serviceName } = calcNames(globalName, vnode, this)
      const service = findService(name, vnode, serviceName)
      const drake = service.find(name, vnode)

      if (!vnode) {
        container = this.el // Vue 1
      }

      logDir({
        service: {
          name: serviceName,
          instance: service
        },
        drake: {
          name: drakeName,
          instance: drake
        },
        container
      })

      if (drake) {
        drake.containers.push(container)
        return
      }
      let newDrake = dragula({
        containers: [container]
      })
      service.add(name, newDrake)

      service.handleModels(name, newDrake)
    },

    update (container, binding, vnode, oldVnode) {
      logDir('update', container, binding, vnode)

      const newValue = vnode
        ? binding.value // Vue 2
        : container // Vue 1
      if (!newValue) { return }

      const { name, drakeName, serviceName } = calcNames(globalName, vnode, this)
      const service = findService(name, vnode, serviceName)
      const drake = service.find(name, vnode)

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
        drake: {
          name: drakeName,
          instance: drake
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

      const { name, serviceName } = calcNames(globalName, vnode, this)
      const service = findService(name, vnode, serviceName)
      const drake = service.find(name, vnode)

      logDir({
        service: {
          name: serviceName,
          instance: service
        },
        drake: {
          name: drakeName,
          instance: drake
        },
        container
      })

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

