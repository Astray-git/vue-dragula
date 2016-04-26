
var dragula = require('dragula');
var dragulaKey = '$$dragula';

module.exports = {
  find: find,
  add: add,
  handleModels: handleModels
};

function domIndexOf (child, parent) {
  return Array.prototype.indexOf.call(parent.children, child);
}

function handleModels(vm, drake){
  if(drake.registered){ // do not register events twice
    return;
  }
  var dragElm;
  var dragIndex;
  var dropIndex;
  var sourceModel;
  var _this = this;
  drake.on('remove',function removeModel (el, source) {
    if (!drake.models) {
      return;
    }
    sourceModel = drake.models[drake.containers.indexOf(source)];
      sourceModel.splice(dragIndex, 1);
      drake.emit('remove-model', el, source);
  });
  drake.on('drag',function dragModel (el, source) {
    dragElm = el;
    dragIndex = domIndexOf(el, source);
  });
  drake.on('drop',function dropModel (dropElm, target, source) {
    if (!drake.models) {
      return;
    }
    dropIndex = domIndexOf(dropElm, target);
    sourceModel = drake.models[drake.containers.indexOf(source)];
    if (target === source) {
      sourceModel.splice(dropIndex, 0, sourceModel.splice(dragIndex, 1)[0]);
    } else {
      var notCopy = dragElm === dropElm;
      var targetModel = drake.models[drake.containers.indexOf(target)];
      var dropElmModel = notCopy ? sourceModel[dragIndex] : angular.copy(sourceModel[dragIndex]);

      if (notCopy) {
        sourceModel.splice(dragIndex, 1);
      }
      targetModel.splice(dropIndex, 0, dropElmModel);
    }
    drake.emit('drop-model', dropElm, target, source);
  });
  drake.registered = true;
}

function getOrCreateCtx (vm) {
  var ctx = vm[dragulaKey];
  if (!ctx) {
    ctx = vm[dragulaKey] = {
      bags: []
    };
  }
  return ctx;
}

function find (vm, name) {
  var bags = getOrCreateCtx(vm).bags;
  for (var i = 0; i < bags.length; i++) {
    if (bags[i].name === name) {
      return bags[i];
    }
  }
}

function add (vm, name, drake) {
  var bag = find(vm, name);
  if (bag) {
    throw new Error('Bag named: "' + name + '" already exists in same vm.');
  }
  var ctx = getOrCreateCtx(vm);
  bag = {
    name: name,
    drake: drake
  };
  ctx.bags.push(bag);
  return bag;
}

function destroy (vm, name) {
  var bags = getOrCreateCtx(vm).bags;
  var bag = find(vm, name);
  var i = bags.indexOf(bag);
  bags.splice(i, 1);
  bag.drake.destroy();
}

function setOptions (scope, name, options) {
  var bag = add(scope, name, dragula(options));
  handleModels(scope, bag.drake);
}
