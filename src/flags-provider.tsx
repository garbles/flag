import *  as React from 'react';
import * as PropTypes from 'prop-types';
import { deepComputed } from 'deep-computed';
import { Flags, Value, ResolvedFlags } from './types';

export interface Props {
  flags: Flags;
  children: React.ReactNode
}

export interface State {
  computed: ResolvedFlags;
}

export class FlagsProvider extends React.PureComponent<Props, State> {
  static childContextTypes = {
    __flags: PropTypes.object.isRequired
  };

  getChildContext() {
    return {
      __flags: this.state.computed
    };
  }

  constructor(props: Props) {
    super();

    this.state = {
      computed: deepComputed<Flags, ResolvedFlags>(props.flags),
    };
  }

  componentWillReceiveProps(props: Props) {
    this.setState({
      computed: deepComputed<Flags, ResolvedFlags>(props.flags)
    });
  }

  render() {
    const { children } = this.props;
    return children ? React.Children.only(children) : null;
  }
}