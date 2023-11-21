// Things with Attributes and Behaviors (TAB)
// *Things* are *made* from *models* that list *attributes* and *behaviors*.
// *Attributes* become *properties* of the *model*.
// *Behaviors* become *methods* of the *model*.

// TAB is essentially a server for a multi-user dimension focused on enabling users to create virtual objects and form relations between them, to enable a practice of vernacular autoethnosis.
//
// TAB is written as a single Javascript file, meant to be placed in the root directory of your own project, using two subdirectories to store data:
// - ./models holds JSON files containing our models
// - ./behaviors holds Javascript files listing our behaviors
//
// Example:
//   const tab = require('./tab');
//   const apple = tab.makeThing('food', { name: 'apple'});
//
// The makeThing function would do the following:
// - Check if baseInput (here, 'food'), is a string, and if it is, pass it to tab.GatherAttributes to collect the "food" model's attributes.
//   - Next, inside tab.gatherAttributes('food'), it loads food.json from tab.modelsDirectory.
//   - If the 'food' model has any base model(s) defined, then their attributes will be recursively gathered.
// - Once our baseInput has been translated into a model, we gather the attributes of the generic thing - every thing we make is going to have the attributes described in thing.json
// - Next, we merge the attributes of the generic thing model with the attributes of the base model.
// - If additional attributes have been provided - here, {name: "apple"}, those are merged in with the model we've made from a thing and food.
// - Next, we create a "thing", technically a Javascript Proxy object. The thing has a "get trap," which means when we do something like apple.name, a special function gets handed "name" as the argument - and if "name" isn't a property of the thing, the Proxy looks through the behaviors listed for a matching function to try.

// - Finally, tab.makeThing returns this new Proxy object, which represents the "thing" with the combined attributes and behaviors. This proxy object can now be used, and any calls to its properties that match attributes will be returned as expected, and calls to its methods will be delegated to the right behavior.

// If we didn't use madeThing, but hand-wrote our thing with a bunch of smaller calls, it might look like this:

// const foodAttributes = tab.gatherAttributes("food");
// const baseThingAttributes = tab.gatherAttributes('thing');
// const mergedAttributes = tab.mergeAttributes(baseThingAttributes, foodAttributes);
// const customAttributes = { name: "apple" }; // This is your addonInput
// const thingAttributes = tab.mergeAttributes(mergedAttributes, customAttributes);
// const thing = new Proxy(thingAttributes, thinghandler);

const fs = require('fs');
const path = require('path');

const tab = {
  modelDirectory: 'models',
  behaviorDirectory: 'behaviors',
};

tab.loadModel = function loadModel(modelName) {
  return JSON.parse(fs.readFileSync(path.join(path.join(__dirname, tab.modelDirectory), modelName + '.json')));
}

tab.loadBehavior = function loadBehavior(behaviorName) {
  return require(path.join(path.join(__dirname, tab.behaviorDirectory), behaviorName));
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