import * as PropTypes from "prop-types";
import * as React from "react";
import { IFlags, Value } from "./types";

export type Renderer = (value: Value | void) => React.ReactElement<any>;

export interface IProps {
  name: string;
  render?: Renderer;
  fallbackRender?: Renderer;
}

function getFlag(flags: IFlags, keyPath: string): Value | void {
  const [head, ...tail] = keyPath.split(".");
  let result: Value = (flags as IFlags)[head];

  for (const key of tail) {
    result = (result as IFlags)[key];

    if (result === undefined || result === null) {
      return;
    }
  }

  return result;
}

export class Flag extends React.Component<IProps, {}> {
  public static contextTypes = {
    __flags: PropTypes.object.isRequired,
  };

  public render() {
    const { fallbackRender, name, render } = this.props;
    const value = getFlag(this.context.__flags, name);
    const renderer = (Boolean(value) ? render : fallbackRender) || null;

    return (typeof renderer === "function") ? renderer(value) : null;
  }
}
