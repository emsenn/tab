// Things with Attributes and Behaviors (TAB)
//    land back, water back, medicine back, ceremony back
// A Node.js tool for vernacular autoethnosis:
//
// - *Things* are *made* from *models* that list *attributes*, including *behaviors*.
// - *Attributes* become *properties* of the *model*.
// - *Behaviors* become *methods* of the *model*.

const path = require('path');
const fs = require('fs');

const tab = {
  catalogDirectory: "./catalog",
  activeCatalogSections: new Set(["tab", "test"])
};

tab.loadResource = function loadResource(resourceType, resourceName) {
  for (const dir of tab.activeCatalogSections) {
    const resourcePath = path.join(__dirname, tab.catalogDirectory, dir, `${resourceName}${resourceType}`);
    if (fs.existsSync(resourcePath)) {
      if (resourceType === 'Model.json') {
        return JSON.parse(fs.readFileSync(resourcePath, 'utf8'));
      } else {
        return require(resourcePath);
      }
    }
  }
  throw new Error(`${resourceName}${resourceType} not found in any catalog sections.`);
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
    tab.mergeAttributes(thing, tab.loadResource("Model.json", baseName));
  }
  Object.keys(model).forEach(key => {
    if (thing.additiveAttributes instanceof Set && thing.additiveAttributes.has(key)) {
      thing[key] = tab.combineAttributes(thing, model[key], key);
    }
    else {
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

tab.thingHandler = {
  get(target, prop, receiver) {
    if (Reflect.has(target, prop)) {
      return Reflect.get(target, prop, receiver);
    }
    for (const behaviorName of target.behaviors || []) {
      const behavior = tab.loadResource("Behaviors.js", behaviorName);
      if (behavior && Reflect.has(behavior, prop)) {
        return Reflect.get(behavior, prop, receiver);
      }
    }
    return undefined;
  }
};

tab.makeThing = function makeThing(...args) {
  const thing = {
    additiveAttributes: new Set(["additiveAttributes", "behaviors"]),
    behaviors: new Set(["thing"])
  };
  tab.mergeAttributes(thing, tab.loadResource("Model.json", "thing"));
  args.forEach((arg, index) => {
    if (typeof arg === "string") {
      const model = tab.loadResource('Model.json', arg);
      if (model.base) {
        const bases = Array.isArray(model.base) ? model.base : [model.base];
        bases.forEach(baseName => {
          tab.mergeAttributes(thing, tab.loadResource("Model.json", baseName));
        });
      }
      tab.mergeAttributes(thing, model);
      delete thing.base;
    } else if (typeof arg === "object") {
      if (arg.base) {
        const bases = Array.isArray(arg.base) ? arg.base : [arg.base];
        bases.forEach(baseName => {
          tab.mergeAttributes(thing, tab.loadResource("Model.json", baseName));
        });
      }
      tab.mergeAttributes(thing, arg);
      delete thing.base;
    };
  });
  return new Proxy(thing, tab.thingHandler);
}

module.exports = tab