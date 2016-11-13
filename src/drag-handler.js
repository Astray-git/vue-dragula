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

export class DragHandler {
  constructor({ctx, name, drake}) {
    this.dragElm = null
    this.dragIndex = null
    this.dropIndex = null
    this.sourceModel = null
    this.ctx = ctx
    this.drake = drake
    this.name = name
    this.eventBus = ctx.eventBus
    this.findModelForContainer = ctx.findModelForContainer
    this.domIndexOf = ctx.domIndexOf
  }

  remove (el, container, source) {
    if (!this.drake.models) {
      return
    }
    this.sourceModel = this.findModelForContainer(source, this.drake)
    this.sourceModel.splice(this.dragIndex, 1)
    this.drake.cancel(true)
    this.eventBus.$emit('removeModel', [this.name, el, source, this.dragIndex])
  }

  drag (el, source) {
    this.dragElm = el
    this.dragIndex = this.domIndexOf(el, source)
  }

  drop (dropElm, target, source) {
    if (!this.drake.models || !target) {
      return
    }
    this.dropIndex = this.domIndexOf(dropElm, target)
    this.sourceModel = this.findModelForContainer(source, this.drake)

    if (target === source) {
      thissourceModel.splice(this.dropIndex, 0, this.sourceModel.splice(this.dragIndex, 1)[0])
    } else {
      let notCopy = this.dragElm === dropElm
      let targetModel = this.findModelForContainer(target, this.drake)
      let dropElmModel = notCopy ? this.dropElmModel : this.jsonDropElmModel

      if (notCopy) {
        waitForTransition(() => {
          this.sourceModel.splice(this.dragIndex, 1)
        })
      }
      targetModel.splice(this.dropIndex, 0, dropElmModel)
      this.drake.cancel(true)
    }
    this.eventBus.$emit('dropModel', [this.name, dropElm, target, source, this.dropIndex])
  }

  get dropElmModel() {
    return this.sourceModel[this.dragIndex]
  }

  get jsonDropElmModel() {
    return JSON.parse(JSON.stringify(this.sourceModel[this.dragIndex]))
  }
}




