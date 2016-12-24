import featureFlag from './featureFlag';
import setFlags from './setFlags';
import warn from './warn';

const FeatureFlag = featureFlag({warn});

function isCrushed() {}
if (
  typeof process !== `undefined` &&
  process.env.NODE_ENV !== `production` &&
  typeof isCrushed.name === `string` &&
  isCrushed.name !== `isCrushed`
) {
  warn(
    `You are running a minified version of React Redux Feature Flags ` +
    `but have not set process.env.NODE_ENV === "production". This results ` +
    `in a much larger and slower build. Please ensure that you have set ` +
    `process.env.NODE_ENV.`,
  );
}

export {
  FeatureFlag,
  setFlags,
};
