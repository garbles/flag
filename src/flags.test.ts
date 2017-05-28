import { createFlagsReducer, setFlagsAction, Flag, Value } from './flags';

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

    const flags = {
      a: ({ b }: ResolvedFlags) => b.c,
      b: {
        c: 12,
        d: ({ a, b }: ResolvedFlags) => a + b.c,
        e: 'hello',
        f: ({ b: { d, e } }: ResolvedFlags) => e + '!' + d
      }
    };

    const reducer = createFlagsReducer<typeof flags, ResolvedFlags>(flags);

    const next = reducer(undefined, { type: 'RANDOM' });

    expect(next.b.d).toEqual(24);

    const final = reducer(next, setFlagsAction({
      b: {
        c: 20
      }
    }));

    expect(final.b.d).toEqual(40);
    expect(final.b.f).toEqual('hello!40');
  });
});