import React from "react";
import { render, screen } from "@testing-library/react";
import { createFlags } from "../create-flags";
import { AbstractBackend } from "../backends";

type Flags = {
  a: number;
  b: string;
  c: boolean;
  d: boolean;
  e: {
    f: {
      g: boolean;
    };
  };
  h: boolean;
  i: number;
};

const { useFlag, FlagsProvider } = createFlags<Flags>();

const AppWithoutContext = (props: { a: number; b: string; g: boolean }) => {
  const a = useFlag("a", props.a);
  const b = useFlag(["b"], props.b);
  const g = useFlag(["e", "f", "g"], props.g);

  return <div role="main">{JSON.stringify({ a, b, g })}</div>;
};

const App = (props: { backend: AbstractBackend<Flags>; defaults: { a: number; b: string; g: boolean } }) => {
  const defaults = props.defaults ?? {};

  return (
    <FlagsProvider backend={props.backend}>
      <AppWithoutContext {...defaults} />
    </FlagsProvider>
  );
};

const getData = () => JSON.parse(screen.getByRole("main").textContent || "");

const silenceConsole = () => {
  const spy = jest.spyOn(console, "error").mockImplementation(() => {});
  return () => spy.mockRestore();
};

test("when the background always returns the same thing", () => {
  const data: any = {
    a: 0,
    b: "goodbye",
    e: {
      f: {
        g: true,
      },
    },
  };

  const staticBackground = {
    name: "static",
    getSnapshot(keys: any) {
      const [first, ...rest] = keys;
      let result: any = data[first];

      for (const key of rest) {
        result = result[key];
      }

      return result;
    },
  };

  // @ts-expect-error
  render(<App backend={staticBackground} defaults={{ a: 0, b: "", g: false }} />);

  expect(getData()).toEqual({ a: 0, b: "goodbye", g: true });
});

test("works with a backend that does nothing", () => {
  const defaults = { a: 1, b: "hello", g: false };

  render(<App backend={new NullBackend()} defaults={defaults} />);

  expect(getData()).toEqual(defaults);
});

test("throws with a context", () => {
  const restore = silenceConsole();

  expect(() => render(<AppWithoutContext {...{ a: 2, b: "", g: false }} />)).toThrowError(
    new Error('Calling `useFlag("a", 2)` requires that the application is wrapped in a `<FlagsProvider />`')
  );

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

  class WhoopsieBackground extends AbstractBackend<Flags> {
    name = "whoopsie";
    getSnapshot() {
      return { oof: 10 } as any;
    }
  }

  expect(() => render(<App backend={new WhoopsieBackground()} defaults={{ a: 3, b: "", g: false }} />)).toThrowError(
    new Error('Calling `useFlag("a", 3)` requires that the result is a boolean, number or string. Instead returned {"oof":10}.')
  );

  restore();
});

test("returns the default value if the return type doesn't match the default value type", () => {
  class WhoopsieBackground extends AbstractBackend<Flags> {
    name = "whoopsie";
    getSnapshot() {
      return "whoopsie" as any;
    }
  }

  render(<App backend={new WhoopsieBackground()} defaults={{ a: 4, b: "", g: false }} />);

  expect(getData()).toEqual({ a: 4, b: "whoopsie", g: false });
});
