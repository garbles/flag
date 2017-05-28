import { createFlagsReducer, setFlagsAction, Flag, Value } from './flags';

describe('createFlagsReducer', () => {
  it('creates a reducer function for flags', () => {
    const flags = {
      coolFeature: true,
      config: {
        apiUrl: 'www.example.com/api',
        daysWithoutAnInjury: 12,
      }
    };

    const reducer = createFlagsReducer(flags);

    expect(typeof reducer).toEqual('function');
    expect(reducer.length).toEqual(2);
  });

  it('sets flags when the correct flag is dispatched', () => {
    const flags = {
      coolFeature: true,
      config: {
        apiUrl: 'www.example.com/api',
        daysWithoutAnInjury: 12,
      }
    };

    const reducer = createFlagsReducer<typeof flags>(flags);

    const next = reducer(flags, setFlagsAction({
      coolFeature: false,
      config: {
        daysWithoutAnInjury: 15
      }
    }));

    expect(next.coolFeature).toEqual(false);
    expect(next.config.daysWithoutAnInjury).toEqual(15);
  });
});