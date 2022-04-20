import React from "react";
import { createFlags } from "../create-flags";
import { KeyPath, GetValueFromKeyPathString, KeyPathString } from "../types";

type Flags = {
  a: boolean;
  b: {
    c: {
      d: boolean;
      e: string;
    };
  };
  f: number;
};

type Keys = KeyPath<Flags>;
type StringKeys = KeyPathString<Flags>;

it("check key paths", () => {
  const a: Keys = ["a"];

  // @ts-expect-error
  const b: Keys = ["b"];
  // @ts-expect-error
  const c: Keys = ["b", "c"];

  const d: Keys = ["b", "c", "d"];
  const e: Keys = ["b", "c", "e"];
  const f: Keys = ["f"];
});

it("check key path string", () => {
  const a: StringKeys = "a";

  // @ts-expect-error
  const b: StringKeys = "b";
  // @ts-expect-error
  const c: StringKeys = "b.c";

  const d: StringKeys = "b.c.d";
  const e: StringKeys = "b.c.e";
  const f: StringKeys = "f";
});

it("gets type back from string key", () => {
  const a: GetValueFromKeyPathString<Flags, "a"> = true;
  const d: GetValueFromKeyPathString<Flags, "b.c.d"> = true;
  const e: GetValueFromKeyPathString<Flags, "b.c.e"> = "hello";

  // @ts-expect-error
  const f: GetValueFromKeyPathString<Flags, "f"> = "hello";

  // @ts-expect-error
  type Z = GetValueFromKeyPathString<Flags, "x.y.z">;
});

it("useFlag", () => {
  const { useFlag } = createFlags<Flags>();

  function App() {
    const a: boolean = useFlag("a", false);
    const aa: boolean = useFlag(["a"], false);

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

    const e: string = useFlag("b.c.e", "haha");

    useFlag("f", 123);

    return null;
  }
});

it("Flag", () => {
  const { Flag } = createFlags<Flags>();

  <Flag keyPath={["a"]} defaultValue={false} render={(a) => <div>{a === true}</div>} />;

  // @ts-expect-error
  <Flag keyPath={["a"]} defaultValue={false} render={(a) => <div>{a === "1"}</div>} />;

  // @ts-expect-error
  <Flag keyPath={["a"]} defaultValue={false} render={(a) => <div>{a === "1"}</div>} />;

  // @ts-expect-error
  <Flag keyPath={["b"]} render={(b) => null} />;

  // @ts-expect-error
  <Flag keyPath={["b"]} render={(b) => null} />;

  // @ts-expect-error
  <Flag keyPath={["b", "c"]} render={(c) => null} />;

  <Flag keyPath={["b", "c", "e"]} defaultValue={"1"} render={(d) => <div>{d === "haha"}</div>} />;

  // @ts-expect-error
  <Flag keyPath={["b", "c", "e"]} defaultValue={"2"} render={(d) => <div>{d === true}</div>} />;

  // @ts-expect-error
  <Flag keyPath={["b", "c", "e"]} defaultValue={false} render={(d) => <div>{d === "true"}</div>} />;
});
