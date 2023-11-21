const tab = require('./tab');

const apple = tab.makeThing({ name: 'apple', behaviors: ["food"] }, { name: "red apple" });
console.log(apple.describe());
if (apple.rot) apple.rot();
console.log(apple.describe());