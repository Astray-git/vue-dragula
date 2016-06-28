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
    eventBus: service.eventBus
  }

  Vue.directive('dragula', {
    params: ['bag'],

    bind () {
      const container = this.el
      const bagName = this.params.bag
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

    update (newValue, oldValue) {
      if (!newValue) { return }

      if (!drake.models) {
        drake.models = [newValue]
      } else {
        let modelIndex = oldValue
          ? drake.models.indexOf(oldValue)
          : -1
        if (modelIndex >= 0) {
          drake.models.splice(modelIndex, 1, newValue)
        } else {
          drake.models.push(newValue)
        }
      }
    },

    unbind () {
      const container = this.el
      let unbindBagName = 'globalBag'
      const bagName = this.params.bag
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

