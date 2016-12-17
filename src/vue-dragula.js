import dragula from 'dragula'
import DragulaService from './service'

if (!dragula) {
  throw new Error('[vue-dragula] cannot locate dragula.')
}

export default function (Vue) {
  const isVue2 = Vue.elementDirective === undefined

  const service = new DragulaService(Vue)

  const vueDragula = {
    options: service.setOptions.bind(service),
    getDrake: service.getDrake.bind(service),
    eventBus: service.eventBus
  }

  Vue.dragula = vueDragula
  Vue.prototype.$dragula = vueDragula

  Vue.directive('dragula', {
    params: ['bag'], // Vue 1

    bind (el, binding, vnode) {
      const {container, name} = getBindInfo.call(this, isVue2, el, vnode)
      let drake = service.getDrake(name)
      if (drake) {
        drake.containers.push(container)
        if (!isVue2) { return }

        if (!drake.models) { // Vue2,handle pre added drake via $dragula.options
          drake.models = []
        }
        drake.models.push({
          model: binding.value.slice(),
          container: container,
          expression: binding.expression
        })
        return
      }

      drake = dragula({
        containers: [container]
      })
      service.add(name, drake)
      service.registerDrake(name, drake)
      if (!isVue2) {
        return
      }
      drake.models = [{
        model: binding.value.slice(),
        container: container,
        expression: binding.expression
      }]
    },

    update (el, binding, vnode) {
      const newValue = isVue2
        ? binding.value // Vue 2
        : el // Vue 1
      if (!newValue) { return }

      const {container, name} = getBindInfo.call(this, isVue2, el, vnode)
      const drake = service.getDrake(name)
      if (!drake.models) {
        drake.models = []
      }

      let modelContainer = service.findModelContainerByContainer(container, drake)

      if (modelContainer) {
        modelContainer.model = newValue.slice()
      } else {
        drake.models.push({
          model: newValue.slice(),
          container: container,
          expression: binding.expression
        })
      }
    },

    unbind (el, binding, vnode) {
      const {container, name} = getBindInfo.call(this, isVue2, el, vnode)

      const drake = service.getDrake(name)
      if (!drake) { return }
      const containerIndex = drake.containers.indexOf(container)
      if (containerIndex > -1) {
        drake.containers.splice(containerIndex, 1)
      }
      if (drake.containers.length === 0) {
        service.destroy(name)
      }
    }

  })
}

function getBindInfo (isVue2, el, vnode) {
  let bagName = 'globalBag'
  let name = 'globalBag'
  let container
  if (isVue2) { // Vue 2
    bagName = vnode.data.attrs.bag
    container = el
  } else { // Vue 1
    bagName = this.params.bag
    container = this.el
  }
  if (bagName !== undefined && bagName.length !== 0) {
    name = bagName
  }
  return {
    container,
    name
  }
}
