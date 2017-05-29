import *  as React from 'react';
import * as PropTypes from 'prop-types';
import { Flags, Value } from './types';

export type Renderer = (value: Value | void) => React.ReactElement<any>;

export interface Props {
  name: string;
  render?: Renderer;
  fallbackRender?: Renderer;
}

function getFlag(flags: Flags, keyPath: string): Value | void {
  const [head, ...tail] = keyPath.split('.');
  let result: Value = (flags as Flags)[head];

  for (let key of tail) {
    result = (result as Flags)[key];

    if (result === undefined || result === null) {
      return;
    }
  }

  return result;
}

export class Flag extends React.Component<Props, {}> {
  static contextTypes = {
    __flags: PropTypes.object.isRequired
  };

  render() {
    const { fallbackRender, name, render } = this.props;
    const value = getFlag(this.context.__flags, name);
    const renderer = (Boolean(value) ? render : fallbackRender) || null;

    return (typeof renderer === 'function') ? renderer(value) : null;
  }
}