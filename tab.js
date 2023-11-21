/**
 * Things with Attribute and Behaviors (TAB)
 * *Things* are *made* from *models* that list *attributes* and *behaviors*.
 * *Attributes* become *properties* of the *model*.
 * *Behaviors*  *methods* of the *model*.
 * 
 * This file contains the entire TAB engine - just copy/paste it into your own project to get started! (After reading some of our documentation, probably...)
 */


const fs = require('fs');

/** 
 * @namespace
*/
const tab = {};

/** 
* Load a model from a JSON file in ./models/
* @param {string} modelName - The name of the model to load.
* @returns {Object} - The model object.
*/
tab.loadModel = function(modelName) {
  return JSON.parse(fs.readFileSync('./models/' + modelName + '.json'));
}

/**
 * Load a model to be used in a collection of another's model's bases - part of the thing-making process.
 * @param {string} modelName - The name of the model that'll be added to the collection.
 * @param {array} collection - The collection of bases, provided & used by makeThing.
 * @param {boolean} prefix - Whether to add this model to the start or end of the collection.
  * @returns {array} - The collection of bases, after loading modelName.
*/
tab.loadBase = function(modelName, collection, prefix) {
  const modelJSON = loadModel(modelName);
  if (modelJSON && modelJSON.base) {
    tab.collectBases(modelJSON.base, collection, true);
  }
  prefix ? collection.unshift(base) : collection.push(base);
  return collection;
}

/** 
 * Collect bases from a model's base attribute - and the bases from those bases, etc.
 * @param {object} model - The model providing the bases.
  * @param {array} collection - The collection of bases, passed around as this function loops.
  * @param {boolean} prefix - Whether to add this model to the start or end of the collection.
  * @returns {array} - The collection of bases, after loading each one and applying its bases.
*/
tab.collectBases = function(model, collection = [], prefix = false) {
  if (!model || !model.base) {
    return collection;
  }
  const bases = Array.isArray(model.base) ? model.base : [model.base];
  for (let baseModel of bases) {
    tab.loadBase(baseModel, collection, prefix);
  }
  delete model.base;
  return collection;
}

/** 
 * Generate a new model from a base model and another one..
  * @param {object} baseModel - The base model object to be used.
  * @param {object} additionalModel - The model whose attributes will be applied.
  * @returns {object} - The new model.
*/
tab.mergeModels = function(baseModel, additionalModel) {
  for (const attribute in additionalModel) {
    if (baseModel.additiveAttributes && baseModel.additiveAttributes.includes(attribute)) {
      baseModel[attribute] = Array.from(new Set([
        ...(baseModel[attribute] || []),
        ...additionalModel[attribute]
      ]));
    }
    else if (attribute === 'grammar') {
      for (const grammarRule in additionalModel[attribute]) {
        const isNoun = grammarRule === 'noun' || grammarRule === 'nouns';
        const attributeKey = isNoun ? grammarRule : 'adjectives';
        baseModel[attribute] = {
          ...baseModel[attribute],
          [attributeKey]: Array.from(new Set([
            ...(baseModel[attribute]?.[attributeKey] || []),
            ...additionalModel[attribute][grammarRule]
          ]))
        };
      }
    }
    else {
      baseModel[attribute] = additionalModel[attribute];
    }
  }
  return baseModel;
}

/**
 * Makes a thing from (optionally) a model or two.
 * @param {object} model - The model to use. Otherwise, a basic thing will be made.
 * @param {object} additionalModel - The model to add to the first model.
 * @returns {object} - The thing, which can now access its behaviors.
*/
tab.makeThing = function(model, addonModel) {
  const thingModel = tab.loadModel('thing');
  const modelData = { ...thingModel, ...model };
  const baseCollection = [];
  tab.collectBases(modelData, baseCollection);
  if (addonModel) {
    tab.collectBases(addonModel, baseCollection);
  }
  const cleanBaseCollection = Array.from(new Set(baseCollection));
  cleanBaseCollection.forEach(modelName => {
    const baseModelData = tab.loadModel(modelName);
    if (typeof baseModelData === 'object') {
      tab.mergeModels(baseModelData, modelData);
    } else {
      console.log('failed to load base model' + modelName);
    }
    Object.assign(modelData, baseModelData);
  });

  const madeThing = new Proxy(modelData, {
    get: function(target, prop) {
      if (target[prop]) {
        return target[prop];
      } else {
        target.behaviors = target.behaviors || [];
        for (const behavior of target.behaviors) {
          const behaviorModule = require('./behaviors/' + behavior);
          if (typeof behaviorModule[prop] === 'function') {
            return behaviorModule[prop].bind(target);
          }
        }
      }
    },
  });

  return madeThing;
}

module.exports = tab;
