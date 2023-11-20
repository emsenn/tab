# Things with Attributes and Behaviors (TAB)

> ***TAB*** is a system for structuring information as *things* that are *made* from *models* defining *attributes* and *behaviors*.

***Things with Attribute and Behaviors*** is essentially a server for a [multi-user dimension](https://en.wikipedia.org/wiki/Multi-user_dungeon) focused on enabling users to create virtual objects and form relations between them, to enable a practice of *vernacular autoethnosis*.

**Why might you care?** Honestly, at this point, you probably only care if you have a personal connection to the project, such as being friends with [emsenn](https://emsenn.net)

## Technical Info

**TAB** is being written to run on [Node.js](https://nodejs.org/en/). The "engine" is stored in `./tab.js`, for now.

```js
const tab = require('./tab');
const apple = tab.makeThing({name: "apple"});
console.log(apple.fullName());
// --> an apple
```

### File Organization
  - `./lib` - holds most of the "engine"
    - `./lib/services/` - holds internal logic, mostly
  - `./models/` - holds the models that TAB makes into things *(also where saved data goes, for now)*
  - `./behaviors/` - holds the methods that things can use once they're made

## License

Software whose source code is freely & openly available to anyone allows for its use and development outside of its original context, which is necessary for the type of self-determined information management that TAB seeks to facilitate. Thus, it is released under the [MIT license](LICENSE.md), which legally permits anyone to use or modify the software.

## Contributing

We encourage folk to share the modifications they've made back with us. New models, new behaviors, changes to what is already here. Check the [Development Documentation](./doc/dev/README.md).