import *  as React from 'react';
import * as PropTypes from 'prop-types';
import { deepComputed } from 'deep-computed';
import { Store, Unsubscribe } from 'redux';
import { FlagsProvider } from './flags-provider';
import { Flags, Value, ResolvedFlags } from './types';

export interface State {
  flags: Flags;
}

export class ConnectedFlagsProvider extends React.Component<{}, State> {
  static contextTypes = {
    store: PropTypes.object,
  };

  store: Store<State>;
  unsubscribe: Unsubscribe;

  constructor() {
    super();

    this.state = {
      flags: {}
    };
  }

  componentWillMount() {
    this.store = this.context.store as Store<State>;

    const { flags } = this.store.getState();
    this.setState({ flags });

    this.unsubscribe = this.store.subscribe(() => {
      const { flags } = this.store.getState();
      this.setState({ flags });
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const { children } = this.props;
    const { flags } = this.state;

    return (
      <FlagsProvider flags={flags}>
        {children}
      </FlagsProvider>
    );
  }
}