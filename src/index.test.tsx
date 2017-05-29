// tslint:disable:jsx-no-lambda

import { mount } from "enzyme";
import * as React from "react";
import { Provider } from "react-redux";
import { combineReducers, createStore } from "redux";

import {
  ConnectedFlagsProvider,
  createFlagsReducer,
  Flag,
  FlagsProvider,
  IFlags,
  IResolvedFlags,
  setFlagsAction,
  Value,
} from "./index";

const True = () => <noscript>T</noscript>;
const False = () => <noscript>F</noscript>;

describe("createFlagsReducer", () => {
  it("creates a reducer function for flags", () => {
    const flags = {
      a: true,
      b: {
        c: "www.example.com/api",
        d: 12,
      },
    };

    const reducer = createFlagsReducer(flags);

    expect(typeof reducer).toEqual("function");
    expect(reducer.length).toEqual(2);
  });

  it("sets flags when the correct flag is dispatched", () => {
    const flags = {
      a: true,
      b: {
        c: 12,
      },
    };

    const reducer = createFlagsReducer<typeof flags>(flags);

    const next = reducer(flags, setFlagsAction({
      a: false,
      b: {
        c: 15,
      },
    }));

    expect(next.a).toEqual(false);
    expect(next.b.c).toEqual(15);
  });
});

describe("FlagsProvider && Flag", () => {
  it("accepts uncomputed flags as props", () => {
    interface IResolved extends IResolvedFlags {
      a: boolean;
      b: boolean;
      c: boolean;
      d: boolean;
      e: {
        f: {
          g: boolean;
        },
      };
    }

    const flags1: IFlags = {
      a: true,
      b: true,
      c: (flags: IResolved) => flags.a && true,
      d: (flags: IResolved) => flags.b && flags.c,
      e: {
        f: {
          g: (flags: IResolved) => flags.d,
        },
      },
    };

    let instance = mount(
      <FlagsProvider flags={flags1}>
        <div>
          <Flag
            name="e.f.g"
            render={() => <True />}
            fallbackRender={() => <False />}
          />
        </div>
      </FlagsProvider>,
    );

    expect(instance.find(`True`).length).toEqual(1);
    expect(instance.find(`False`).length).toEqual(0);

    const flags2 = {
      a: true,
      b: false,
      c: (flags: IResolved) => flags.a && true,
      d: (flags: IResolved) => flags.b && flags.c,
      e: {
        f: {
          g: (flags: IResolved) => flags.d,
        },
      },
    };

    instance = mount(
      <FlagsProvider flags={flags2}>
        <div>
          <Flag
            name="e.f.g"
            render={() => <True />}
            fallbackRender={() => <False />}
          />
        </div>
      </FlagsProvider>,
    );

    expect(instance.find(`True`).length).toEqual(0);
    expect(instance.find(`False`).length).toEqual(1);
  });
});

describe("ConnectedFlagsProvider && Flag", () => {
  it("fetches flag values off of state", () => {
    interface IResolved extends IResolvedFlags {
      a: boolean;
      b: boolean;
      c: boolean;
      d: boolean;
      e: {
        f: {
          g: boolean;
        },
      };
    }

    interface IState {
      flags: IResolved;
    }

    const reducer = combineReducers<IState>({
      flags: createFlagsReducer({
        a: true,
        b: true,
        c: (flags: IResolved) => flags.a && true,
        d: (flags: IResolved) => flags.b && flags.c,
        e: {
          f: {
            g: (flags: IResolved) => flags.d,
          },
        },
      }),
    });

    const store = createStore(reducer);

    const instance = mount(
      <Provider store={store}>
        <ConnectedFlagsProvider>
          <div>
            <Flag
              name="e.f.g"
              render={() => <True />}
              fallbackRender={() => <False />}
            />
          </div>
        </ConnectedFlagsProvider>
      </Provider>,
    );

    expect(instance.find(`True`).length).toEqual(1);
    expect(instance.find(`False`).length).toEqual(0);

    store.dispatch(setFlagsAction({
      a: false,
    }));

    expect(instance.find(`True`).length).toEqual(0);
    expect(instance.find(`False`).length).toEqual(1);

    store.dispatch(setFlagsAction({
      a: true,
      b: true,
    }));

    expect(instance.find(`True`).length).toEqual(1);
    expect(instance.find(`False`).length).toEqual(0);

    store.dispatch(setFlagsAction({
      c: false,
    }));

    expect(instance.find(`True`).length).toEqual(0);
    expect(instance.find(`False`).length).toEqual(1);
  });

  it("renders falsy when the value does not exist", () => {
    interface IResolvedFlags {
      a: boolean;
    }

    interface IState {
      flags: IResolvedFlags;
    }

    const reducer = combineReducers<IState>({
      flags: createFlagsReducer({
        a: true,
      }),
    });

    const store = createStore(reducer);

    const instance = mount(
      <Provider store={store}>
        <ConnectedFlagsProvider>
          <Flag
            name="b"
            render={() => <True />}
            fallbackRender={() => <False />}
          />
        </ConnectedFlagsProvider>
      </Provider>,
    );

    expect(instance.find(`True`).length).toEqual(0);
    expect(instance.find(`False`).length).toEqual(1);
  });
});
