import { deepComputed } from 'deep-computed';
import * as React from 'react';
import { Flags, ResolvedFlags, Value } from './types';
import { key } from './key';

export interface FlagProviderProps {
  flags: Flags;
  children: React.ReactNode;
}

export interface FlagProviderState {
  computed: ResolvedFlags;
}

export class FlagsProvider extends React.PureComponent<FlagProviderProps, FlagProviderState> {
  public static childContextTypes = { [key]: () => null };

  constructor(props: FlagProviderProps) {
    super(props);

    this.state = {
      computed: deepComputed<Flags, ResolvedFlags>(props.flags),
    };
  }

  public componentWillReceiveProps(props: FlagProviderProps) {
    this.setState({
      computed: deepComputed<Flags, ResolvedFlags>(props.flags),
    });
  }

  public getChildContext() {
    return {
      [key]: this.state.computed,
    };
  }

  public render(): any {
    const { children } = this.props;
    return children ? React.Children.only(children) : null;
  }
}
