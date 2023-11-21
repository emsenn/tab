function fullName() {
  let name = this.name ? this.name : 'thing';
  if (this.grammar && this.grammar.article) {
    name = (this.grammar.article.length === 0 ? '' : this.grammar.article) + ' ' + name;
  } else {
    name = (['a', 'e', 'i', 'o', 'u'].includes(name[0].toLowerCase()) ? "an " : "a ") + name;
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