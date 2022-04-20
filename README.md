# Flag

This library aims to offer a best-in-class interface for working with feature flags in TypeScript-based React applications.

```
npm install flag
```

## Getting Started

`flag` works by creating bindings at runtime so that context providers, components, and hooks are all strictly typed together. `createFlags` builds these bindings without requiring an data.

```ts
// flags.ts

import { createFlags } from "flag";

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

export const { FlagBackendProvider, Flag, useFlag } = createFlags<MyFlags>();
```

## React API

### FlagBackendProvider

Returned as part of `createFlags<T>()`. This React component expects to receive a `Backend` that returns flags of type `T`.

| Props      | Type            | Required | Description            |
| ---------- | --------------- | -------- | ---------------------- |
| `backend`  | `Computable<T>` | `true`   | All pre-computed flags |
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
  other: otherReducer,
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

export const someThunk: Thunk<any> =
  ({ dispatch }) =>
  async () => {
    const user = await fetchUser();

    dispatch(setFlagsAction(user.flags));
    // ...
  };
```

## Setting NODE_ENV

## License

MPL-2.0
