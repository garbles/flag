import { render } from "@testing-library/react";
import { createFlags } from "../create-flags";

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

test("mounts", () => {
  const { useFlag, FlagsProvider } = createFlags<Flags>();

  const App = () => {
    const b = useFlag(["b"]);
    const g = useFlag(["e", "f", "g"]);
  };
});
