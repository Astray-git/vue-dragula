import VueDragula from "./vue-dragula";

export default VueDragula;

var inBrowser = typeof window !== "undefined";

if (inBrowser && window.Vue) {
  window.Vue.use(VueRouter);
}
