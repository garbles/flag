import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import featureFlag from './featureFlag';
import setFlags from './setFlags';

const True = () => <noscript>T</noscript>;
const False = () => <noscript>F</noscript>;
const reducer = state => state;

const expectWarnedWith = (fn, matcher) => {
  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn.mock.calls[0][0]).toMatch(matcher);
};

describe(`react-redux-feature-flag`, () => {
  it(`uses the render prop when a flag is truthy`, () => {
    const FeatureFlag = featureFlag({});
    const initialState = {};
    const flags = {
      a: true,
    };

    const store = createStore(
      reducer,
      initialState,
      FeatureFlag.instrument(flags),
    );

    const instance = mount(
      <Provider store={store}>
        <FeatureFlag
          name="a"
          render={() => <True />}
        />
      </Provider>,
    );

    expect(instance.find(`True`).length).toEqual(1);

    store.dispatch(setFlags({ a: false }));

    expect(instance.find(`True`).length).toEqual(0);
    expect(instance.find(`noscript`).length).toEqual(1);
  });

  it(`uses the fallbackRender prop when a flag is falsy`, () => {
    const FeatureFlag = featureFlag({});
    const initialState = {};

    const flags = {
      a: true,
    };

    const store = createStore(
      reducer,
      initialState,
      FeatureFlag.instrument(flags),
    );

    const instance = mount(
      <Provider store={store}>
        <FeatureFlag
          name="a"
          render={() => <True />}
          fallbackRender={() => <False />}
        />
      </Provider>,
    );

    expect(instance.find(`True`).length).toEqual(1);

    store.dispatch(setFlags({ a: false }));

    expect(instance.find(`True`).length).toEqual(0);
    expect(instance.find(`False`).length).toEqual(1);
  });

  it(`computes a flag when a function is used instead of a value`, () => {
    const FeatureFlag = featureFlag({});
    const initialState = {};

    const flags = {
      a: true,
      b: false,
      c: features => features.a && features.b,
    };

    const store = createStore(
      reducer,
      initialState,
      FeatureFlag.instrument(flags),
    );

    const instance = mount(
      <Provider store={store}>
        <FeatureFlag
          name="c"
          render={() => <True />}
          fallbackRender={() => <False />}
        />
      </Provider>,
    );

    expect(instance.find(`True`).length).toEqual(0);
    expect(instance.find(`False`).length).toEqual(1);

    store.dispatch(setFlags({ b: true }));

    expect(instance.find(`True`).length).toEqual(1);
    expect(instance.find(`False`).length).toEqual(0);

    store.dispatch(setFlags({ a: false, b: true }));

    expect(instance.find(`True`).length).toEqual(0);
    expect(instance.find(`False`).length).toEqual(1);
  });

  it(`computes a flag when a function is used instead of a value`, () => {
    const FeatureFlag = featureFlag({});
    const initialState = {
      count: 10,
    };

    const betterReducer = (state, action) => {
      if (action.type === `INC`) {
        return {
          ...state,
          count: state.count + 1,
        };
      }

      return state;
    };

    const flags = {
      coolFeature: false,
      coolAndHighCount: (f, s) => f.coolFeature && s.count > 10,
    };

    const store = createStore(
      betterReducer,
      initialState,
      FeatureFlag.instrument(flags),
    );

    const instance = mount(
      <Provider store={store}>
        <FeatureFlag
          name="coolAndHighCount"
          render={() => <True />}
          fallbackRender={() => <False />}
        />
      </Provider>,
    );

    expect(instance.find(`True`).length).toEqual(0);
    expect(instance.find(`False`).length).toEqual(1);

    store.dispatch(setFlags({ coolFeature: true }));

    expect(instance.find(`True`).length).toEqual(0);
    expect(instance.find(`False`).length).toEqual(1);

    store.dispatch({ type: `INC` });

    expect(instance.find(`True`).length).toEqual(1);
    expect(instance.find(`False`).length).toEqual(0);
  });

  it(`warns when flags is undefined`, () => {
    const warn = jest.fn();
    const FeatureFlag = featureFlag({ warn });

    FeatureFlag.instrument();

    expectWarnedWith(warn, `FeatureFlag.instrument did not receive object as an argument.`);
  });

  it(`warns when flags is a function`, () => {
    const warn = jest.fn();
    const FeatureFlag = featureFlag({ warn });

    FeatureFlag.instrument(() => {});

    expectWarnedWith(warn, `FeatureFlag.instrument did not receive object as an argument.`);
  });

  it(`warns when it can't find flags in the store does not render`, () => {
    const warn = jest.fn();
    const FeatureFlag = featureFlag({ warn });
    const initialState = {};

    const store = createStore(
      reducer,
      initialState,
    );

    const instance = mount(
      <Provider store={store}>
        <FeatureFlag
          name="a"
          render={() => <True />}
        />
      </Provider>,
    );

    expect(instance.find(`True`).length).toEqual(0);
    expectWarnedWith(warn, `FeatureFlag did not find feature flags in your store.`);
  });

  it(`warns when the flag does not exist on the store does not render`, () => {
    const warn = jest.fn();
    const FeatureFlag = featureFlag({ warn });
    const initialState = {};

    const flags = {
      a: true,
    };

    const store = createStore(
      reducer,
      initialState,
      FeatureFlag.instrument(flags),
    );

    const instance = mount(
      <Provider store={store}>
        <FeatureFlag
          name="b"
          render={() => <True />}
        />
      </Provider>,
    );

    expect(instance.find(`True`).length).toEqual(0);
    expectWarnedWith(warn, `<FeatureFlag name="b" ... /> did not find "b" on feature flags in your store.`);
  });

  it(`warns when the flag is computed but returns undefined does not render`, () => {
    const warn = jest.fn();
    const FeatureFlag = featureFlag({ warn });
    const initialState = {};

    const flags = {
      // eslint-disable-next-line no-unused-expressions
      a: () => { `oops left brackets around my func`; },
    };

    const store = createStore(
      reducer,
      initialState,
      FeatureFlag.instrument(flags),
    );

    const instance = mount(
      <Provider store={store}>
        <FeatureFlag
          name="a"
          render={() => <True />}
        />
      </Provider>,
    );

    expect(instance.find(`True`).length).toEqual(0);
    expectWarnedWith(warn, `"a" is a computed feature flag but returned undefined.`);
  });

  it(`warns when the action payload is empty and also doesn't modify the state`, () => {
    const warn = jest.fn();
    const FeatureFlag = featureFlag({ warn });
    const initialState = {};

    const flags = {
      a: true,
    };

    const store = createStore(
      reducer,
      initialState,
      FeatureFlag.instrument(flags),
    );

    const prevState = store.getState();

    store.dispatch(setFlags());

    const nextState = store.getState();

    expect(prevState).toEqual(nextState);
    expectWarnedWith(warn, `setFlags only accepts an object as an argument. Instead received undefined.`);
  });

  it(`warns when the action payload is a function  and doesn't modify the state`, () => {
    const warn = jest.fn();
    const FeatureFlag = featureFlag({ warn });
    const initialState = {};

    const flags = {
      a: true,
    };

    const store = createStore(
      reducer,
      initialState,
      FeatureFlag.instrument(flags),
    );

    const prevState = store.getState();

    store.dispatch(setFlags(() => {}));

    const nextState = store.getState();

    expect(prevState).toEqual(nextState);
    expectWarnedWith(warn, `setFlags only accepts an object as an argument. Instead received a function.`);
  });

  it(`warns when trying to set a flag that wasn't initialized and doesn't modify the state`, () => {
    const warn = jest.fn();
    const FeatureFlag = featureFlag({ warn });
    const initialState = {};

    const flags = {
      a: true,
    };

    const store = createStore(
      reducer,
      initialState,
      FeatureFlag.instrument(flags),
    );

    const prevState = store.getState();

    store.dispatch(setFlags({ b: true }));

    const nextState = store.getState();

    expect(prevState).toEqual(nextState);
    expectWarnedWith(warn, `setFlags received a flag "b" which was not set on initialization.`);
  });

  it(`warns when trying to set a flag from a computed key and doesn't modify the state`, () => {
    const warn = jest.fn();
    const FeatureFlag = featureFlag({ warn });
    const initialState = {};

    const flags = {
      a: () => true,
    };

    const store = createStore(
      reducer,
      initialState,
      FeatureFlag.instrument(flags),
    );

    const prevState = store.getState();

    store.dispatch(setFlags({ a: true }));

    const nextState = store.getState();

    expect(prevState).toEqual(nextState);
    expectWarnedWith(warn, `setFlags received a flag "a" which is already a computed key and should not be changed.`);
  });

  it(`warns when trying to set a flag to a computed key and doesn't modify the state`, () => {
    const warn = jest.fn();
    const FeatureFlag = featureFlag({ warn });
    const initialState = {};

    const flags = {
      a: true,
    };

    const store = createStore(
      reducer,
      initialState,
      FeatureFlag.instrument(flags),
    );

    const prevState = store.getState();

    store.dispatch(setFlags({ a: () => true }));

    const nextState = store.getState();

    expect(prevState).toEqual(nextState);
    expectWarnedWith(warn, `setFlags received a flag "a" and attempted to change it to a computed key.`);
  });
});
