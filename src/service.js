import dragula from 'dragula'

if (!dragula) {
  throw new Error('[vue-dragula] cannot locate dragula.')
}

class DragulaService {
  constructor (Vue) {
    this.bags = {} // bag store
    this.eventBus = new Vue()
    this.events = [
      'cancel',
      'cloned',
      'drag',
      'dragend',
      'drop',
      'out',
      'over',
      'remove',
      'shadow',
      'drop-model',
      'remove-model'
    ]
  }

  add (name, drake) {
    let bag = this.bags[name]
    if (!bag) {
      bag = {
        name,
        drake
      }
      this.bags[name] = bag
    } else {
      // update drake
      const oldDrake = bag.drake
      drake.containers = oldDrake.containers
      drake.models = oldDrake.models
      bag.drake = drake
      oldDrake.destroy()
    }

    if (!bag.initEvents) {
      this.setupEvents(bag)
    }
    return bag
  }

  setOptions (name, options) {
    let bag = this.add(name, dragula(options))
    this.registerDrake(name, bag.drake)
  }

  getDrake (name) {
    return (this.bags[name] || {}).drake
  }

  registerDrake (name, drake) {
    if (drake.registered) { // do not register events twice
      return
    }
    let dragElm
    let dragIndex
    let dropIndex
    let sourceModel
    let targetModel
    drake.on('remove', (el, container, source) => {
      if (!drake.models) {
        return
      }
      const sourceModelContainer = this.findModelContainerByContainer(source, drake)
      sourceModel = sourceModelContainer.model
      sourceModel.splice(dragIndex, 1)
      drake.cancel(true)
      const removeSource = {
        el: source,
        model: sourceModel,
        expression: sourceModelContainer.expression
      }
      this.eventBus.$emit('remove-model', name, el, removeSource, dragIndex)
    })
    drake.on('drag', (el, source) => {
      dragElm = el
      dragIndex = this.domIndexOf(el, source)
    })
    drake.on('drop', (dropElm, target, source) => {
      if (!drake.models || !target) {
        return
      }
      dropIndex = this.domIndexOf(dropElm, target)
      const sourceModelContainer = this.findModelContainerByContainer(source, drake)
      sourceModel = sourceModelContainer.model
      const dropSource = {
        el: source,
        model: sourceModel,
        expression: sourceModelContainer.expression
      }
      let dropTarget = {}

      if (target === source) {
        // using original splice to avoid re-render
        Array.prototype.splice.call(sourceModel,
          dropIndex,
          0,
          Array.prototype.splice.call(sourceModel, dragIndex, 1)[0]
        )

        dropTarget = dropSource
      } else {
        let notCopy = dragElm === dropElm
        const targetModelContainer = this.findModelContainerByContainer(target, drake)
        targetModel = targetModelContainer.model
        let dropElmModel = notCopy
          ? sourceModel[dragIndex]
          : JSON.parse(JSON.stringify(sourceModel[dragIndex]))
        if (notCopy) {
          Array.prototype.splice.call(sourceModel, dragIndex, 1)
        }
        Array.prototype.splice.call(targetModel, dropIndex, 0, dropElmModel)

        dropTarget = {
          el: target,
          model: targetModel,
          expression: targetModelContainer.expression
        }
      }
      drake.cancel(true)
      this.eventBus.$emit('drop-model', name, dropElm, dropTarget, dropSource, dropIndex)
    })
    drake.registered = true
  }

  destroy (name) {
    let bag = this.bags[name]
    if (!bag) { return }
    delete this.bags[name]
    bag.drake.destroy()
  }

  setupEvents (bag) {
    bag.initEvents = true
    let _this = this
    let emitter = type => {
      function replicateEvent (...args) {
        _this.eventBus.$emit.apply(_this.eventBus, [type, bag.name].concat(args))
      }
      bag.drake.on(type, replicateEvent)
    }
    this.events.forEach(emitter)
  }

  domIndexOf (child, parent) {
    return Array.prototype.indexOf.call(
      parent.children,
      child
    )
  }

  findModelContainerByContainer (container, drake) {
    if (!drake.models) {
      return
    }
    return drake.models.find(model => model.container === container)
  }
}

export default DragulaService
