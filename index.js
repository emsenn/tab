const tab = require('./tab');

console.log("TAB doesn't really do anything at the moment; the output below is probably just the result of whatever ad hoc testing has been written.")

// const apple = tab.makeThing({ name: 'apple', behaviors: ["food"] }, { name: "red apple" });
// console.log(apple.describe());
// if (apple.rot) apple.rot();
// console.log(apple.describe());

tab.modelDirectories.push('mud');
tab.behaviorDirectories.push('mud');
const marmud = tab.makeThing({ name: 'MarMUD', base: ['mudServer'] })
console.log(marmud);
console.log(marmud.fullName());
console.log(marmud.bing());