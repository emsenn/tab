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
      const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
      return model;
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

tab.gatherAttributes = function gatherAttributes(modelInput) {
  const model = typeof modelInput === 'string' ? tab.loadModel(modelInput) : modelInput;
  if (!model) {
    throw new Error('No model found');
  }
  if (model.base) {
    const baseAttributes = Array.isArray(model.base)
      ? model.base.reduce(
        (accumulator, base) => tab.mergeAttributes(accumulator, tab.gatherAttributes(base)),
        {}
      )
      : tab.gatherAttributes(model.base);
    delete model.base;
    return tab.mergeAttributes(baseAttributes, model);
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
  let baseModel;
  let addonModel;
  if (baseInput) {
    baseModel = tab.gatherAttributes(baseInput);
  }
  if (addonInput) {
    addonModel = tab.gatherAttributes(addonInput);
  }
  if (!baseModel && !addonModel) {
    baseModel = tab.gatherAttributes('thing');
  } else if (!addonModel) {
    addonModel = {};
  }
  const baseThing = tab.gatherAttributes('thing');
  const mergedModel = tab.mergeAttributes(tab.mergeAttributes(baseThing, baseModel), addonModel);
  return new Proxy(mergedModel, tab.thingHandler);
}

module.exports = tab;