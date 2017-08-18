import * as React from 'react';
import { key } from './key';
import { ResolvedFlags } from './types';

// see https://github.com/mridgway/hoist-non-react-statics/pull/34
// and https://github.com/mridgway/hoist-non-react-statics/pull/38
const hoistStatics: <Own, Custom>(
  TargetComponent: React.ComponentType<Own>,
  SourceComponent: React.ComponentType<Own & Custom>,
  customStatic?: any,
) => React.ComponentType<Own> = require('hoist-non-react-statics');

export function withFlags<P, F = ResolvedFlags>(
  Component: React.ComponentType<{ flags: F } & P>,
): React.ComponentType<P> {
  const Wrapper: React.ComponentType<P> = (props: P, context: { [flags in typeof key]: F }) =>
    <Component {...props} flags={context[key]} />;

  Wrapper.displayName = `withFlags(${Component.displayName || Component.name})`;
  Wrapper.contextTypes = { [key]: () => null };

  return hoistStatics<P, { flags: F }>(Wrapper, Component);
}
