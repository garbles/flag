import { createAsyncRef } from "../async-ref";

test("throws a promise when unresolved", () => {
  expect.assertions(1);

  const ref = createAsyncRef<number>();

  try {
    ref.current;
  } catch (err) {
    expect(err).toBeInstanceOf(Promise);
  }
});

test("returns the resolved value", () => {
  const ref = createAsyncRef<number>();

  ref.resolve(42);

  expect(ref.current).toBe(42);
});

test("resets the resolved value", () => {
  const ref = createAsyncRef<number>();

  ref.resolve(42);
  ref.resolve(43);

  expect(ref.current).toBe(43);
});

test("rejects the value after it is resolved", () => {
  expect.assertions(1);

  const ref = createAsyncRef<number>();

  ref.resolve(42);
  ref.reject(new Error("foo"));

  try {
    ref.current;
  } catch (err) {
    expect(err).toBeInstanceOf(Error);
  }
});

test("resolves the value after it is rejected", () => {
  const ref = createAsyncRef<number>();

  try {
    ref.current;
  } catch (err) {
    /**
     * This is a hack to make sure that the promise so not throw
     * when it is rejected internally.
     */
    (err as Promise<void>).catch(() => {});
  }

  ref.reject(new Error("foo"));
  ref.resolve(42);

  expect(ref.current).toBe(42);
});

test("notifies an observer when the value is resolved", () => {
  const notifier = jest.fn();
  const ref = createAsyncRef<number>(notifier);

  ref.resolve(42);

  expect(notifier).toHaveBeenCalledTimes(1);
});

test("notifies an observer when the value is rejected", () => {
  const notifier = jest.fn();
  const ref = createAsyncRef<number>(notifier);

  try {
    ref.current;
  } catch (err) {
    /**
     * This is a hack to make sure that the promise so not throw
     * when it is rejected internally.
     */
    (err as Promise<void>).catch(() => {});
  }

  ref.reject(new Error("foo"));

  expect(notifier).toHaveBeenCalledTimes(1);
});

test("notifies an observer when the value is reset", () => {
  const notifier = jest.fn();
  const ref = createAsyncRef<number>(notifier);

  ref.resolve(42);
  ref.resolve(43);
  ref.reject(new Error("foo"));

  expect(notifier).toHaveBeenCalledTimes(3);
});

test("will throw an error if reset to an error and then get the current value", () => {
  const ref = createAsyncRef<number>();

  ref.resolve(42);
  ref.reject(new Error("foo"));

  expect(() => ref.current).toThrowError("foo");
});

test("can safely eject as a promise", () => {
  const ref = createAsyncRef<number>();

  const prom = ref.then();

  expect(prom).resolves.toEqual(1000);

  ref.current = 1000;
});

test("can resolve correctly if called", async () => {
  expect.assertions(2);

  const ref = createAsyncRef<number>();

  try {
    ref.reject(new Error("uh oh"));
    await ref;
  } catch (err) {
    expect(err).toEqual(new Error("uh oh"));
  }

  ref.current = 1000;

  expect(ref).resolves.toEqual(1000);
});

test("freezes its state", () => {
  const ref = createAsyncRef<number>();

  expect(ref.isFrozen()).toEqual(false);

  ref.current = 12;
  ref.freeze();

  ref.current = 400;

  expect(ref.isFrozen()).toEqual(true);
  expect(ref.current).toEqual(12);
});
