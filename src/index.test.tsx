// tslint:disable:jsx-no-lambda

import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';

import {
  ConnectedFlagsProvider,
  createFlagsReducer,
  Flag,
  FlagsProvider,
  Flags,
  ResolvedFlags,
  setFlagsAction,
  Value,
  withFlags,
} from './index';

const True = () => <noscript>T</noscript>;
const False = () => <noscript>F</noscript>;

describe('createFlagsReducer', () => {
  it('creates a reducer function for flags', () => {
    const flags = {
      a: true,
      b: {
        c: 'www.example.com/api',
        d: 12,
      },
    };

    const reducer = createFlagsReducer(flags);

    expect(typeof reducer).toEqual('function');
    expect(reducer.length).toEqual(2);
  });

  it('sets flags when the correct flag is dispatched', () => {
    const flags = {
      a: true,
      b: {
        c: 12,
      },
    };

    const reducer = createFlagsReducer<typeof flags>(flags);

    const next = reducer(
      flags,
      setFlagsAction({
        a: false,
        b: {
          c: 15,
        },
      }),
    );

    expect(next.a).toEqual(false);
    expect(next.b.c).toEqual(15);
  });
});

describe('FlagsProvider && Flag', () => {
  it('accepts uncomputed flags as props', () => {
    interface Resolved extends ResolvedFlags {
      a: boolean;
      b: boolean;
      c: boolean;
      d: boolean;
      e: {
        f: {
          g: boolean;
        };
      };
    }

    const flags1: Flags = {
      a: true,
      b: true,
      c: (flags: Resolved) => flags.a && true,
      d: (flags: Resolved) => flags.b && flags.c,
      e: {
        f: {
          g: (flags: Resolved) => flags.d,
        },
      },
    };

    let instance = mount(
      <FlagsProvider flags={flags1}>
        <div>
          <Flag name="e.f.g" render={() => <True />} fallbackRender={() => <False />} />
        </div>
      </FlagsProvider>,
    );

    expect(instance.find(`True`).length).toEqual(1);
    expect(instance.find(`False`).length).toEqual(0);

    const flags2 = {
      a: true,
      b: false,
      c: (flags: Resolved) => flags.a && true,
      d: (flags: Resolved) => flags.b && flags.c,
      e: {
        f: {
          g: (flags: Resolved) => flags.d,
        },
      },
    };

    instance = mount(
      <FlagsProvider flags={flags2}>
        <div>
          <Flag name="e.f.g" render={() => <True />} fallbackRender={() => <False />} />
        </div>
      </FlagsProvider>,
    );

    expect(instance.find(`True`).length).toEqual(0);
    expect(instance.find(`False`).length).toEqual(1);
  });

  it('passes flags and other props to the render function', () => {
    interface Resolved extends ResolvedFlags {
      a: boolean;
      b: boolean;
      c: boolean;
      d: boolean;
      e: {
        f: {
          g: boolean;
        };
      };
    }

    const flags: Flags = {
      a: true,
      b: true,
      c: (flags: Resolved) => flags.a && true,
      d: (flags: Resolved) => flags.b && flags.c,
      e: {
        f: {
          g: (flags: Resolved) => flags.d,
        },
      },
    };

    expect.assertions(3);

    mount(
      <FlagsProvider flags={flags}>
        <div>
          <Flag
            name="e.f.g"
            someOtherProps="potato"
            render={props => {
              expect(props.flags).toBeDefined();
              expect(props.flags['e.f.g']).toEqual(true);
              expect(props.someOtherProps).toEqual('potato');
              return null;
            }}
          />
        </div>
      </FlagsProvider>,
    );
  });

  it('can render with a component', () => {
    expect.assertions(1);

    const truthyFlags: Flags = {
      a: true,
    };

    function MyComponent(props) {
      expect(props.flags.a).toEqual(true);
      return null;
    }

    function MyFallbackComponent(props) {
      expect(true).toEqual(true);
      expect(true).toEqual(true);
      return null;
    }

    mount(
      <FlagsProvider flags={truthyFlags}>
        <Flag name="a" component={MyComponent} fallbackComponent={MyFallbackComponent} />
      </FlagsProvider>,
    );
  });

  it('can fallback to a component', () => {
    expect.assertions(1);

    const falsyFlags: Flags = {
      a: false,
    };

    function MyComponent(props) {
      expect(true).toEqual(true);
      expect(true).toEqual(true);
      return null;
    }

    function MyFallbackComponent(props) {
      expect(props.flags.a).toEqual(false);
      return null;
    }

    mount(
      <FlagsProvider flags={falsyFlags}>
        <Flag name="a" component={MyComponent} fallbackComponent={MyFallbackComponent} />
      </FlagsProvider>,
    );
  });

  it('can render children if they are provided present and flag is truthy', () => {
    expect.assertions(4);

    const flags: Flags = {
      a: 500,
    };

    function MyComponent() {
      expect(true).toEqual(true);
      return null;
    }

    mount(
      <FlagsProvider flags={flags}>
        <div>
          <Flag name="a">
            <MyComponent />
          </Flag>
          <Flag name="a">
            <MyComponent />
          </Flag>
          <Flag name="a">
            <MyComponent />
          </Flag>
          <Flag name="a">
            <MyComponent />
          </Flag>
        </div>
      </FlagsProvider>,
    );
  });

  it('can render nothing if children are provided but flags are falsy', () => {
    expect.assertions(1);

    const flags: Flags = {
      a: false,
      b: true,
      c: '',
    };

    function MyComponent() {
      expect(true).toEqual(true);
      return null;
    }

    mount(
      <FlagsProvider flags={flags}>
        <div>
          <Flag name="a">
            <MyComponent />
          </Flag>
          <Flag name="b">
            <MyComponent />
          </Flag>
          <Flag name="c">
            <MyComponent />
          </Flag>
        </div>
      </FlagsProvider>,
    );
  });
});

describe('ConnectedFlagsProvider && Flag', () => {
  it('fetches flag values off of state', () => {
    interface Resolved extends ResolvedFlags {
      a: boolean;
      b: boolean;
      c: boolean;
      d: boolean;
      e: {
        f: {
          g: boolean;
        };
      };
    }

    interface State {
      hello: boolean;
      flags: Resolved;
    }

    const reducer = combineReducers<State>({
      hello: (state = true) => state,
      flags: createFlagsReducer({
        a: true,
        b: true,
        c: (flags: Resolved) => flags.a && true,
        d: (flags: Resolved) => flags.b && flags.c,
        e: {
          f: {
            g: (flags: Resolved) => flags.d,
          },
        },
      }),
    });

    const store = createStore(reducer);

    const instance = mount(
      <Provider store={store}>
        <ConnectedFlagsProvider>
          <div>
            <Flag name="e.f.g" render={() => <True />} fallbackRender={() => <False />} />
          </div>
        </ConnectedFlagsProvider>
      </Provider>,
    );

    expect(instance.find(`True`).length).toEqual(1);
    expect(instance.find(`False`).length).toEqual(0);

    store.dispatch(
      setFlagsAction({
        a: false,
      }),
    );

    instance.update();

    expect(instance.find(`True`).length).toEqual(0);
    expect(instance.find(`False`).length).toEqual(1);

    store.dispatch(
      setFlagsAction({
        a: true,
        b: true,
      }),
    );

    instance.update();

    expect(instance.find(`True`).length).toEqual(1);
    expect(instance.find(`False`).length).toEqual(0);

    store.dispatch(
      setFlagsAction({
        c: false,
      }),
    );

    instance.update();

    expect(instance.find(`True`).length).toEqual(0);
    expect(instance.find(`False`).length).toEqual(1);
  });

  it('renders falsy when the value does not exist', () => {
    interface Resolved {
      a: boolean;
    }

    interface State {
      flags: Resolved;
    }

    const reducer = combineReducers<State>({
      flags: createFlagsReducer({
        a: true,
      }),
    });

    const store = createStore(reducer);

    const instance = mount(
      <Provider store={store}>
        <ConnectedFlagsProvider>
          <Flag name="b" render={() => <True />} fallbackRender={() => <False />} />
        </ConnectedFlagsProvider>
      </Provider>,
    );

    expect(instance.find(`True`).length).toEqual(0);
    expect(instance.find(`False`).length).toEqual(1);
  });
});

describe('withFlags', () => {
  it('creates a higher order component by pulling them in', () => {
    expect.assertions(2);

    interface Resolved extends ResolvedFlags {
      a: boolean;
      b: boolean;
      c: boolean;
      d: boolean;
      e: {
        f: {
          g: boolean;
        };
      };
    }

    interface State {
      flags: Resolved;
    }

    const reducer = combineReducers<State>({
      flags: createFlagsReducer({
        a: true,
        b: true,
        c: (flags: Resolved) => flags.a && true,
        d: (flags: Resolved) => flags.b && flags.c,
        e: {
          f: {
            g: (flags: Resolved) => flags.d,
          },
        },
      }),
    });

    const store = createStore(reducer);

    type Props = {
      flags: Resolved;
      name: string;
    };

    const Component = ({ name, flags }: Props) => {
      expect(name).toEqual('neato');
      expect(flags.e.f.g).toEqual(true);

      return <div />;
    };

    const Next = withFlags<{ name: string }>(Component);

    mount(
      <Provider store={store}>
        <ConnectedFlagsProvider>
          <Next name="neato" />
        </ConnectedFlagsProvider>
      </Provider>,
    );
  });
});
