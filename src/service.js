import dragula from 'dragula'

if (!dragula) {
  throw new Error('[vue-dragula] cannot locate dragula.')
}

const raf = window.requestAnimationFrame
const waitForTransition = raf
  ? function (fn) {
    raf(() => {
      raf(fn)
    })
  }
  : function (fn) {
    window.setTimeout(fn, 50)
  }

class DragulaService {
  constructor ({name, eventBus, bags, drake, options}) {
    this.options = options || {}
    this.logging = options.logging
    this.name = name
    this.bags = bags = {} // bag store
    this.eventBus = eventBus
    this.drake = drake
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
      'dropModel',
      'removeModel'
    ]
  }

  log(event, ...args) {
    if (!this.logging) return
    console.log(`DragulaService [${this.name}] :`, event, ...args)
  }

  error(msg) {
    console.error(msg)
    throw new Error(msg)
  }

  get bagNames() {
    return Object.keys(this.bags)
  }

  add (name, drake) {
    drake = drake || this.drake
    this.log('add (bag)', name, drake)
    let bag = this.find(name)
    if (bag) {
      this.log('existing bags', this.bagNames)
      let errMsg = `Bag named: "${name}" already exists for this service [${this.name}]. 
      Most likely this error in cause by a race condition evaluating multiple template elements with 
      the v-dragula directive having the same bag name. Please initialise the bag in the created() life cycle hook of the VM to fix this problem.`
      this.error(msg)
    }
    this.bags[name] = drake
    if (drake.models) {
      this.handleModels(name, drake)
    }
    if (!bag.initEvents) {
      this.setupEvents(bag)
    }
    return bag
  }

  find (name) {
    this.log('find (bag) by name', name)
    return this.bags[name]
  }

  handleModels (name, drake) {
    drake = drake || this.drake
    this.log('handleModels', name, drake)

    if (drake.registered) { // do not register events twice
      return
    }
    let dragElm
    let dragIndex
    let dropIndex
    let sourceModel

    drake.on('remove', (el, container, source) => {
      if (!drake.models) {
        return
      }
      sourceModel = this.findModelForContainer(source, drake)
      sourceModel.splice(dragIndex, 1)
      drake.cancel(true)
      this.eventBus.$emit('removeModel', [name, el, source, dragIndex])
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
      sourceModel = this.findModelForContainer(source, drake)

      if (target === source) {
        sourceModel.splice(dropIndex, 0, sourceModel.splice(dragIndex, 1)[0])
      } else {
        let notCopy = dragElm === dropElm
        let targetModel = this.findModelForContainer(target, drake)
        let dropElmModel = notCopy ? sourceModel[dragIndex] : JSON.parse(JSON.stringify(sourceModel[dragIndex]))

        if (notCopy) {
          waitForTransition(() => {
            sourceModel.splice(dragIndex, 1)
          })
        }
        targetModel.splice(dropIndex, 0, dropElmModel)
        drake.cancel(true)
      }
      this.eventBus.$emit('dropModel', [name, dropElm, target, source, dropIndex])
    })
    drake.registered = true
  }

  // convenience to set eventBus handlers via Object
  on (handlerConfig = {}) {
    let handlerNames = Object.keys(handlerConfig)

    for (let handlerName of handlerNames) {
      let handlerFunction = handlerConfig[handlerName]
      this.eventBus.$on(handlerName, handlerFunction)
    }
  }

  destroy (name) {
    this.log('destroy', name)
    let bag = this.find(name)
    if (!bag) { return }
    bag.drake.destroy()
    this.delete(name)
  }

  delete(name) {
    delete this.bags[name]
  }

  setOptions (name, options) {
    this.log('setOptions', name, options)
    if (!name) {
      console.error('setOptions must take the name of the bag to set options for')
      return this
    }
    let bag = this.add(name, dragula(options))
    this.handleModels(name, bag.drake)
    return this
  }

  setupEvents (bag) {
    this.log('setupEvents', bag)
    bag.initEvents = true
    let _this = this
    let emitter = type => {
      function replicate () {
        let args = Array.prototype.slice.call(arguments)
        _this.eventBus.$emit(type, [bag.name].concat(args))
      }
      bag.drake.on(type, replicate)
    }
    this.events.forEach(emitter)
  }

  domIndexOf (child, parent) {
    return Array.prototype.indexOf.call(
      parent.children,
      child
    )
  }

  findModelForContainer (container, drake) {
    drake = drake || this.drake
    this.log('findModelForContainer', container, drake)
    return (this.findModelContainerByContainer(container, drake) || {}).model
  }

  findModelContainerByContainer (container, drake) {
    drake = drake || this.drake
    if (!drake.models) {
      return
    }
    return drake.models.find(model => model.container === container)
  }
}

export default DragulaService
