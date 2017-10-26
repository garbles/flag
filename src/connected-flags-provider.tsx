import { deepComputed } from 'deep-computed';
import * as React from 'react';
import { Store, Unsubscribe } from 'redux';
import { FlagsProvider } from './flags-provider';
import { Flags, ResolvedFlags, Value } from './types';

export interface ConnectedFlagsProviderState {
  flags: Flags;
}

export class ConnectedFlagsProvider extends React.Component<{}, ConnectedFlagsProviderState> {
  public static contextTypes = { store: () => null };

  private store: Store<ConnectedFlagsProviderState>;
  private unsubscribe: Unsubscribe;

  constructor(props: {}) {
    super(props);

    this.state = {
      flags: {},
    };
  }

  public componentWillMount() {
    this.store = this.context.store as Store<ConnectedFlagsProviderState>;
    this.setState({ flags: this.store.getState().flags });

    this.unsubscribe = this.store.subscribe(() => {
      this.setState({ flags: this.store.getState().flags });
    });
  }

  public componentWillUnmount() {
    this.unsubscribe();
  }

  public render() {
    const { children } = this.props;
    const { flags } = this.state;

    return <FlagsProvider flags={flags}>{children}</FlagsProvider>;
  }
}
