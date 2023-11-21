function bing() {
  console.log(this.fullName() + " hath binged");
  return true;
};

module.exports = { bing };