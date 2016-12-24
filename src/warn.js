/* eslint-disable no-console */
if (typeof process !== `undefined` && process.env.NODE_ENV !== `production`) {
  module.exports = msg => {
    if (typeof global.console !== `undefined`) {
      if (console.warn) {
        console.warn(msg);
      } else if (console.error) {
        console.error(msg);
      } else {
        console.log(`WARNING:`, msg);
      }
    }
  };
} else {
  module.exports = () =>
    typeof global.console !== `undefined` &&
    console.log(`FeatureFlag warning removed in minified build`);
}
/* eslint-enable no-console */
