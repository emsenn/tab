function fullName(thing) {
  let name = '';
  if (this.name) {
    if (this.grammar && this.grammar.article) {
      name += (this.grammar.article.length === 0 ? '' : this.grammar.article) + ' ' + this.name;
    } else {
      name += (['a', 'e', 'i', 'o', 'u'].includes(this.name[0].toLowerCase()) ? "an " : "a ") + this.name;
    }
  } else {
    name = "thing";
  }
  return name;
}

function describe() {
  return this.description ? this.description : "This is " + this.fullName() + ".";
}

module.exports = {
  fullName,
  describe
}