import * as React from 'react';
import { key } from './key';
import { Flags, FlagChildProps, Value, Renderer } from './types';

const get = require('lodash/get')
export interface FlagProps {
  name: string;
  component?: React.ComponentType<FlagChildProps<any>>;
  fallbackComponent?: React.ComponentType<FlagChildProps<any>>;
  render?: Renderer;
  fallbackRender?: Renderer;
  [key: string]: any;
}

function getFlag(flags: Flags, keyPath: string): Value | void {
  return get(flags, keyPath, false);
}

function resolve(
  props: FlagChildProps<any>,
  component?: React.ComponentType<FlagChildProps<any>>,
  render?: Renderer,
): React.ReactElement<any> | null {
  if (component) {
    return React.createElement(component as React.ComponentClass<FlagChildProps<any>>, props);
  }

  if (render) {
    return render(props) as React.ReactElement<any> | null;
  }

  return null;
}

export class Flag extends React.Component<FlagProps, {}> {
  public static contextTypes = { [key]: () => null };

  public render() {
    const { name, component, render, fallbackComponent, fallbackRender, ...rest } = this.props;
    const value = getFlag(this.context[key], name);
    const isEnabled = Boolean(value);

    const props: FlagChildProps<typeof rest, { [key: string]: typeof value }> = {
      ...rest,
      flags: { [name]: value },
    };

    if (isEnabled && props.children) {
      return props.children;
    }

    if (isEnabled) {
      return resolve(props, component, render) || null;
    }

    return resolve(props, fallbackComponent, fallbackRender) || null;
  }
}
