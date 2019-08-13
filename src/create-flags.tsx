import React, { useContext, useMemo } from "react";
import { deepComputed, Computable } from "deep-computed";
import { KeyPath, KeyPathValue } from "useful-types";
import { isObject } from "./utils";

export type ProviderProps<T> = {
  flags: Computable<T>;
};

type RenderConsumer<T> = {
  name: KeyPath<T>;
  render(flags: T): React.ReactNode;
  fallbackRender?(flags: T): React.ReactNode;
};

type ChildConsumer<T> = {
  name: KeyPath<T>;
  children: any;
  fallbackRender?(flags: T): React.ReactNode;
};

type ComponentConsumer<T> = {
  name: KeyPath<T>;
  component: React.ComponentType<{ flags: T }>;
  fallbackComponent?: React.ComponentType<{ flags: T }>;
};

export type ConsumerProps<T> =
  | RenderConsumer<T>
  | ChildConsumer<T>
  | ComponentConsumer<T>;

export type CreateFlags<T> = {
  FlagsProvider: React.ComponentType<ProviderProps<T>>;
  Flag: React.ComponentType<ConsumerProps<T>>;
  useFlag<KP extends KeyPath<T>>(keyPath: KP): KeyPathValue<T, KP>;
  useFlags(): T;
};

export function createFlags<T>(): CreateFlags<T> {
  const Context = React.createContext<T | null>(null) as React.Context<T>;
  Context.displayName = "Flag";

  const FlagsProvider: React.SFC<ProviderProps<T>> = ({ flags, children }) => {
    const value = useMemo(() => deepComputed(flags), [flags])
    return (
      <Context.Provider value={value}>{children}</Context.Provider>
    );
  }

  const useFlags = () => {
    const value = useContext(Context);
    if (value == null) {
      console.warn('<Flag /> is expected to have a <FlagsProvider /> ancestor')
    }

    return value;
  }

  const useFlag = <KP extends KeyPath<T>>(keyPath: KP): KeyPathValue<T, KP> => {
    const flags = useFlags();

    // handle the case in which there is no context from a FlagsProvider
    if (flags == null) {
      return undefined as any;
    }

    let result: any = flags;

    for (let next of keyPath as string[]) {
      /**
       * This trap is unreachable in TypeScript.
       */
      if (isObject(result) && !(next in result)) {
        return undefined as any;
      }

      result = result[next];
    }

    return result;
  };

  function Flag(props: ConsumerProps<T>) {
    const flags = useContext(Context);
    const flag = useFlag(props.name);
    const isEnabled = Boolean(flag);

    if (isEnabled && "children" in props) {
      return props.children;
    }

    if (isEnabled && "render" in props) {
      return props.render(flags);
    }

    if (isEnabled && "component" in props) {
      const Component = props.component;
      return <Component flags={flags} />;
    }

    if (!isEnabled && "fallbackRender" in props && props.fallbackRender) {
      return props.fallbackRender(flags);
    }

    if (!isEnabled && "fallbackComponent" in props && props.fallbackComponent) {
      const Component = props.fallbackComponent;
      return <Component flags={flags} />;
    }

    return null;
  }

  return {
    FlagsProvider,
    Flag,
    useFlag,
    useFlags
  };
}

export default createFlags;
