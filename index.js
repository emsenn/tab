const tab = require('./tab')

let foo = tab.makeThing();
console.log("This should say thing: ", foo.fullName()); // thing
tab.activeCatalogSections.add('vr');
let pebble = tab.makeThing("object");
pebble.name = "pebble";
console.log("This should say pebble: ", pebble.fullName()); // pebble
console.log("This should say 1", pebble.weigh());
let marble = tab.makeThing("object", { name: "marble" });
console.log("This should say marble:", marble.fullName()); // marble
let box = tab.makeThing({ base: "container", name: "box" });
console.log("The boxes mass should be 1: ", box.mass); // 1
pebble.moveTo(box);
box.contents[0].name; // pebble
pebble.behaviors.delete('object');
try {
  pebble.moveTo();
} catch (error) {
  console.error("Should get an error that pebble can't moveTo:", error.message);
}

let backpack = tab.makeThing("container", "leatherObject", { name: "leather backpack" })
let baseball = tab.makeThing({ base: ["leatherObject", "ball"], name: "baseball" });
console.log("this should say baseball: ", baseball.fullName()); // baseball
baseball.bounce(); // boing!
baseball.moveTo(backpack);
const backpackContents = backpack.contents.map(item => item.fullName());
console.log("backpack's contents:", backpackContents); // [baseball]
