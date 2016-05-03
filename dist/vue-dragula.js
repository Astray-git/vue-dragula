/*!
 * vue-dragula v1.0.2
 * (c) 2016 Yichang Liu
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('dragula')) :
  typeof define === 'function' && define.amd ? define(['dragula'], factory) :
  (global.vueDragula = factory(global.dragula));
}(this, function (dragula) { 'use strict';

  dragula = 'default' in dragula ? dragula['default'] : dragula;

  var babelHelpers = {};

  babelHelpers.classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  babelHelpers.createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  babelHelpers;

  if (!dragula) {
    throw new Error('[vue-dragula] cannot locate dragula.');
  }

  var DragulaService = function () {
    function DragulaService(Vue) {
      babelHelpers.classCallCheck(this, DragulaService);

      this.bags = []; // bag store
      this.eventBus = new Vue();
      this.events = ['cancel', 'cloned', 'drag', 'dragend', 'drop', 'out', 'over', 'remove', 'shadow', 'dropModel', 'removeModel'];
    }

    babelHelpers.createClass(DragulaService, [{
      key: 'add',
      value: function add(name, drake) {
        var bag = this.find(name);
        if (bag) {
          throw new Error('Bag named: "' + name + '" already exists.');
        }
        bag = {
          name: name,
          drake: drake
        };
        this.bags.push(bag);
        if (drake.models) {
          this.handleModels(name, drake);
        }
        if (!bag.initEvents) {
          this.setupEvents(bag);
        }
        return bag;
      }
    }, {
      key: 'find',
      value: function find(name) {
        var bags = this.bags;
        for (var i = 0; i < bags.length; i++) {
          if (bags[i].name === name) {
            return bags[i];
          }
        }
      }
    }, {
      key: 'handleModels',
      value: function handleModels(name, drake) {
        var _this2 = this;

        if (drake.registered) {
          // do not register events twice
          return;
        }
        var dragElm = void 0;
        var dragIndex = void 0;
        var dropIndex = void 0;
        var sourceModel = void 0;
        drake.on('remove', function (el, source) {
          if (!drake.models) {
            return;
          }
          sourceModel = drake.models[drake.containers.indexOf(source)];
          sourceModel.splice(dragIndex, 1);
          _this2.eventBus.$emit('removeModel', [name, el, source]);
        });
        drake.on('drag', function (el, source) {
          dragElm = el;
          dragIndex = _this2.domIndexOf(el, source);
        });
        drake.on('drop', function (dropElm, target, source) {
          if (!drake.models || !target) {
            return;
          }
          dropIndex = _this2.domIndexOf(dropElm, target);
          sourceModel = drake.models[drake.containers.indexOf(source)];

          if (target === source) {
            sourceModel.splice(dropIndex, 0, sourceModel.splice(dragIndex, 1)[0]);
          } else {
            var notCopy = dragElm === dropElm;
            var targetModel = drake.models[drake.containers.indexOf(target)];
            var dropElmModel = notCopy ? sourceModel[dragIndex] : JSON.parse(JSON.stringify(sourceModel[dragIndex]));

            if (notCopy) {
              sourceModel.splice(dragIndex, 1);
            }
            targetModel.splice(dropIndex, 0, dropElmModel);
          }
          _this2.eventBus.$emit('dropModel', [name, dropElm, target, source]);
        });
        drake.registered = true;
      }
    }, {
      key: 'destroy',
      value: function destroy(name) {
        var bag = this.find(name);
        if (!bag) {
          return;
        }
        var bagIndex = this.bags.indexOf(bag);
        this.bags.splice(bagIndex, 1);
        bag.drake.destroy();
      }
    }, {
      key: 'setOptions',
      value: function setOptions(name, options) {
        var bag = this.add(name, dragula(options));
        this.handleModels(name, bag.drake);
      }
    }, {
      key: 'setupEvents',
      value: function setupEvents(bag) {
        bag.initEvents = true;
        var _this = this;
        var emitter = function emitter(type) {
          function replicate() {
            var args = Array.prototype.slice.call(arguments);
            _this.eventBus.$emit(type, [bag.name].concat(args));
          }
          bag.drake.on(type, replicate);
        };
        this.events.forEach(emitter);
      }
    }, {
      key: 'domIndexOf',
      value: function domIndexOf(child, parent) {
        return Array.prototype.indexOf.call(parent.children, child);
      }
    }]);
    return DragulaService;
  }();

  if (!dragula) {
    throw new Error('[vue-dragula] cannot locate dragula.');
  }

  function VueDragula (Vue) {
    var service = new DragulaService(Vue);

    var name = 'globalBag';
    var drake = void 0;

    Vue.vueDragula = {
      options: service.setOptions.bind(service),
      eventBus: service.eventBus
    };

    Vue.directive('dragula', {
      params: ['bag'],

      bind: function bind() {
        var container = this.el;
        var bagName = this.params.bag;
        if (bagName !== undefined && bagName.length !== 0) {
          name = bagName;
        }
        var bag = service.find(name);
        if (bag) {
          drake = bag.drake;
          drake.containers.push(container);
          return;
        }
        drake = dragula({
          containers: [container]
        });
        service.add(name, drake);

        service.handleModels(name, drake);
      },
      update: function update(newValue, oldValue) {
        if (!newValue) {
          return;
        }

        if (!drake.models) {
          drake.models = [newValue];
        } else {
          var modelIndex = oldValue ? drake.models.indexOf(oldValue) : -1;
          if (modelIndex >= 0) {
            drake.models.splice(modelIndex, 1, newValue);
          } else {
            drake.models.push(newValue);
          }
        }
      },
      unbind: function unbind() {
        service.destroy(name);
      }
    });
  }

  function plugin(Vue) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    if (plugin.installed) {
      console.warn('[vue-dragula] already installed.');
    }

    VueDragula(Vue);
  }

  plugin.version = '1.0.0';

  if (typeof define === 'function' && define.amd) {
    // eslint-disable-line
    define([], function () {
      plugin;
    }); // eslint-disable-line
  } else if (window.Vue) {
      window.Vue.use(plugin);
    }

  return plugin;

}));