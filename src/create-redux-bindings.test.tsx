import { mount } from "enzyme";
import * as React from "react";
import { createFlags } from "./create-flags";
import { Computable } from "deep-computed";
import { Provider } from "react-redux";
import { combineReducers, createStore } from "redux";
import { createReduxBindings } from "./create-redux-bindings";

const { FlagsProvider, Flag } = createFlags<Flags>();
const {
  ConnectedFlagsProvider,
  createFlagsReducer,
  setFlagsAction,
  getFlagsSelector
} = createReduxBindings(FlagsProvider);

type Flags = {
  a: boolean;
  b: boolean;
  c: boolean;
  d: boolean;
  e: {
    f: {
      g: boolean;
    };
  };
  h: boolean;
  i: number;
};

const flags: Computable<Flags> = {
  a: true,
  b: true,
  c: f => f.a && true,
  d: f => f.b && f.c,
  e: {
    f: {
      g: f => f.d
    }
  },
  h: false,
  i: 123
};

const True = () => <noscript>T</noscript>;
const False = () => <noscript>F</noscript>;

describe("createFlagsReducer", () => {
  it("creates a reducer function for flags", () => {
    const reducer = createFlagsReducer(flags);

    expect(typeof reducer).toEqual("function");
    expect(reducer.length).toEqual(2);
  });

  it("sets the initial state to the flags passed in", () => {
    const dummyFlags: any = { a: flags.a };

    const stateA = createFlagsReducer(flags)(undefined, { type: "" });
    const stateB = createFlagsReducer(dummyFlags)(undefined, { type: "" });

    expect(stateA).toBe(flags);
    expect(stateB).toBe(dummyFlags);
  });

  it("sets flags when the correct flag is dispatched", () => {
    const reducer = createFlagsReducer(flags);

    const next = reducer(
      flags,
      setFlagsAction({
        a: false,
        e: {
          f: {
            g: false
          }
        }
      })
    );

    expect(next.a).toEqual(false);
    expect(next.e.f.g).toEqual(false);
  });
});

describe("getFlagsSelector", () => {
  it("fetches the correct state and computes the values", () => {
    const aReducer = (s: string = "") => s;
    const bReducer = (s: number = 12) => s;

    const reducer = combineReducers({
      a: aReducer,
      b: bReducer,
      flags: createFlagsReducer(flags)
    });

    let state = reducer(undefined, { type: "" });
    let stateFlags = getFlagsSelector(state);

    expect(stateFlags).toEqual({
      a: true,
      b: true,
      c: true,
      d: true,
      e: {
        f: {
          g: true
        }
      },
      h: false,
      i: 123
    });

    /**
     * Many computed flags depend on `a`, so toggle it.
     */
    state = reducer(state, setFlagsAction({ a: false }));
    stateFlags = getFlagsSelector(state);

    expect(stateFlags).toEqual({
      a: false,
      b: true,
      c: false,
      d: false,
      e: {
        f: {
          g: false
        }
      },
      h: false,
      i: 123
    });
  });
});

describe("ConnectedFlagsProvider", () => {
  it("fetches flag values off of state", () => {
    interface State {
      hello: boolean;
      flags: Computable<Flags>;
    }

    const reducer = combineReducers<State>({
      hello: (state = true) => state,
      flags: createFlagsReducer(flags)
    });

    const store = createStore(reducer);

    const instance = mount(
      <Provider store={store}>
        <ConnectedFlagsProvider>
          <div>
            <Flag
              name={["e", "f", "g"]}
              render={() => <True />}
              fallbackRender={() => <False />}
            />
          </div>
        </ConnectedFlagsProvider>
      </Provider>
    );

    expect(instance.find(`True`).length).toEqual(1);
    expect(instance.find(`False`).length).toEqual(0);

    store.dispatch(
      setFlagsAction({
        a: false
      })
    );

    instance.update();

    expect(instance.find(`True`).length).toEqual(0);
    expect(instance.find(`False`).length).toEqual(1);

    store.dispatch(
      setFlagsAction({
        a: true,
        b: true
      })
    );

    instance.update();

    expect(instance.find(`True`).length).toEqual(1);
    expect(instance.find(`False`).length).toEqual(0);

    store.dispatch(
      setFlagsAction({
        c: false
      })
    );

    instance.update();

    expect(instance.find(`True`).length).toEqual(0);
    expect(instance.find(`False`).length).toEqual(1);
  });
});
