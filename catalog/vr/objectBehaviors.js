function moveTo(destination) {
  if (destination.hasOwnProperty('contents')) {
    destination.contents.push(this);
    this.location = destination;
  }
}

function weigh() {
  return this.mass;
}

module.exports = { moveTo, weigh }