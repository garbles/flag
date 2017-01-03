import React from 'react';
import {connect} from 'react-redux';

const STORE_KEY = `__SUPER_SECRET_FEATURE_FLAGS__`;
const noopRender = () => React.createElement(`noscript`);
const Component = ({render, value}) => render(value);

const __DEV__ = typeof process !== `undefined` && process.env.NODE_ENV !== `production`;

const isImmutable = s => Boolean(s.toJS);

const createRefinedState = (state, flags) => {
  const computed = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const key in flags) {
    if (hasOwnProperty.call(flags, key) && typeof flags[key] === `function`) {
      computed[key] = true;
    }
  }

  const member = {computed, flags};

  if (isImmutable(state)) {
    return state.set(STORE_KEY, member);
  } else {
    return {
      ...state,
      [STORE_KEY]: member
    };
  }
};

const getFlagsInternal = state => {
  if (isImmutable(state)) {
    return state.get(STORE_KEY, {});
  } else {
    return state[STORE_KEY] || {};
  }
};

const setFlagsInternal = (state, action) => {
  const {flags} = getFlagsInternal(state);
  const member = {...flags, ...action.payload};

  if (isImmutable(state)) {
    return state.update(STORE_KEY, obj => ({...obj, flags: member}));
  } else {
    return {
      ...state,
      [STORE_KEY]: {
        ...state[STORE_KEY],
        flags: member
      },
    };
  }
};

export default (opts = {}) => {
  let hasOwnProperty;
  let isObject;
  const warn = opts.warn;

  if (__DEV__) {
    hasOwnProperty = Object.prototype.hasOwnProperty;
    isObject = obj => !Array.isArray(obj) && typeof obj === `object`;
  }

  const instrument = initFlags => {
    if (__DEV__ && !isObject(initFlags)) {
      warn(
        `${`FeatureFlag.instrument did not receive object as an argument. ` +
        `Instead received `}${
        typeof flags === `function` ? `a function` : JSON.stringify(initFlags)
        }.`,
      );

      return instrument({});
    }

    return createStore => (reducer, initState, enhancer) => {
      const refinedReducer = (state, action) => {
        if (action.type === `@@FEATURE_FLAG/SET`) {
          const {computed, flags} = getFlagsInternal(state);

          if (__DEV__) {
            if (!isObject(action.payload)) {
              warn(
                `setFlags only accepts an object as an argument. Instead received ${
                typeof action.payload === `function` ? `a function` : JSON.stringify(action.payload)
                }.`,
              );

              return state;
            }

            const keys = Object.keys(action.payload);
            let shouldReturn = false;

            keys.forEach(key => {
              if (!hasOwnProperty.call(flags, key)) {
                warn(
                  `setFlags received a flag "${key}" which was not set ` +
                  `on initialization. Please provide a default value for all ` +
                  `flags.`,
                );

                shouldReturn = true;
              }

              if (computed[key]) {
                warn(
                  `setFlags received a flag "${key}" which is already a computed key ` +
                  `and should not be changed.`,
                );

                shouldReturn = true;
              } else if (typeof action.payload[key] === `function`) {
                warn(
                  `setFlags received a flag "${key}" and attempted to change it to a computed key. ` +
                  `Do not change plain value flags to computed flags after initialization.`,
                );

                shouldReturn = true;
              }
            });

            if (shouldReturn === true) {
              return state;
            }
          }

          return setFlagsInternal(state, action);
        }

        return reducer(state, action);
      };

      const computed = {};

      // eslint-disable-next-line no-restricted-syntax
      for (const key in initFlags) {
        if (hasOwnProperty.call(initFlags, key) && typeof initFlags[key] === `function`) {
          computed[key] = true;
        }
      }

      const refinedInitialState = createRefinedState(initState, initFlags);

      return createStore(
        refinedReducer,
        refinedInitialState,
        enhancer,
      );
    };
  };

  const mapStateToProps = (state, props) => {
    const {name} = props;
    const {flags} = getFlagsInternal(state);

    if (__DEV__ && typeof flags === `undefined`) {
      warn(
        `FeatureFlag did not find feature flags in your store. ` +
        `The feature flags are appended to your state with FeatureFlag.instrument. ` +
        `Did you forget to use FeatureFlag.instrument with createStore? ` +
        `Did you create a full copy of your store in your last state update?`,
      );

      return {render: noopRender};
    }

    let value = flags[name];

    if (__DEV__ && !hasOwnProperty.call(flags, name)) {
      warn(
        `<FeatureFlag name="${name}" ... /> did not find "${name}" on feature flags in your store. ` +
        `Did you include "${name}" as a key when you initialized your store?`,
      );

      return {render: noopRender};
    }

    if (typeof value === `function`) {
      value = value(flags, state);

      if (__DEV__ && typeof value === `undefined`) {
        warn(
          `"${props.name}" is a computed feature flag but returned undefined. ` +
          `Computed flags should always return a value.`,
        );

        return {render: noopRender};
      }
    }

    const render = (value ? props.render : props.fallbackRender) || noopRender;

    return {render, value};
  };

  const FeatureFlag = connect(mapStateToProps)(Component);
  FeatureFlag.instrument = instrument;

  if (__DEV__) {
    FeatureFlag.propTypes = {
      name: React.PropTypes.string.isRequired,
      render: React.PropTypes.func.isRequired,
      fallbackRender: React.PropTypes.func,
    };
  }

  return FeatureFlag;
};
