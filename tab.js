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
  catalogDirectory: 'catalog',
  activeCatalogSections: ['tab', 'test'],
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

tab.gatherAttributes = function gatherAttributes(modelInput) {
  const model = typeof modelInput === 'string' ? tab.loadResource("Model.json", modelInput) : modelInput;
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
tab.mergeGrammar = function mergeGrammar(result, addonGrammar) {
  for (const grammarRule in addonGrammar) {
    if (grammarRule === 'noun' || grammarRule === 'nouns' || grammarRule === 'adjectives') {
      if (!result[grammarRule]) {
        result[grammarRule] = [];
      }
      result[grammarRule] = [...new Set([...result[grammarRule], ...addonGrammar[grammarRule]])];
    }
    else {
      result[grammarRule] = addonGrammar[grammarRule];
    }
  }
  return result;
}

tab.mergeAttributes = function mergeAttributes(baseAttributes, addonAttributes) {
  const result = { ...baseAttributes };
  Object.keys(addonAttributes).forEach(attribute => {
    if (baseAttributes.additiveAttributes && baseAttributes.additiveAttributes.includes(attribute)) {
      result[attribute] = [...new Set([...result[attribute] || [], ...addonAttributes[attribute]])];
    }
    else if (attribute === 'grammar') {
      if (!result[attribute]) {
        result[attribute] = {};
      }
      result[attribute] = tab.mergeGrammar(result[attribute], addonAttributes[attribute]);
    }
    else {
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
      const behavior = tab.loadResource("Behaviors.js", behaviorName);
      if (behavior && Reflect.has(behavior, prop)) {
        return Reflect.get(behavior, prop, receiver);
      }
    }
    return undefined;
  }
};

tab.makeThing = function makeThing(baseInput, addonInput) {
  const baseModel = baseInput ? tab.gatherAttributes(baseInput) : tab.gatherAttributes('thing');
  const addonModel = addonInput ? tab.gatherAttributes(addonInput) : {};
  const mergedModel = tab.mergeAttributes(tab.mergeAttributes(tab.gatherAttributes('thing'), baseModel), addonModel);
  return new Proxy(mergedModel, tab.thingHandler);
}

tab.test = function test(suite) {
  let testSuite = suite || [];
  testSuite.forEach(item => {
    item({ ...tab });
  });
}

module.exports = tab;