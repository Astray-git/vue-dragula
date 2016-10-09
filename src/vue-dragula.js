import dragula from 'dragula'
import DragulaService from './service'

if (!dragula) {
  throw new Error('[vue-dragula] cannot locate dragula.')
}

export default function (Vue) {
  const service = new DragulaService(Vue)

  let name = 'globalBag'
  let drake

  Vue.vueDragula = {
    options: service.setOptions.bind(service),
    find: service.find.bind(service),
    eventBus: service.eventBus
  }

  Vue.directive('dragula', {
    params: ['bag'],

    bind (container, binding, vnode) {
      const bagName = vnode.data.attrs.bag
      if (bagName !== undefined && bagName.length !== 0) {
        name = bagName
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
      const {value: newValue} = binding
      if (!newValue) { return }

      const bagName = vnode.data.attrs.bag
      if (bagName !== undefined && bagName.length !== 0) {
        name = bagName
      }
      const bag = service.find(name)
      drake = bag.drake
      if (!drake.models) {
        drake.models = []
      }

      let modelContainer = service.findModelContainerByContainer(vnode.elm, drake)

      if (modelContainer) {
        modelContainer.model = newValue
      } else {
        drake.models.push({
          model: newValue,
          container: vnode.elm
        })
      }
    },

    unbind (container, binding, vnode) {
      let unbindBagName = 'globalBag'
      const bagName = vnode.data.attrs.bag
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

