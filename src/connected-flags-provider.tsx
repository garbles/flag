import { deepComputed } from "deep-computed";
import * as PropTypes from "prop-types";
import * as React from "react";
import { Store, Unsubscribe } from "redux";
import { FlagsProvider } from "./flags-provider";
import { IFlags, IResolvedFlags, Value } from "./types";

export interface IState {
  flags: IFlags;
}

export class ConnectedFlagsProvider extends React.Component<{}, IState> {
  public static contextTypes = {
    store: PropTypes.object,
  };

  private store: Store<IState>;
  private unsubscribe: Unsubscribe;

  constructor() {
    super();

    this.state = {
      flags: {},
    };
  }

  public componentWillMount() {
    this.store = this.context.store as Store<IState>;
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

    return (
      <FlagsProvider flags={flags}>
        {children}
      </FlagsProvider>
    );
  }
}
