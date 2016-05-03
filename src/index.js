import VueDragula from './vue-dragula'

function plugin (Vue, options = {}) {
  if (plugin.installed) {
    console.warn('[vue-dragula] already installed.')
  }

  VueDragula(Vue)
}

plugin.version = '1.0.0'

export default plugin

if (typeof define === 'function' && define.amd) { // eslint-disable-line
  define([], () => { plugin }) // eslint-disable-line
} else if (window.Vue) {
  window.Vue.use(plugin)
}
