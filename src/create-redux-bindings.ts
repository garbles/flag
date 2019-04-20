import { AnyAction, Reducer } from "redux";
import merge from "lodash/merge";
import { Computable } from "deep-computed";
import { ProviderProps } from "./create-flags";
import { connect } from "react-redux";
import { isObject } from "./utils";

type SetFlagsAction<T> = {
  type: `@@FLAG/SET_FLAGS`;
  payload: Computable<Partial<T>>;
};

const MERGE_FLAGS_ACTION_TYPE = `@@FLAG/SET_FLAGS`;

function isSetFlagsAction<T>(obj: any): obj is SetFlagsAction<T> {
  return (
    isObject(obj) &&
    obj.type === MERGE_FLAGS_ACTION_TYPE &&
    isObject(obj.payload)
  );
}

const mapStateToProps = <T>(state: ProviderProps<T>): ProviderProps<T> => ({
  flags: state.flags
});

export type CreateReduxBindings<T> = {
  setFlagsAction(payload: Computable<Partial<T>>): SetFlagsAction<T>;
  createFlagsReducer(
    initialFlags: Computable<T>
  ): Reducer<Computable<T>, AnyAction>;
  ConnectedFlagsProvider: React.ComponentType<{}>;
};

export function createReduxBindings<T>(
  FlagsProvider: React.ComponentType<ProviderProps<T>>
): CreateReduxBindings<T> {
  function setFlagsAction(payload: Computable<Partial<T>>): SetFlagsAction<T> {
    return {
      type: MERGE_FLAGS_ACTION_TYPE,
      payload
    };
  }

  function createFlagsReducer(initialFlags: Computable<T>) {
    return (
      state: Computable<T> = initialFlags,
      action: AnyAction
    ): Computable<T> => {
      if (isSetFlagsAction(action)) {
        return merge({}, state, action.payload);
      } else {
        return state;
      }
    };
  }

  const ConnectedFlagsProvider = connect(
    mapStateToProps,
    null
  )(FlagsProvider as any);

  return {
    setFlagsAction,
    createFlagsReducer,
    ConnectedFlagsProvider
  };
}

export default createReduxBindings;
