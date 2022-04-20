# Flag

:caution: v5 is a work in progress and is not yet published. :caution:

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

### FlagBackendProvider

_Returned as part of `createFlags<T>()`._

This React component provides a `Backend<T>` (see below) as a data source for `Flag` and `useFlag`.

| Props      | Type               | Required | Description            |
| ---------- | ------------------ | -------- | ---------------------- |
| `backend`  | `Types.Backend<T>` | `true`   | All pre-computed flags |
| `children` | `ReactNode`        | `true`   | React children         |

```tsx
// index.tsx

import { NullBackend } from "flag";
import { MyApplication } from "./app";
import { FlagBackendProvider } from "./flags";

const backend = new NullBackend();

const instance = (
  <FlagBackendProvider backend={backend}>
    <MyApplication />
  </FlagBackendProvider>
);

React.render(instance, document.querySelector("#app"));
```

### useFlag

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

### Flag

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

## Setting NODE_ENV

## License

MPL-2.0
