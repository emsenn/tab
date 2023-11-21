# TAB Implementation

TAB is written as a single Javascript file, meant to be placed in the root directory of your own project, using two subdirectories to store data:

- `./models` holds subdirectories, each a catalog of JSON files containing the models that TAB can access.
- ./behaviors holds Javascript files listing our behaviors in a matching subdirectory structure.

Example:

```js
const tab = require('./tab');
const apple = tab.makeThing('food', { name: 'apple'});
```

`tab.makeThing()` function would do the following:

- Check if `baseInput` (here, 'food'), is a string, and if it is, pass it to tab.GatherAttributes to collect the "food" model's attributes.
  - Next, inside `tab.gatherAttributes('food')`, it loads food.json from tab.modelsDirectory.
  - If the 'food' model has any base model(s) defined, then their attributes will be recursively gathered.
- Once our `baseInput` has been translated into a model, we gather the attributes of the generic thing - every thing we make is going to have the attributes described in thing.json
- Next, we merge the attributes of the generic thing model with the attributes of the base model.
- If additional attributes have been provided - here, {name: "apple"}, those are merged in with the model we've made from a thing and food.
- Next, we create a "thing", technically a Javascript Proxy object. The thing has a "get trap," which means when we do something like apple.name, a special function gets handed "name" as the argument - and if "name" isn't a property of the thing, the Proxy looks through the behaviors listed for a matching function to try.

- Finally, tab.makeThing returns this new Proxy object, which represents the "thing" with the combined attributes and behaviors. This proxy object can now be used, and any calls to its properties that match attributes will be returned as expected, and calls to its methods will be delegated to the right behavior.

If we didn't use madeThing, but hand-wrote our thing with a bunch of smaller calls, it might look like this:

```js
const foodAttributes = tab.gatherAttributes("food");
const baseThingAttributes = tab.gatherAttributes('thing');
const mergedAttributes = tab.mergeAttributes(baseThingAttributes, foodAttributes);
const customAttributes = { name: "apple" }; // This is your addonInput
const thingAttributes = tab.mergeAttributes(mergedAttributes, customAttributes);
const thing = new Proxy(thingAttributes, thinghandler);
```