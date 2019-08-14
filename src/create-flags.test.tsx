import { mount, render } from "enzyme";
import * as React from "react";
import { createFlags, NO_CONTEXT_OR_DEFAULTS_ERROR } from "./create-flags";
import deepComputed, { Computable } from "deep-computed";

type Flags = {
  a: boolean;
  b: boolean;
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

const flags: Computable<Flags> = {
  a: true,
  b: true,
  c: f => f.a && true,
  d: f => f.b && f.c,
  e: {
    f: {
      g: f => f.d
    }
  },
  h: false,
  i: 123
};

const True = () => <noscript>T</noscript>;
const False = () => <noscript>F</noscript>;

describe("FlagsProvider && Flag", () => {
  const { FlagsProvider, Flag } = createFlags<Flags>();

  it("accepts uncomputed flags as props", () => {
    let instance = mount(
      <FlagsProvider flags={flags}>
        <div>
          <Flag
            name={["e", "f", "g"]}
            render={() => <True />}
            fallbackRender={() => <False />}
          />
        </div>
      </FlagsProvider>
    );

    expect(instance.find(`True`).length).toEqual(1);
    expect(instance.find(`False`).length).toEqual(0);

    const otherFlags: Computable<Flags> = {
      a: true,
      b: false,
      c: f => f.a && true,
      d: f => f.b && f.c,
      e: {
        f: {
          g: f => f.d
        }
      },
      h: false,
      i: 12
    };

    instance = mount(
      <FlagsProvider flags={otherFlags}>
        <div>
          <Flag
            name={["e", "f", "g"]}
            render={() => <True />}
            fallbackRender={() => <False />}
          />
        </div>
      </FlagsProvider>
    );

    expect(instance.find(`True`).length).toEqual(0);
    expect(instance.find(`False`).length).toEqual(1);
  });

  it("passes flags and other props to the render function", () => {
    expect.assertions(2);

    mount(
      <FlagsProvider flags={flags}>
        <div>
          <Flag
            name={["e", "f", "g"]}
            render={flags => {
              expect(flags).toBeDefined();
              expect(flags.e.f.g).toEqual(true);
              return null;
            }}
          />
        </div>
      </FlagsProvider>
    );
  });

  it("can render with a component", () => {
    expect.assertions(1);

    function MyComponent(props: { flags: Flags }) {
      expect(props.flags.a).toEqual(true);
      return null;
    }

    function MyFallbackComponent(props: { flags: Flags }) {
      expect(true).toEqual(true);
      expect(true).toEqual(true);
      return null;
    }

    mount(
      <FlagsProvider flags={flags}>
        <Flag
          name={["a"]}
          component={MyComponent}
          fallbackComponent={MyFallbackComponent}
        />
      </FlagsProvider>
    );
  });

  it("can fallback to a component", () => {
    expect.assertions(1);

    function MyComponent(props: { flags: Flags }) {
      expect(true).toEqual(true);
      expect(true).toEqual(true);
      return null;
    }

    function MyFallbackComponent(props: { flags: Flags }) {
      expect(props.flags.h).toEqual(false);
      return null;
    }

    mount(
      <FlagsProvider flags={flags}>
        <Flag
          name={["h"]}
          component={MyComponent}
          fallbackComponent={MyFallbackComponent}
        />
      </FlagsProvider>
    );
  });

  it("can render children if they are provided present and flag is truthy", () => {
    expect.assertions(4);

    function MyComponent() {
      expect(true).toEqual(true);
      return null;
    }

    mount(
      <FlagsProvider flags={flags}>
        <div>
          <Flag name={["a"]}>
            <MyComponent />
          </Flag>
          <Flag name={["b"]}>
            <MyComponent />
          </Flag>
          <Flag name={["c"]}>
            <MyComponent />
          </Flag>
          <Flag name={["d"]}>
            <MyComponent />
          </Flag>
          <Flag name={["h"]}>
            {/* Add 5th to show that it won't hit this branch */}
            <MyComponent />
          </Flag>
        </div>
      </FlagsProvider>
    );
  });
});

describe("useFlag/useFlags", () => {
  const { FlagsProvider, useFlag, useFlags } = createFlags<Flags>();

  it("fetches a flag from the context", () => {
    expect.assertions(4);

    const MyComponent = () => {
      const flagA = useFlag(["a"]);
      const flagH = useFlag(["h"]);
      const flagI = useFlag(["i"]);
      const next = useFlags();

      expect(flagA).toEqual(true);
      expect(flagH).toEqual(false);
      expect(flagI).toEqual(123);
      expect(next).toEqual(deepComputed(flags));

      return null;
    };

    mount(
      <FlagsProvider flags={flags}>
        <MyComponent />
      </FlagsProvider>
    );
  });
});

describe("without using FlagsProvider", () => {
  const err = new Error(NO_CONTEXT_OR_DEFAULTS_ERROR);

  describe("without defaults", () => {
    const { Flag, useFlag, useFlags } = createFlags<Flags>();

    test("Flag throws", () => {
      function MyComponent() {
        return null;
      }

      expect(() =>
        render(
          <Flag name={["a"]}>
            <MyComponent />
          </Flag>
        )
      ).toThrowError(err);
    });

    test("useFlag throws without a default value", () => {
      function MyComponent() {
        const value = useFlag(["a"]);
        return null;
      }

      expect(() => render(<MyComponent />)).toThrowError(err);
    });

    test("useFlag renders with a default value", () => {
      function MyComponent() {
        const value = useFlag(["a"], false);
        return null;
      }

      expect(() => render(<MyComponent />)).not.toThrowError(err);
    });

    test("useFlags throws", () => {
      function MyComponent() {
        const value = useFlags();
        return null;
      }

      expect(() => render(<MyComponent />)).toThrowError(err);
    });
  });

  describe("with defaults", () => {
    const defaultFlags: Flags = {
      a: false,
      b: false,
      c: false,
      d: false,
      e: {
        f: {
          g: false
        }
      },
      h: false,
      i: 12
    };

    const { Flag, useFlag, useFlags } = createFlags<Flags>(defaultFlags);

    test("Flag renders default", () => {
      function MyComponent() {
        return null;
      }

      expect(() =>
        render(
          <Flag name={["a"]}>
            <MyComponent />
          </Flag>
        )
      ).not.toThrowError(err);
    });

    test("useFlag renders defaults", () => {
      function MyComponent() {
        const value = useFlag(["a"]);
        return null;
      }

      expect(() => render(<MyComponent />)).not.toThrowError(err);
    });

    test("useFlag renders defaults but ignores second argument", () => {
      expect.assertions(2);

      function MyComponent() {
        const value = useFlag(["i"], 34);

        expect(value).toEqual(defaultFlags.i);

        return null;
      }

      expect(() => render(<MyComponent />)).not.toThrowError(err);
    });

    test("useFlags renders defaults", () => {
      expect.assertions(2);

      function MyComponent() {
        const value = useFlags();

        expect(value).toEqual(defaultFlags);

        return null;
      }

      expect(() => render(<MyComponent />)).not.toThrowError(err);
    });
  });
});
