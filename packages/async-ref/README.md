# A tiny bridge between React.useSyncExternalStore and React Suspense

This library allows you to create asynchronous ref objects (`AsyncMutableRefObject<T>`). Similar to the sync ref objects you'd get back from `useRef<T>()`, except if the current value of the ref (`ref.current`) is not set, it will throw a `Promise` instead of returning nothing.

`React.Suspense` works by catching promises—thrown as part of rendering a component—and waiting for them to resolve before re-rendering again. Assigning a value to `ref.current` will trigger the suspense boundary to re-render. (You can read more about how Suspense works in [the React docs](https://17.reactjs.org/docs/concurrent-mode-suspense.html).)

Because `ref.current` will either return a value `T` or _throw_ a promise, the only thing it can return is a `T` and therefore implements the `MutableRefObject<T>` interface. That is,

```ts
type MutableRefObject<T> = {
  current: T;
};

class AsyncMutableRefObject<T> implements MutableRefObject<T> {
  // ...
}
```

[React v18 introduces the experimental hook](https://github.com/reactwg/react-18/discussions/86) `useSyncExternalStore` which provides a convenient way to hook into synchronous external data sources.

```ts
declare function useSyncExternalStore<Snapshot>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => Snapshot,
  getServerSnapshot?: () => Snapshot
): Snapshot;
```

`AsyncMutableRefObject<T>` makes it easy for a typed _asynchronous_ external data source to work with React Suspense in a typed _synchornous_ way because we can implement `getSnapshot` to just always return the result of `ref.current`.

## Example

A sample implementation of what you might do is the following where we define a data source that implements `getSnapshot` and `subscribe` functions.

```ts
type Subscriber = () => void;

class AsyncDataStore<T> {
  subscribers = new Set<Subscriber>();

  ref = createAsyncRef<T>(() => this.notify());

  getSnapshot = (): T => {
    return this.ref.current;
  };

  subscribe = (sub: Subscriber): Subscriber => {
    this.subscribers.add(sub);
    return () => this.subscribers.delete(sub);
  };

  notify() {
    this.subscribers.forEach((sub) => sub());
  }

  doSomething() {
    fetch(/*...*/)
      .then((res) => res.json())
      .then((data) => {
        // setting the current value will notify all subscribers.
        ref.current = data;
      });
  }
}
```

As long as `getSnapshot()` is called from within the React-render cycle, the `Promise` it (might) throw will be caught by Suspense.

```ts
const store = new AsyncDataStore<User>();

// ...

const user = React.useSyncExternalStore(store.subscribe, store.getSnapshot);
// => throws Promise from the ref,
//    which is caught by a Suspense boundary
//    that waits for it to resolve.

// ...

store.doSomething();
// => after some time, the current value is set.

// ...

const user = React.useSyncExternalStore(store.subscribe, store.getSnapshot);
// => returns a User
```

## Use

`async-ref` exports a single function `createAsyncRef<T>()` which accepts an optional notifier function and returns an `AsyncMutableRefObject<T>`.

```ts
declare function createAsyncRef<T>(notifier?: () => void): AsyncMutableRefObject<T>;
```

```ts
import { createAsyncRef } from "async-ref";

const ref = createAsyncRef<User>();

const currentValue: User = ref.current;
// => throws a Promise

ref.current = { id: "12345", name: "Gabe" /* etc */ };

const currentValue: User = ref.current;
// => returns { id: '12345', name: 'Gabe', /* etc */ }
```

Just like a `MutableRefObject`, the current value can be set any number of times.

```ts
import { createAsyncRef } from "async-ref";

const ref = createAsyncRef<number>();

ref.current = 12;
ref.current = 400;

const currentValue = ref.current;
// => 400
```

Alternatively, `AsyncMutableRefObject<T>` exposes `resolve`/`reject` functions for a more familiar Promise-type feel.

```ts
import { createAsyncRef } from "async-ref";

const ref = createAsyncRef<number>();

ref.reject(new Error("uh oh!"));

ref.current;
// => throws an Error("uh oh!")
```

If you provide a notifier function, it will be called every time the state of the ref changes.

```ts
import { createAsyncRef } from "async-ref";

const listener = jest.fn();

const ref = createAsyncRef<number>(listener);

ref.current = 12;
ref.current = 400;

expect(listener).toHaveBeenCallTimes(2);
```

If you want to prevent the ref from changing its state, you can freeze it.

```ts
const ref = createAsyncRef<number>(listener);

ref.current = 12;
ref.freeze();

ref.current = 400;

expect(ref.current).toEqual(12);
```

## Safely getting the value without Suspense

`AsyncMutableRefObject<T>` also implements `PromiseLike<T>` which means that you can dereference the current value by awaiting on it. (If a current value is already set, it will immediately resolve.) This is safer than calling `ref.current` because it will wait for a current value to be set before resolving the promise, but of course does not work inside of a React component because it is asynchronous.

```ts
import { createAsyncRef } from "async-ref";

const ref = createAsyncRef<User>(listener);

// ...

const user = await ref;
```

## Installing

```
yarn add async-ref
```
