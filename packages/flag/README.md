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

## React Bindings

### `FlagBackendProvider`

_Returned as part of `createFlags<T>()`._

This React component provides a `Backend<T>` ([see below](https://github.com/garbles/flag/tree/master/packages/flag#backends)) as a data source for `Flag` and `useFlag`.

| Props      | Type               | Required | Description               |
| ---------- | ------------------ | -------- | ------------------------- |
| `backend`  | `Types.Backend<T>` | `true`   | The data source for flags |
| `children` | `ReactNode`        | `true`   | React children            |

```tsx
// index.tsx

import React from "react";
import ReactDOM from "react-dom";
import { NullBackend } from "flag";
import { App } from "./app";
import { FlagBackendProvider } from "./flags";

const backend = new NullBackend();

const root = ReactDOM.createRoot(document.querySelector("#app"));

root.render(
  <FlagBackendProvider backend={backend}>
    <App />
  </FlagBackendProvider>
);
```

### `useFlag`

_Returned as part of `createFlags<T>()`._

A hook to fetch a single flag. Requires a valid key path and a default value. The key path must terminate at a string, boolean or number and the default value must be of the same type that it terminates. Forcing a default to be provided will minimize the change of a runtime error occurring.

| Args           | Type                                         | Required | Description                                                |
| -------------- | -------------------------------------------- | -------- | ---------------------------------------------------------- |
| `keyPath`      | `Types.KeyPath<T> \| Types.KeyPathString<T>` | `true`   | A valid key path of `T` to a string, boolean or number     |
| `defaultValue` | `GetValueFromKeyPath<T, KP>`                 | `true`   | A fallback in case it is not available in the `Backend<T>` |

```tsx
// my-component.tsx

import { useFlag } from "./flags";

const MyComponent = () => {
  /**
   * The key path can be either an array or string of keys joined by `.`
   * It _must_ terminate at a string, boolean or number type.
   */
  const apiUrl = useFlag(["config", "apiUrl"], "https://example.com");
  const apiUrl2 = useFlag("config.apiUrl", "https://example.com");

  return <div>The API url is "{apiUrl}"</div>;
};
```

### `Flag`

_Returned as part of `createFlags<T>()`._

Renders a some UI based on whether a flag is `false` or not. (It's a glorified if statement 😬).

| Args           | Type                                         | Required | Description                                                |
| -------------- | -------------------------------------------- | -------- | ---------------------------------------------------------- |
| `keyPath`      | `Types.KeyPath<T> \| Types.KeyPathString<T>` | `true`   | A valid key path of `T` to a string, boolean or number     |
| `defaultValue` | `GetValueFromKeyPath<T, KP>`                 | `true`   | A fallback in case it is not available in the `Backend<T>` |
| `render`       | `(flags: T) => ReactNode`                    | `true`   | Function that returns a `ReactNode`                        |
| `fallback`     | `() => ReactNode`                            | `false`  | Function that returns a `ReactNode`                        |

```tsx
<Flag
  name="features.useMyCoolNewThing"
  defaultValue={false}
  render={() => <div>Rendered on truthy</div>}
  fallback={() => <div>Rendered on falsy</div>}
/>
```

## Backends

`FlagBackendProvider` requires that you pass a `Backend<T>` which is responsible for retreiving flags to your application.

`flag` bundles with several useful backends, but you can also roll your own.

### `StaticBackend<T>`

Accepts a JSON object that matches the partial shape of your flags. It can be nested, but shouldn't use arrays.

```tsx
import React from "react";
import ReactDOM from "react-dom";
import { StaticBackend } from "flag";
import { FlagBackendProvider, MyFlags } from "./flags";
import { App } from "./app";

const backend = new StaticBackend<MyFlags>({
  features: {
    useMyCoolNewThing: false,
  },
  config: {
    apiUrl: "https://example.com",
  },
  cool: 100,
  dude: 200,
  coolAndDude: 300,
  largeCoolAndDude: 600,
});

const root = ReactDOM.createRoot(document.querySelector("#app"));

root.render(
  <FlagBackendProvider backend={backend}>
    <App />
  </FlagBackendProvider>
);
```

If a partial object is provided and a requested key is missing, it will fallback to the provided default. That is,

```tsx
const backend = new StaticBackend<MyFlags>({
  features: {},
});

// ...

const SomeScreen = () => {
  const newThing = useFlag("features.useMyCoolNewThing", true);
  // => will always be `true`

  // ...
};
```

### `ComputedBackend<T>`

Similar to `StaticBackend` but if a function is used as a value, it will pass in the object `T` as an
argument. (Yes, this means you can end up with a stack overflow if you're not careful.) Useful when you need to have composite flags outside of the React render loop.

```tsx
import React from "react";
import ReactDOM from "react-dom";
import { ComputedBackend } from "flag";
import { FlagBackendProvider, MyFlags } from "./flags";
import { App } from "./app";

const backend = new ComputedBackend<MyFlags>({
  features: {
    useMyCoolNewThing: false,
  },
  config: {
    apiUrl: "https://example.com",
  },
  cool: 100,
  dude: 200,
  coolAndDude: (flags) => flags.cool + flags.dude,
  largeCoolAndDude: (flags) => flags.coolAndDude * 2,
});

const root = ReactDOM.createRoot(document.querySelector("#app"));

root.render(
  <FlagBackendProvider backend={backend}>
    <App />
  </FlagBackendProvider>
);
```

### `AlwaysBackend`

Given a partial mapping of `{ boolean: boolean; string: string; number: number; }` will always yield the mapping value for a given type. If a type is missing from the mapping, it will fallback to the default value given to `useFlag`. Useful for testing.

```tsx
import React from "react";
import ReactDOM from "react-dom";
import { AlwaysBackend } from "flag";
import { FlagBackendProvider } from "./flags";
import { App } from "./app";

const backend = new AlwaysBackend({
  boolean: false,
  string: "some string",
  number: 1000,
});

const root = ReactDOM.createRoot(document.querySelector("#app"));

root.render(
  <FlagBackendProvider backend={backend}>
    <App />
  </FlagBackendProvider>
);
```

### `NullBackend`

A backend that always returns the default value. Useful for testing.

```tsx
import React from "react";
import ReactDOM from "react-dom";
import { NullBackend } from "flag";
import { FlagBackendProvider } from "./flags";
import { App } from "./app";

const backend = new NullBackend();

const root = ReactDOM.createRoot(document.querySelector("#app"));

root.render(
  <FlagBackendProvider backend={backend}>
    <App />
  </FlagBackendProvider>
);
```

### Rolling your own with `AbstractBackend<T>`

You can roll your own backend by extending a class off of `AbstractBackend<T>`. You need only implement the `getSnapshot()` (and optionally `getServerSnapshot()`) method.

```tsx
import { AbstractBackend, Types } from "flag";

/**
 * `F` is the shape of your flags.
 */
export class MyBackend<F> extends AbstractBackend<F> {
  /**
   * `KP` is a valid key path (as an array).
   * `T` is the type of value associated the key path.
   */
  getSnapshot<KP extends Types.KeyPath<F>, T extends Types.GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): T {
    /**
     * `getSnapshot` must return `T`.
     */
    return defaultValue;
  }

  /**
   * OPTIONAL: you can override `getServerSnapshot` if you need different behavior for server rendering.
   * Defaults to `getSnapshot`.
   */
  override getServerSnapshot<KP extends Types.KeyPath<F>, T extends Types.GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): T {
    /**
     * Do something different than `getSnapshot`
     */
    return defaultValue;
  }
}
```

If you want your backend to work with React Suspense, you can create an [async ref object](https://github.com/garbles/flag/tree/master/packages/async-ref) by calling `this.createAsyncRef()` and using it in `getSnapshot()`.

```tsx
import { AbstractBackend, Types } from "flag";

export class MyBackend<F> extends AbstractBackend<F> {
  #data: Types.AsyncMutableRefObject<T>;

  constructor() {
    this.#data = this.createAsyncRef();

    fetch("/api-with-data")
      .then((res) => res.json())
      .then((data) => {
        this.#data.current = data;
      });
  }

  getSnapshot<KP extends Types.KeyPath<F>, T extends Types.GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): T {
    /**
     * Throws a promise if a current value has not yet been assigned.
     */
    const data = this.#data.current;

    return someGetterFn(data, keyPath);
  }
}
```

If your backend is asynchronous and you do not want to use suspense, you can imperatively call `this.notify()` in order to tell React to re-render.

```tsx
import { AbstractBackend, Types } from "flag";

export class MyBackend<F> extends AbstractBackend<F> {
  #data: T | null = null;

  constructor() {
    this.#data = this.createAsyncRef();

    fetch("/api-with-data")
      .then((res) => res.json())
      .then((data) => {
        this.#data = data;
        this.notify();
      });
  }

  getSnapshot<KP extends Types.KeyPath<F>, T extends Types.GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): T {
    if (this.#data === null) {
      return defaultValue;
    }

    const data = this.#data;

    return someGetterFn(data, keyPath);
  }
}
```

## Setting NODE_ENV

While in development, you should be sure to set `process.env.NODE_ENV` to `"development"` for useful warnings when possible. Tool kits like Remix, Next and CRA do this automatically for you.

## License

MPL-2.0
