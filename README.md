# Flag

_Feature flagging made easy for React and Redux_

```
yarn add flag
```

## Motivation

Feature flagging is necessary for large client-side applications. They improve development speed
and allow teams to test new features before they are stable. In order to __WANT__ to use feature
flags in an application, they should be __VERY__ easy to add and remove. That means minimal
boiler plate and no need to pass boolean props down through component hierarchy. Such a thing could be
done with global variables; however, they live outside of the React/Redux lifecycle, making them
more difficult to control. Instead, this library injects and then accesses feature flags directly
from the application Redux store without getting in your way.


## Getting Started

Wrapping any part of the application in a feature flag is easy. First, we declare a flags top-level key as part of our reducer.

```js
import { createStore, combineReducers } from 'redux';
import { createFlagsReducer } from 'flag';

const flags = {
  // properties can be nested objects
  features: {
    // they can be boolean
    useMyCoolNewThing: true,
  },
  config: {
    // they can be strings
    apiUrl: 'www.example.com/api',
  },
  // they can be numbers
  cool: 1,
  dude: 5,
  // they can be computed
  coolAndDude: flags => flags.cool + flags.dude,
  // they can be computed from other computed properties.
  largeCoolAndDude: flags => flags.coolAndDude > 10
};

const reducer = combineReducer({
  flags: createFlagsReducer(flags)
});

const store = createStore(reducer);
```

Now that I've created the store, I need only use the `Flag` component anywhere in my app
hierarchy where I can specify which key to check and what to do in both the truthy and falsy
cases.

```jsx
import { Provider } from 'react-redux';
import { Flag } from 'flag';

const instance = (
  <Provider store={store}>
    <div>
      This is my application.
      <Flag
        name="features.useMyCoolNewThing"
        render={() =>
          <div>Rendered on truthy</div>
        }
        fallbackRender={() =>
          <div>Rendered on falsy</div>
        }
      />
    </div>
  </Provider>
);

React.render(instance, document.querySelector('#app'));
```

## API

### Flag

The main React component.

Prop | Type | Required | Description
--- | --- | --- | ---
name | string | true | The name of the feature to check
render | (val: any) => ReactElement | false | The render function if the flag is __truthy__
fallbackRender | (val: any) => ReactElement | false | The render function if the flag is __falsy__

```js
<Flag
  name="flagA"
  render={(valueOfFlagA) => <TruthyFeature />}
  fallbackRender={(valueOfFlagA) => <FalsyFeature />}
/>
```

### setFlagsAction

A dispatchable action that sets flags.

```js
store.dispatch(
  setFlagsAction({
    flagA: false
  })
);
```

### createFlagsReducer

Creates the reducer for your redux store. Accepts any plain object as an argument.

```js
const myDefaultFlags = {
  features: {
    useMyCoolNewThing: true,
    useMyOtherThing: false,
    proAccount: ({features}) => features.useMyCoolNewThing && features.useMyOtherThing
  },
  config: {
    apiUrl: 'www.example.com/api',
  },
}

const reducer = combineReducers({
  flags: createFlagsReducer(myDefaultFlags)
})
```

## License

MIT
