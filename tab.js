// Things with Attributes and Behaviors (TAB)
//    land back, water back, medicine back, ceremony back
// A Node.js tool for vernacular autoethnosis:
//
// - *Things* are *made* from *models* that list *attributes*, including *behaviors*.
// - *Attributes* become *properties* of the *model*.
// - *Behaviors* become *methods* of the *model*.

const fs = require('fs');
const path = require('path');

const tab = {
  modelDirectories: ['tab', 'test'], // List model subdirectories
  behaviorDirectories: ['tab', 'test'], // List behavior subdirectories
};

tab.loadModel = function loadModel(modelName) {
  for (const modelDir of tab.modelDirectories) {
    const modelPath = path.join(__dirname, 'models', modelDir, `${modelName}.json`);
    if (fs.existsSync(modelPath)) {
      return JSON.parse(fs.readFileSync(modelPath, 'utf8'));
    }
  }
  throw new Error(`Model ${modelName} not found in any model directories.`);
}
tab.loadBehavior = function loadBehavior(behaviorName) {
  for (const behaviorDir of tab.behaviorDirectories) {
    const behaviorPath = path.join(__dirname, 'behaviors', behaviorDir, behaviorName);
    if (fs.existsSync(behaviorPath + '.js')) {
      return require(behaviorPath);
    }
  }
  throw new Error(`Behavior ${behaviorName} not found in any behavior directories.`);
}

tab.gatherAttributes = function gatherAttributes(modelName) {
  const model = tab.loadModel(modelName);
  if (!model) {
    return {};
  }
  if (model.base) {
    const baseAttributes = Array.isArray(model.base)
      ? model.base.reduce(
        (accumulator, base) => tab.MergeAttributes(accumulator, tab.gatherAttributes(baseAttributes)),
        {}
      )
      : tab.gatherAttributes(model.base);
    return tab.MergeAttributes(baseAttributes, model);
  }
  return model;
}

tab.mergeAttributes = function mergeAttributes(baseAttributes, addonAttributes) {
  const result = { ...baseAttributes };
  Object.keys(addonAttributes).forEach(attribute => {
    if (baseAttributes.additiveAttributes &&
      baseAttributes.additiveAttributes.includes(attribute)) {
      result[attribute] = [...new Set([...result[attribute] || [], ...addonAttributes[attribute]])];
    } else {
      result[attribute] = addonAttributes[attribute];
    }
  });
  return result;
}

tab.thingHandler = {
  get(target, prop, receiver) {
    if (Reflect.has(target, prop)) {
      return Reflect.get(target, prop, receiver);
    }
    for (const behaviorName of target.behaviors || []) {
      const behavior = tab.loadBehavior(behaviorName);
      if (behavior && Reflect.has(behavior, prop)) {
        return Reflect.get(behavior, prop, receiver);
      }
    }
    return undefined;
  }
};

tab.makeThing = function makeThing(baseInput, addonInput) {
  const model = typeof baseInput === 'string' ? tab.gatherAttributes(baseInput) : baseInput;
  const baseThing = tab.gatherAttributes('thing');
  const thing = tab.mergeAttributes(baseThing, model);
  return new Proxy(thing, tab.thingHandler);
}

module.exports = tab;