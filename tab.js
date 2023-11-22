// Things with Attributes and Behaviors (TAB)
//    land back, water back, medicine back, ceremony back
// A Node.js tool for vernacular autoethnosis:
//
// - *Things* are *made* from *models* that list *attributes*, including *behaviors*.
// - *Attributes* become *properties* of the *model*.
// - *Behaviors* become *methods* of the *model*.

const tab = {};

tab.models = {};
tab.behaviors = {
  thing: {},
  object: {},
  ball: {},
};

tab.models.thing = {
  additiveAttributes: new Set(["additiveAttributes", "behaviors"]),
  behaviors: new Set(["thing"])
}
tab.models.object = {
  base: "thing",
  name: "object",
  behaviors: ["object"],
  mass: 1
}
tab.models.container = {
  base: "object",
  name: "container",
  contents: [],
}

tab.models.leatherObject = {
  base: "object",
  material: "leather"
}

tab.models.ball = {
  base: "object",
  behaviors: ["ball"]
}

tab.behaviors.thing.fullName = function() {
  return this.name ? this.name : 'thing';
}

tab.behaviors.object.weigh = function() {
  return this.mass
}

tab.behaviors.object.moveTo = function(destination) {
  if (destination.hasOwnProperty('contents')) {
    destination.contents.push(this);
    this.location = destination;
  }
}

tab.behaviors.ball.bounce = function() {
  console.log("boing!");
}



tab.combineAttributes = function combineAttributes(base, extensionProp, key) {
  if (Array.isArray(base[key]) && Array.isArray(extensionProp)) {
    base[key] = [...new Set(base[key].concat(extensionProp))];
  } else if (base[key] instanceof Set) {
    if (extensionProp instanceof Set) {
      extensionProp.forEach(value => base[key].add(value));
    } else if (Array.isArray(extensionProp)) {
      extensionProp.forEach(value => base[key].add(value));
    } else if (typeof extensionProp === 'string') {
      base[key].add(extensionProp);
    }
  } else if (typeof base[key] === 'object' && typeof extensionProp === 'object') {
    base[key] = extensionProp;
  } else if (Array.isArray(base[key])) {
    base[key] = base[key].concat(extensionProp);
  } else if (typeof base[key] === 'number' && typeof extensionProp === 'number') {
    base[key] += extensionProp;
  } else if (typeof base[key] === 'string' && typeof extensionProp === 'string') {
    base[key] += extensionProp;
  }
  return base[key];
}

tab.mergeAttributes = function mergeAttributes(thing, model) {
  if (model.base) {
    const baseName = typeof model.base === 'string' ? model.base : model.base[0];
    tab.mergeAttributes(thing, tab.models[baseName]);
  }
  Object.keys(model).forEach(key => {
    if (thing.additiveAttributes && thing.additiveAttributes.has(key)) {
      thing[key] = tab.combineAttributes(thing, model[key], key);
    } else {
      const source = model[key];
      if (Array.isArray(source)) {
        thing[key] = [...source];
      } else if (source instanceof Set) {
        thing[key] = new Set(source);
      } else if (typeof source === 'object') {
        return Object.assign({}, source);
      }
      else { thing[key] = source };
    }
  });
}

tab.makeThing = function makeThing(...args) {
  const thing = Object.assign({}, tab.models.thing);
  args.forEach((arg, index) => {
    if (typeof arg === "string") {
      const model = tab.models[arg];
      if (model.base) {
        const bases = Array.isArray(model.base) ? model.base : [model.base];
        bases.forEach(baseName => {
          tab.mergeAttributes(thing, tab.models[baseName]);
        });
      }
      tab.mergeAttributes(thing, model);
      delete thing.base;
    } else if (typeof arg === "object") {
      if (arg.base) {
        const bases = Array.isArray(arg.base) ? arg.base : [arg.base];
        bases.forEach(baseName => {
          tab.mergeAttributes(thing, tab.models[baseName]);
        });
      }
      tab.mergeAttributes(thing, arg);
      delete thing.base;
    };
  });
  return new Proxy(thing, {
    get(target, prop, receiver) {
      if (Reflect.has(target, prop)) {
        return Reflect.get(target, prop, receiver);
      } else if (target.behaviors instanceof Set) {
        for (let behavior of target.behaviors) {
          if (tab.behaviors[behavior] && typeof tab.behaviors[behavior][prop] === 'function') {
            return function(...args) {
              return tab.behaviors[behavior][prop].apply(receiver, args);
            };
          }
        }
      }
      return undefined;
    }
  });
}

module.exports = tab