// Things with Attribute and Behaviors (TAB)
// *Things* are *made* from *models* that list *attributes* and *behaviors*.
// *Attributes* become *properties* of the *model*.
// *Behaviors*  *methods* of the *model*.

// This is the main TAB module, containing all the functions someone using the engine might want to access.

// TAB dependencies
const fs = require('fs');

// TAB Model Loaders
function loadModel(modelName) {
  return JSON.parse(fs.readFileSync('./models/' + modelName + '.json'));
}

function loadModelIfString(model) {
  if (typeof model !== 'object' && typeof model !== 'string') {
    return new Error('Model must be an object or string, got ' + typeof model + ': ' + JSON.stringify(model, null, 2));
  }
  else if (typeof model === 'string') {
    return loadModel(model);
  }
  return model;
}

// TAB Model Base Handlers
function addBaseToCollection(base, collection, prefix) {
  return prefix ? collection.unshift(base) : collection.push(base);
}

function loadBaseIntoCollection(base, collection, prefix) {
  const modelName = base;
  const modelJSON = loadModel(modelName);
  if (modelJSON.hasOwnProperty('base')) {
    collectBases(model, collection, true);
  }
  addBaseToCollection(modelName, collection, prefix);
}

function collectBases(thing, collection = [], prefix = false) {
  if (thing.hasOwnProperty('base')) {
    if (typeof thing.base === 'string') {
      loadBaseIntoCollection(thing.base, collection, prefix);
      delete thing.base;
    }
    else if (Array.isArray(thing.base)) {
      for (let i = thing.base.length - 1; i >= 0; i--) {
        const modelName = thing.base[i];
        const model = loadModel(modelName);
        if (model.hasOwnProperty('base')) {
          collectBases(model, collection, true);
        }
        addBaseToCollection(modelName, collection, prefix);
        thing.base.splice(i, 1);
      }
      if (thing.base.length === 0) {
        delete thing.base;
      }
    }
  }
  return collection;
}

// TAB Model Handlers
function mergeModels(baseModel, additionalModel) {
  for (const attribute in additionalModel) {
    if (baseModel.additiveAttributes && baseModel.additiveAttributes.includes(attribute)) {
      if (!baseModel[attribute]) {
        baseModel[attribute] = [];
      }
      for (const additiveAttribute of additionalModel[attribute]) {
        baseModel[attribute].push(additiveAttribute);
        baseModel[attribute] = [...new Set(baseModel[attribute])];
      }
    }
    else if (attribute === 'grammar') {
      if (!baseModel[attribute]) {
        baseModel[attribute] = {};
      }
      for (const grammarRule in additionalModel[attribute]) {
        if (grammarRule === 'noun' || grammarRule === 'nouns') {
          if (!baseModel[attribute][grammarRule]) {
            baseModel[attribute][grammarRule] = [];
          }
          baseModel[attribute][grammarRule] = [...new Set([...baseModel[attribute][grammarRule], ...grammarRule])];
        }
        else if (grammarRule === 'adjectives') {
          if (!baseModel[attribute][grammarRule]) {
            baseModel[attribute][grammarRule] = [];
          }
          baseModel[attribute][grammarRule] = [...new Set([...baseModel[attribute][grammarRule], ...grammarRule])];
        }
        else {
          baseModel[attribute][grammarRule] = additionalModel[attribute][grammarRule];
        }
      }
    }
    else {
      baseModel[attribute] = additionalModel[attribute];
    }
  }
  return baseModel;
}

// TAB Thing Maker
/* Makes a thing out of model, additionally applying the attributes of addonModel
 * to the thing.  
*/
function makeThing(model, addonModel) {
  const thingModel = loadModel('thing');
  const modelData = {};
  const baseCollection = [];
  if (typeof model === 'undefined') {
    Object.assign(modelData, thingModel);
  }
  else if (typeof model === 'object' || typeof model === 'string') {
    const result = loadModelIfString(model);
    if (result instanceof Error) {
      console.error(result.message)
    } else {
      Object.assign(modelData, result);
    }
    if (!modelData.hasOwnProperty('base')) {
      modelData.base = 'thing';
    }
  }
  else {
    return new Error("Model must be an object, a string, or to use the default thing model, undefined.");
  }
  collectBases(modelData, baseCollection);
  if (addonModel) {
    collectBases(addonModel, baseCollection);
  }
  const cleanBaseCollection = Array.from(new Set(baseCollection));
  cleanBaseCollection.forEach(modelName => {
    const baseModelData = loadModel(modelName);
    if (typeof baseModelData === 'object') {
      mergeModels(baseModelData, modelData);
    }
    else { console.log('failed to load base model' + modelName) }
    Object.assign(modelData, baseModelData);
  });

  const madeThing = new Proxy(modelData, {
    get: function(target, prop) {
      if (target[prop]) {
        return target[prop];
      } else {
        if (!target.hasOwnProperty('behaviors')) {
          target.behaviors = [];
        }
        for (const behavior of target.behaviors) {
          const behaviorModule = require('./behaviors/' + behavior);
          if (typeof behaviorModule[prop] === 'function') {
            return behaviorModule[prop].bind(target);
          }
        }
      }
    }
  });
  return madeThing;
}

module.exports = { makeThing };
