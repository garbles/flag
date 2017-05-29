import { deepComputed } from "deep-computed";
import * as PropTypes from "prop-types";
import * as React from "react";
import { IFlags, IResolvedFlags, Value } from "./types";

export interface IProps {
  flags: IFlags;
  children: React.ReactNode;
}

export interface IState {
  computed: IResolvedFlags;
}

export class FlagsProvider extends React.PureComponent<IProps, IState> {
  public static childContextTypes = {
    __flags: PropTypes.object.isRequired,
  };

  constructor(props: IProps) {
    super();

    this.state = {
      computed: deepComputed<IFlags, IResolvedFlags>(props.flags),
    };
  }

  public getChildContext() {
    return {
      __flags: this.state.computed,
    };
  }

  public componentWillReceiveProps(props: IProps) {
    this.setState({
      computed: deepComputed<IFlags, IResolvedFlags>(props.flags),
    });
  }

  public render() {
    const { children } = this.props;
    return children ? React.Children.only(children) : null;
  }
}
