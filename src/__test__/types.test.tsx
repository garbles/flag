import React from "react";
import { KeyPaths, ShallowKeys } from "../types";
import { createFlags } from "../create-flags";

type Something = {
  a: boolean;
  b: {
    c: {
      d: boolean;
      e: string;
    };
  };
  f: number;
};

type Keys = KeyPaths<Something>;
type Shallow = ShallowKeys<Something>;

it("check key paths", () => {
  const a: Keys = ["a"];

  // @ts-expect-error
  const b: Keys = ["b"];
  // @ts-expect-error
  const c: Keys = ["b", "c"];

  const d: Keys = ["b", "c", "d"];
  const e: Keys = ["b", "c", "d"];
  const f: Keys = ["f"];
});

it("check shallow keys", () => {
  const a: Shallow = "a";

  // @ts-expect-error
  const b: Shallow = "b";

  const f: Shallow = "f";
});

it("useFlag", () => {
  const { useFlag } = createFlags<Something>();

  function App() {
    useFlag("a");

    useFlag(["a"]);

    useFlag(["a"], false);

    // @ts-expect-error
    useFlag(["a"], "haha");

    // @ts-expect-error
    useFlag("b");

    // @ts-expect-error
    useFlag(["b"]);

    // @ts-expect-error
    useFlag(["b", "c"]);

    // @ts-expect-error
    useFlag(["b", "c"]);

    // @ts-expect-error
    useFlag(["b", "c", "e"], true);

    useFlag(["b", "c", "e"], "haha");

    useFlag("f", 123);

    return null;
  }
});

it("Flag", () => {
  const { Flag } = createFlags<Something>();

  <Flag keyPath={"a"} render={(a) => <div>{a === true}</div>} />;

  // @ts-expect-error
  <Flag keyPath={"a"} render={(a) => <div>{a === "1"}</div>} />;

  // @ts-expect-error
  <Flag keyPath={["a"]} render={(a) => <div>{a === "1"}</div>} />;

  // @ts-expect-error
  <Flag keyPath={"b"} render={(b) => null} />;

  // @ts-expect-error
  <Flag keyPath={["b"]} render={(b) => null} />;

  // @ts-expect-error
  <Flag keyPath={["b", "c"]} render={(c) => null} />;

  <Flag keyPath={["b", "c", "e"]} render={(d) => <div>{d === "haha"}</div>} />;

  // @ts-expect-error
  <Flag keyPath={["b", "c", "e"]} render={(d) => <div>{d === true}</div>} />;
});
