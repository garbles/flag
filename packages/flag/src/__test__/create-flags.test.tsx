import React from "react";
import { act, render, screen } from "@testing-library/react";
import { createFlags } from "../create-flags";
import { AbstractBackend, AlwaysBackend, ComputedBackend, Backend, NullBackend, StaticBackend } from "../backends";

type Flags = {
  a: number;
  b: string;
  e: {
    f: {
      g: boolean;
    };
  };
};

const { useFlag, FlagBackendProvider } = createFlags<Flags>();

const AppWithoutContext = (props: { a: number; b: string; g: boolean }) => {
  const a = useFlag("a", props.a);
  const b = useFlag(["b"], props.b);
  const g = useFlag("e.f.g", props.g);

  return <div role="main">{JSON.stringify({ a, b, g })}</div>;
};

const App = (props: { backend: Backend<Flags>; defaults: { a: number; b: string; g: boolean } }) => {
  const defaults = props.defaults ?? {};

  return (
    <FlagBackendProvider backend={props.backend}>
      <AppWithoutContext {...defaults} />
    </FlagBackendProvider>
  );
};

const getData = () => JSON.parse(screen.getByRole("main").textContent || "");

const silenceConsole = () => {
  const spy = jest.spyOn(console, "error").mockImplementation(() => {});
  return () => spy.mockRestore();
};

test("when the background always returns the same thing", () => {
  const data = {
    a: 0,
    b: "goodbye",
    e: {
      f: {
        g: true,
      },
    },
  };

  render(<App backend={new StaticBackend(data)} defaults={{ a: 0, b: "", g: false }} />);

  expect(getData()).toEqual({ a: 0, b: "goodbye", g: true });
});

test("works with a backend that does nothing", () => {
  const defaults = { a: 1, b: "hello", g: false };

  render(<App backend={new NullBackend()} defaults={defaults} />);

  expect(getData()).toEqual(defaults);
});

test("throws without a context in development", () => {
  const restore = silenceConsole();

  const NODE_ENV = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";

  expect(() => render(<AppWithoutContext {...{ a: 2, b: "", g: false }} />)).toThrowError(
    new Error('Calling `useFlag("a", 2)` requires that the application is wrapped in a `<FlagBackendProvider />`')
  );

  process.env.NODE_ENV = NODE_ENV;

  restore();
});

test("does not throw without context in test mode", () => {
  const restore = silenceConsole();

  expect(() => render(<AppWithoutContext {...{ a: 2, b: "", g: false }} />)).not.toThrowError();

  restore();
});

test("throws when you don't provide a default value", () => {
  const restore = silenceConsole();

  expect(() =>
    render(
      <App
        backend={new NullBackend()}
        // @ts-expect-error
        defaults={{}}
      />
    )
  ).toThrowError(
    new Error('Calling `useFlag("a", undefined)` requires that you provide a default value that matches the type of the flag.')
  );

  restore();
});

test("throws when the flag won't be a scalar", () => {
  const restore = silenceConsole();

  class WhoopsieBackend extends AbstractBackend<Flags> {
    getSnapshot() {
      return { oof: 10 } as any;
    }
  }

  expect(() => render(<App backend={new WhoopsieBackend()} defaults={{ a: 3, b: "", g: false }} />)).toThrowError(
    new Error('Calling `useFlag("a", 3)` requires that the result is a boolean, number or string. Instead returned {"oof":10}.')
  );

  restore();
});

test("returns the default value if the return type doesn't match the default value type", () => {
  class WhoopsieBackend extends AbstractBackend<Flags> {
    getSnapshot() {
      return "whoopsie" as any;
    }
  }

  render(<App backend={new WhoopsieBackend()} defaults={{ a: 4, b: "", g: false }} />);

  expect(getData()).toEqual({ a: 4, b: "whoopsie", g: false });
});

test("suspends when using an async ref", async () => {
  class SomeAsyncBackend extends AbstractBackend<Flags> {
    flags = this.createAsyncRef<Flags>();

    getSnapshot(keyPath: string[]) {
      let result: any = this.flags.current;

      for (const key of keyPath) {
        result = result[key];
      }

      return result;
    }
  }

  const backend = new SomeAsyncBackend();

  render(
    <React.Suspense fallback={<div role="main">{'{ "fallback": true }'}</div>}>
      <App backend={backend} defaults={{ a: 4, b: "", g: false }} />
    </React.Suspense>
  );

  expect(getData()).toEqual({ fallback: true });

  await act(async () => {
    backend.flags.current = { a: 600, b: "async", e: { f: { g: true } } };

    /**
     * This is a hack to force the suspense to re-render
     * before the act finishes.
     */
    await new Promise((res) => setTimeout(res, 0));
  });

  expect(getData()).toEqual({ a: 600, b: "async", g: true });
});

test("can compute the value of a flag", async () => {
  let a = 2;

  const backend = new ComputedBackend<Flags>({
    a: () => a,
    b: "goodbye",
    e: {
      f: {
        g: (root) => root.a > 0 && root.b === "goodbye",
      },
    },
  });

  render(<App backend={backend} defaults={{ a: 4, b: "", g: false }} />);

  expect(getData()).toEqual({ a: 2, b: "goodbye", g: true });

  await act(async () => {
    a = 0;
    backend.notify();
    /**
     * This is a hack to force the suspense to re-render
     * before the act finishes.
     */
    await new Promise((res) => setTimeout(res, 0));
  });

  expect(getData()).toEqual({ a: 0, b: "goodbye", g: false });
});

test("can always return the same value", () => {
  const backend = new AlwaysBackend({
    boolean: true,
    number: 42,
    string: "hello",
  });

  render(<App backend={backend} defaults={{ a: 4, b: "", g: false }} />);

  expect(getData()).toEqual({ a: 42, b: "hello", g: true });
});

test("will fallback to defaults when an always value is not provided", () => {
  const backend = new AlwaysBackend({
    boolean: true,
  });

  render(<App backend={backend} defaults={{ a: 400, b: "default", g: false }} />);

  expect(getData()).toEqual({ a: 400, b: "default", g: true });
});
