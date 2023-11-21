const tab = require('./tab');

console.log("TAB is in its earliest stages of development, and thus does not run properly as an sort of application or service. The output below represents the test suite being used to help develop the codebase.");
console.log("The following tests will be run:");
console.log("- Make a basic thing: tests fundamental thing-making");
console.log("- Make an apple: tests assigning behaviors to a thing.");
console.log("- Make a MUD Server: the final test, use TAB to run a MUD server!");

tab.test([
  function testMakeABasicThing(tab) {
    const foo = tab.makeThing();
    if (foo.describe() === "This is a thing.") {
      console.log("Make a basic thing succeeded.");

    } else {
      console.log("Make a basic thing failed, here's what was made instead: " + JSON.stringify(foo, null, 2));
    }
  },
  function testMakeAnApple(tab) {
    const apple = tab.makeThing({ name: 'apple', behaviors: ["food"] });
    if (apple.describe() === "This is an apple.") {
      console.log("Make an apple succeeded.");
      if (apple.rot) {
        apple.rot();
        if (apple.describe() === "This is a rotten apple.") {
          console.log("Rotting an apple succeeded.");
        }
        else {
          console.log("Rotting an apple failed, here's what was made instead: " + JSON.stringify(apple, null, 2));
        }
      }
      else {
        console.log("Apple lacked rot behavior, here's the apple:" + JSON.stringify(apple, null, 2));
      }
    }
    else {
      console.log("Make an apple failed, here's what was made instead: " + JSON.stringify(apple, null, 2));
    }
  },
  function testMakeAMUDServer(tab) {
    tab.activeCatalogSections.push('mud');
    const mudServer = tab.makeThing({ name: 'MUD Server', base: ['mudServer'] });
    if (mudServer.describe() === "This is a MUD Server.") {
      console.log("Make a MUD Server succeeded.");
      if (mudServer.bing()) {
        console.log("Binging a MUD Server succeeded.");
      }
      else {
        console.log("Binging a MUD Server failed, here's our MUD thing: " + JSON.stringify(mudServer, null, 2));
      }
    } else {
      console.log("Make a MUD Server failed, here's what was made instead: " + JSON.stringify(mudServer, null, 2));
    }
  },
  function finalTest(tab) {
    console.log("All tests have finished!");
  }]);
