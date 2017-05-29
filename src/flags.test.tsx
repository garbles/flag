import * as React from 'react';
import { mount } from 'enzyme';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { createFlagsReducer, setFlagsAction, Flag, Value } from './flags';

const True = () => <noscript>T</noscript>;
const False = () => <noscript>F</noscript>;

describe('createFlagsReducer', () => {
  it('creates a reducer function for flags', () => {
    const flags = {
      a: true,
      b: {
        c: 'www.example.com/api',
        d: 12,
      }
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
      }
    };

    const reducer = createFlagsReducer<typeof flags, typeof flags>(flags);

    const next = reducer(flags, setFlagsAction({
      a: false,
      b: {
        c: 15
      }
    }));

    expect(next.a).toEqual(false);
    expect(next.b.c).toEqual(15);
  });

  it('uses computed flags as if they were plain values', () => {
    type ResolvedFlags = {
      a: number;
      b: {
        c: number;
        d: number;
        e: string;
        f: string;
      };
    };

    type State = { flags: ResolvedFlags };

    const defaultFlags = {
      a: ({ b }: ResolvedFlags) => b.c,
      b: {
        c: 12,
        d: ({ a, b }: ResolvedFlags) => a + b.c,
        e: 'hello',
        f: ({ b: { d, e } }: ResolvedFlags) => e + '!' + d
      }
    };

    const reducer = combineReducers<State>({
      flags: createFlagsReducer(defaultFlags)
    });

    const store = createStore(reducer);

    store.dispatch({ type: 'UNRELATED1' });
    store.dispatch({ type: 'UNRELATED2' });

    expect(store.getState().flags.b.f).toEqual('hello!24');

    store.dispatch(setFlagsAction({
      b: {
        c: 20
      }
    }));

    store.dispatch({ type: 'UNRELATED3' });
    store.dispatch({ type: 'UNRELATED4' });

    expect(store.getState().flags.b.f).toEqual('hello!40');
  });
});

describe('Flag', () => {
  it('fetches flag values off of state', () => {
    type ResolvedFlags = {
      a: boolean;
      b: boolean;
      c: boolean;
      d: boolean;
    }

    type State = {
      flags: ResolvedFlags;
    };

    const reducer = combineReducers<State>({
      flags: createFlagsReducer({
        a: true,
        b: true,
        c: (flags: ResolvedFlags) => flags.a && true,
        d: (flags: ResolvedFlags) => flags.b && flags.c
      })
    });

    const store = createStore(reducer);

    const instance = mount(
      <Provider store={store}>
        <Flag
          name="d"
          render={() => <True />}
          falsyRender={() => <False />}
        />
      </Provider>
    );

    expect(instance.find(`True`).length).toEqual(1);
    expect(instance.find(`False`).length).toEqual(0);

    store.dispatch(setFlagsAction({
      a: false
    }));

    expect(instance.find(`True`).length).toEqual(0);
    expect(instance.find(`False`).length).toEqual(1);

    store.dispatch(setFlagsAction({
      a: true,
      b: true
    }));

    expect(instance.find(`True`).length).toEqual(1);
    expect(instance.find(`False`).length).toEqual(0);

    store.dispatch(setFlagsAction({
      c: false
    }));

    expect(instance.find(`True`).length).toEqual(0);
    expect(instance.find(`False`).length).toEqual(1);
  });

  it('renders falsy when the value does not exist', () => {
    type ResolvedFlags = {
      a: boolean;
    }

    type State = {
      flags: ResolvedFlags;
    };

    const reducer = combineReducers<State>({
      flags: createFlagsReducer({
        a: true,
      })
    });

    const store = createStore(reducer);

    const instance = mount(
      <Provider store={store}>
        <Flag
          name="b"
          render={() => <True />}
          falsyRender={() => <False />}
        />
      </Provider>
    );

    expect(instance.find(`True`).length).toEqual(0);
    expect(instance.find(`False`).length).toEqual(1);
  });
});