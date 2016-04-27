;(function () {
  'use strict';

  var vueDragula = {};
  var dragulaService = require('./dragula_service.js');
  var dragula = typeof require === 'function'
    ? require('dragula')
    : window.dragula
  ;
  var dragulaKey = '$$dragula';

  if (!dragula) {
    throw new Error('[vue-dragula] cannot locate dragula.');
  }

  // exposed global options
  vueDragula.config = {};

  vueDragula.install = function (Vue) {

    var name = 'globalBag';
    var drake;

    Vue.vueDragula = {
      options: dragulaService.options
    };

    Vue.directive('dragula', {
      params: ['bag'],

      bind: function () {
        var dragulaVm = this.vm;
        var container = this.el;
        var bagName = this.params.bag;
        if (bagName !== undefined && bagName.length !== 0) {
          name = bagName;
        }

        var bag = dragulaService.find(dragulaVm, name);
        if (bag) {
          drake = bag.drake;
          drake.containers.push(container);
        } else {
          drake = dragula({
            containers: [container]
          });
          dragulaService.add(dragulaVm, name, drake);
        }
      },

      update: function (newValue, oldValue) {
        if (!newValue) {return;}
        var dragulaVm = this.vm;

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

        dragulaService.handleModels.call(this, dragulaVm, drake);
      },

      unbind: function () {
        dragulaService.destroy(this.vm, name);
      }
    });

  };

  if (typeof exports === 'object') {
    module.exports = vueDragula;
  } else if (typeof define === 'function' && define.amd) {
    define([], function(){ return vueDragula; });
  } else if (window.Vue) {
    window.VueDragula = vueDragula;
    Vue.use(vueDragula);
  }

})();
