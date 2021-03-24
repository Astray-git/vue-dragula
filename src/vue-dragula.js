import dragula from "dragula";
import DragulaService from "./service";

if (!dragula) {
  throw new Error("[vue-dragula] cannot locate dragula.");
}

export default {
  install: (app, options) => {
    const service = new DragulaService(app);

    let name = "globalBag";
    let drake;

    app.config.globalProperties.vueDragula = {
      options: service.setOptions.bind(service),
      find: service.find.bind(service),
      eventBus: service.eventBus,
    };

    app.directive("dragula", {
      params: ["bag"],

      beforeMount(container, binding, vnode) {
        const bagName = vnode.props.bag;
        if (!vnode) {
          container = this.el; // Vue 1
        }
        if (bagName !== undefined && bagName.length !== 0) {
          name = bagName;
        }
        const bag = service.find(name);
        if (bag) {
          drake = bag.drake;
          drake.containers.push(container);
          return;
        }
        drake = dragula({
          containers: [container],
        });
        service.add(name, drake);

        service.handleModels(name, drake);
      },

      updated(container, binding, vnode, oldVnode) {
        console.log(binding.value);
        const newValue = vnode
          ? binding.value // Vue 2
          : container; // Vue 1
        if (!newValue) {
          return;
        }

        const bagName = vnode.props.bag;
        if (bagName !== undefined && bagName.length !== 0) {
          name = bagName;
        }
        const bag = service.find(name);
        drake = bag.drake;
        if (!drake.models) {
          drake.models = [];
        }

        if (!vnode) {
          container = this.el; // Vue 1
        }
        let modelContainer = service.findModelContainerByContainer(
          container,
          drake
        );

        if (modelContainer) {
          modelContainer.model = newValue;
        } else {
          drake.models.push({
            model: newValue,
            container: container,
          });
        }
      },

      unmounted(container, binding, vnode) {
        let unbindBagName = "globalBag";
        const bagName = vnode.props.bag;
        if (!vnode) {
          container = this.el; // Vue 1
        }
        if (bagName !== undefined && bagName.length !== 0) {
          unbindBagName = bagName;
        }
        var drake = service.find(unbindBagName).drake;
        if (!drake) {
          return;
        }
        var containerIndex = drake.containers.indexOf(container);
        if (containerIndex > -1) {
          drake.containers.splice(containerIndex, 1);
        }
        if (drake.containers.length === 0) {
          service.destroy(unbindBagName);
        }
      },
    });
  },
};
