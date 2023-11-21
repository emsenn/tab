function fullName() {
  const name = (this.name || "some thing");
  return name;
}

function describe() {
  const description = (this.description || "This is " + this.fullName());
  return description;
}

module.exports = {
  fullName,
  describe,
}