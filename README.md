# Flag

_Feature flagging made easy for React and Redux_

```
yarn add flag
```

## Motivation

Feature flagging is necessary for large client-side applications. They improve development speed
and allow teams to test new features before they are stable. In order to **WANT** to use feature
flags in an application, they should be **VERY** easy to add and remove. That means minimal
boiler plate and no need to pass boolean props down through component hierarchy. Such a thing could be
done with global variables; however, they live outside of the React/Redux lifecycle, making them
more difficult to control. Instead, this library injects and then accesses feature flags directly
from the React context without getting in your way.

Flag allows you to declare flags as either plain values or as functions. If a flag is a function then it is referred to as a computed flag. The function accepts one argument which is the flags object itself. You do not have to use computed flags, but they can be very convenient. For example,

```ts
const flags = {
  // properties can be nested objects
  features: {
    // they can be boolean
    useMyCoolNewThing: true
  },
  config: {
    // they can be strings
    apiUrl: "www.example.com/api"
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

## Getting Started

This library has strong TypeScript support as of v4. In order to get that support, you must
initialize the `flag` library before using it.

### createFlags

Creates React bindings for flags. **You should only initialize one instance of this API**. Does
not take any value arguments, but takes one type argument `T` which is the shape of your resolved
flags.

```ts
// flags.ts

import createFlags from "flag";

export type MyFlags = {
  features: {
    useMyCoolNewThing: boolean;
  };
  config: {
    apiUrl: string;
  };
  cool: number;
  dude: number;
  coolAndDude: number;
  largeCoolAndDude: boolean;
};

const { FlagsProvider, Flag, useFlag, useFlags } = createFlags<MyFlags>();

export { FlagsProvider, Flag, useFlag, useFlags };
```

### createReduxBindings

You can also add support for Redux by importing `createReduxBindings` from `flag/redux`.

| Args       | Type               | Required | Description                       |
| ---------- | ------------------ | -------- | --------------------------------- |
| `provider` | `FlagsProvider<T>` | `true`   | Provider created by `createFlags` |

```ts
// flags.ts

// ... the above

import createReduxBindings from "flag/redux";

const {
  setFlagsAction,
  getFlagsSelector,
  createFlagsReducer,
  ConnectedFlagsProvider
} = createReduxBindings(FlagsProvider);

export {
  setFlagsAction,
  getFlagsSelector,
  createFlagsReducer,
  ConnectedFlagsProvider
};
```

## React API

For brevity, the type `T` in the section below refers to the shape of your resolved feature flags.

### Computable

Generic type used to describe unresolved flags. Very useful when including functions are part of your flag definitions because function arguments can be inferred.

```tsx
import { Computable } from "flag";

type MyFlags = {
  a: boolean;
  b: boolean;
  c: boolean;
};

const flags: Computable<MyFlags> = {
  a: true,
  b: false,
  // 👇 `flags` type checks!
  c: flags => flags.a && flags.b
};
```

### FlagsProvider

Returned as part of `createFlags()`. React component that makes flags available to children through the Context API.

| Props      | Type            | Required | Description            |
| ---------- | --------------- | -------- | ---------------------- |
| `flags`    | `Computable<T>` | `true`   | All pre-computed flags |
| `children` | `ReactNode`     | `true`   | React children         |

```tsx
// index.tsx

import { MyApplication } from "./app";
import { FlagsProvider, Flag } from "./flags";

const instance = (
  <FlagsProvider flags={flags}>
    <MyApplication />
  </FlagsProvider>
);

React.render(instance, document.querySelector("#app"));
```

### Flag

Returned as part of `createFlags()`. Renders a some UI based on whether a flag is truthy or falsy. It's a glorified if statement 😬. Must be used in side of `FlagsProvider`.

| Props               | Type                          | Required | Description                         |
| ------------------- | ----------------------------- | -------- | ----------------------------------- |
| `name`              | `string[]`                    | `true`   | Must be a valid key path of `T`     |
| `children`          | `ReactNode`                   | `false`  | React children                      |
| `render`            | `(flags: T) => ReactNode`     | `false`  | Function that returns a `ReactNode` |
| `fallbackRender`    | `(flags: T) => ReactNode`     | `false`  | Function that returns a `ReactNode` |
| `component`         | `ComponentType<{ flags: T }>` | `false`  | React Component with `T` as props   |
| `fallbackComponent` | `ComponentType<{ flags: T }>` | `false`  | React Component with `T` as props   |

Order of deciding which of these nodes to renders is as follows:

- If the flag is `truthy`:
  - render `children` if defined
  - call `render` with `T` if defined _or_
  - call `component` with `{flags: T}` if defined _else_
  - return `null`
- If the flag is `falsy`:
  - call `fallbackRender` with `T` if defined _or_
  - call `fallbackComponent` with `{ flags: T }` if defined _else_
  - return `null`

```tsx
<Flag
  name={["features", "useMyCoolNewThing"]}
  render={() => <div>Rendered on truthy</div>}
  fallbackRender={() => <div>Rendered on falsy</div>}
/>
```

### useFlags

Returned as part of `createFlags()`. A React hook that returns all of the flags. Must be used in side of `FlagsProvider`.

```tsx
// my-component.tsx

import { useFlags } from "./flags";

const MyComponent = () => {
  const flags = useFlags();

  return <div>The API url is "{flags.config.apiUrl}"</div>;
};
```

### useFlag

Returned as part of `createFlags()`. A React hook to return a single flag. Must be used in side of `FlagsProvider`.

| Args      | Type       | Required | Description                     |
| --------- | ---------- | -------- | ------------------------------- |
| `keyPath` | `string[]` | `true`   | Must be a valid key path of `T` |

```tsx
// my-component.tsx

import { useFlags } from "./flags";

const MyComponent = () => {
  const apiUrl = useFlag(["config", "apiUrl"]);

  return <div>The API url is "{apiUrl}"</div>;
};
```

## Redux API

### createFlagsReducer

Returned as part of `createReduxBindings(...)`. Creates a reducer to be used in your Redux stores.

| Args    | Type | Required | Description                     |
| ------- | ---- | -------- | ------------------------------- |
| `flags` | `T`  | `true`   | The initial value of your flags |

```tsx
// reducer.ts

import { combineReducers } from "redux";
import { Computable } from "flag";
import { createFlagsReducer, MyFlags } from "./flags";
import { otherReducer } from "./other-reducer";

const flags: Computable<MyFlags> = {
  // ...
};

export default combineReducers({
  // 👇 must use the "flags" key of your state
  flags: createFlagsReducer(flags),
  other: otherReducer
});
```

### getFlagsSelector

A selector to retrieve _computed_ flags from Redux state. It is not enough to say `state.flags` because `createFlagsReducer` does not eagerly evaluate computable flags.
(Though I suppose if you don't use any computable flags, then you don't necessarily need this 🤷‍♂️.)

```tsx
// reducer.ts

import { getFlagsSelector, MyFlags } from "./flags";

type State = {
  flags: MyFlags;
  // ...
};

// ...

export const getFlags = (state: State) => getFlagsSelector(state);
```

### ConnectedFlagsProvider

Returned as part of `createReduxBindings(...)`. Wraps `FlagsProvider`, fetching the flags from Redux state.

```tsx
import { Provider } from "redux";
import { MyApplication } from "./app";
import { ConnectedFlagsProvider } from "./flags";
import { store } from "./store";

const instance = (
  <Provider store={store}>
    <ConnectedFlagsProvider>
      <MyApplication />
    </ConnectedFlagsProvider>
  </Provider>
);

React.render(instance, document.querySelector("#app"));
```

### setFlagsAction

Returned as part of `createReduxBindings(...)`. A dispatchable action that sets flags. Merges a partial value of pre-computed flags with existing pre-computed flags.

| Args    | Type            | Required | Description                |
| ------- | --------------- | -------- | -------------------------- |
| `flags` | `Computable<T>` | `true`   | Partial pre-computed flags |

```tsx
import { Thunk } from "redux-thunk";
import { setFlagsAction } from "./flags";

export const someThunk: Thunk<any> = ({ dispatch }) => async () => {
  const user = await fetchUser();

  dispatch(setFlagsAction(user.flags));
  // ...
};
```

## License

MPL-2.0
