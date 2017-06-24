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
from the React context without getting in your way.

## Getting Started

Flag allows you to declare flags as either plain values or as functions. If a flag is a function then it is referred to as a computed
flag. The function accepts one argument which is the flags object itself. You do not have to use computed flags, but they can be very convenient.
For example:

```js
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
  // other computed properties are resolved for you, so that you do not
  // need to call it as a function.
  largeCoolAndDude: flags => flags.coolAndDude > 10
};
```

Notice that computed flags nested in other flags (e.g. `flags.coolAndDude` inside `largeCoolAndDude`) is already resolved as its value. The flags object
can then either be store in your Redux store or passed in as a prop to `FlagProvider`.

## General use

This library can be used with vanilla React and with React-Redux. The main component is `Flag` that specifies which flag you're checking and how to handle it. Use this component whenever you need to split rendering based on a flag.

The decision trees of which component or function to call is done in the following order:

- Is the flag truthy?
  - Yes
    - Did the developer declare a `component` prop?
      - Yes
        - Render an instance of that component
        - DONE.
      - No
        - Did the developer declare a `render` prop?
          - Yes
            - Call the function and use the return.
            - DONE.
          - No
            - Render `null`
            - DONE.
  - No
    - Did the developer declare a `fallbackComponent` prop?
      - Yes
        - Render an instance of that component
        - DONE.
      - No
        - Did the developer declare a `fallbackRender` prop?
          - Yes
            - Call the function and use the return.
            - DONE.
          - No
            - Render `null`
            - DONE.

Here's an example of using `render` and `fallbackRender`, forking on `features.useMyCoolNewThing`.

```jsx
import { Flag } from 'flag';

<Flag
  name="features.useMyCoolNewThing"
  render={() =>
    <div>Rendered on truthy</div>
  }
  fallbackRender={() =>
    <div>Rendered on falsy</div>
  }
/>
```

### Use with `react`

To use this with just React, we handle flags with the `FlagProvider` component which makes flags available to child through React context.

```jsx
import { FlagsProvider, Flag } from 'flag';

const flags = { /*...*/ };

const instance = (
  <FlagsProvider flags={flags}>
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
  </FlagsProvider>
);

React.render(instance, document.querySelector('#app'));
```

### Use with `react-redux`

You can alternatively keep your flags in a Redux store. The only caveat here is that they must be store on the `flags` key of your state.
In the example below, we use `createFlagsReducer` to create the correct reducer.

```js
import { createStore, combineReducers } from 'redux';
import { createFlagsReducer } from 'flag';

const reducer = combineReducer({
  ...myOtherReducers,
  flags: createFlagsReducer({
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
  })
});

const store = createStore(reducer);
```

After creating the store, we attach flags to the correct context by wrapping the application in `ConnectedFlagsProvider`
which retrieves the flag state. Then the `Flag` component behaves as usual.

```jsx
import { Provider } from 'react-redux';
import { ConnectedFlagsProvider, Flag } from 'flag';

const instance = (
  <Provider store={store}>
    <ConnectedFlagsProvider>
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
    </ConnectedFlagsProvider>
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
component | React.ComponentType<any> | false | The component to use if the flag is __truthy__
fallbackComponent | React.ComponentType<any> | false | The component to use if the flag is __falsy__

```jsx
<Flag
  name="flagA"
  render={(valueOfFlagA) => <TruthyFeature />}
  fallbackRender={(valueOfFlagA) => <FalsyFeature />}
/>
```

### FlagsProvider

Attaches flags to the appropriate React context. Also transforms computed flags.

Prop | Type | Required | Description
--- | --- | --- | ---
flags | Flags | true | Nested object of plain value and computed flags

```jsx
<FlagsProvider flags={{myFeature: true}}>
  <App />
</FlagsProvider>
```

### ConnectedFlagsProvider

Same as `FlagsProvider` except flags are fetched from a Redux store which has been attached to
React context by the React-Redux `Provider`.

```jsx
<Provider store={store}>
  <ConnectedFlagsProvider>
    <App />
  </ConnectedFlagsProvider>
</Provider>
```

### setFlagsAction

A dispatchable action that sets flags.

```js
store.dispatch(
  setFlagsAction({
    myFeature: false
  })
);
```

### createFlagsReducer

Creates the reducer for your Redux store. Accepts any plain object as an argument.

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
  ...myOtherReducers
  flags: createFlagsReducer(myDefaultFlags)
})
```

## License

MIT
