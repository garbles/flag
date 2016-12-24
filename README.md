# Feature Flag

_Feature flagging made easy for React and Redux_

## Motivation

Feature flagging is necessary for large client-side applications. They improve development speed
and allow teams to test new features before they are stable. In order to __WANT__ to use feature
flags in an application, they should be __VERY__ easy to add and remove. That means minimal
boiler plate and no need to pass boolean props down through component hierarchy. Such could be
done with global variables; however, they live outside of the React/Redux lifecycle, making them
more difficult to control. Instead, this library injects and then accesses feature flags directly
from the application Redux store.

## Getting Started

Wrapping any part of the application in a feature flag is easy. First, we declare the flags as
part of the store initialization. To do it, use `FeatureFlag.instrument` which creates a Redux enchancer.

```js
// index.js
import {FeatureFlag} from 'react-redux-feature-flag';

const enhancer =
  FeatureFlag.instrument({
    flagA: true,
    flagB: false,
    computedFlag: flags => flags.flagA && flags.flagB
  });
```

Next, initialize the store using the enhancer.

```js
// index.js
import {createStore} from 'redux';
import {FeatureFlag} from 'react-redux-feature-flag';

// ...

const reducer = (state, action) => { /* ... */ };
const initialState = { /* ... */ };

const store = createStore(reducer, initialState, enhancer);
```

You can also compose it with your favorite Redux middlewares.

```js
// index.js
import {applyMiddleware, createStore, compose} from 'redux';
import thunk from 'redux-thunk';
import {FeatureFlag} from 'react-redux-feature-flag';

// ...

const store = createStore(reducer, initialState,
  compose(
    applyMiddleware(thunk),
    enchancer
  )
);
```

Using `react-redux`, intialize the application with the store.

```js
// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import App from './App';

// ...

const store = createStore(/* ... */);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector('#root')
)
```

Finally, use the `FeatureFlag` anywhere in the application. It's used just as
it would with any React component. In the following example, if `flagA` is truthy the
`render` prop will be used. If it is falsy, `fallbackRender` will be used.

```js
// Sidebar.jsx
import React from 'react';
import {FeatureFlag} from 'react-redux-feature-flag';
import TitleBar from './TitleBar';
import NewSideBar from './NewSideBar';
import OldSideBar from './OldSideBar';

export default function Sidebar(props) {
  return (
    <div>
      <TitleBar />
      <FeatureFlag>
        name="flagA"
        render={() => <NewSidebar {...props} />}
        fallbackRender{() => <OldSidebar {...props} />}
      />
    </div>
  );
}
```

## API

### FeatureFlag

The main component. Requires that the store has been initialized with the
`FeatureFlag.instrument` enhancer.

Prop | Type | Required | Description
--- | --- | --- | ---
name | string | true | The name of the feature to check
render | (val: any) => ReactElement | false | The render function is the flag is __truthy__
fallbackRender | (val: any) => ReactElement | false | The render function is the flag is __falsy__

```js
<FeatureFlag>
  name="flagA"
  render={(valueOfFlagA) => <TruthyFeature />}
  fallbackRender{(valueOfFlagA) => <FalsyFeature />}
/>
```

### FeatureFlag.instrument

Creates an enhancer to be used on store initialization. Accepts an object where the keys are flags.
The values can either be plain values or functions. If the flag is a function, it is computed from
other flags and the current state.

```js
FeatureFlag.instrument({
  flagA: true,
  flagB: false,
  computedFlag: flags => flags.flagA && flags.flagB
});
```


### setFlags

A dispatchable action that sets flags. You can't change a flag to or from a computed flag. You also
can't declare new flags after the store has been created.

```js
dispatch(
  setFlags({
    flagA: false
  })
);
```

## Installation

```
yarn add react-redux-feature-flag
```

## License

MIT
