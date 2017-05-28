import { Action } from 'redux';
import { connect } from 'react-redux';
import { createElement, ReactElement } from 'react';
import { deepComputed } from 'deep-computed';
import merge = require('lodash/merge');

const SET_FLAGS = '@@FLAGS/SET_FLAGS';

export type Render = <P>(value: Value | void) => ReactElement<P>;
export type ResolvedValue = string | number | boolean | IResolvedFlags;
export type Value = string | number | boolean | IFlags | ((flags: Value) => Value);

export interface IFlags {
  [key: string]: Value;
};

export interface IResolvedFlags {
  [key: string]: ResolvedValue;
}

export interface ISetFlagsAction {
  type: typeof SET_FLAGS,
  payload?: IFlags
}

interface IOwnProps {
  name: string;
  render: Render;
  falsyRender: Render;
}

interface IComponentProps {
  render: Render;
  value: Value | void;
}

const noopRender = () => createElement('noscript');

const isObject = (obj: any): obj is Object =>
  Object.prototype.toString.call(obj) === '[object Object]';

function getFlag(flags: IFlags, keyPath: string): Value | void {
  const [head, ...tail] = keyPath.split('.');
  let result: Value = (flags as IFlags)[head];

  for (let key in tail) {
    result = (result as IFlags)[key];

    if (result === undefined || result === null) {
      return;
    }
  }

  return result;
}

const mapStateToProps =
  <S extends { flags: IFlags }>(state: S, props: IOwnProps): IComponentProps => {
    let value = getFlag(state.flags, props.name);

    const render = (value ? props.render : props.falsyRender) || noopRender;

    return {
      render,
      value,
    };
  };

function createFlagsReducer<S extends IFlags, C extends IResolvedFlags>(initialState: S) {
  let prev = {} as S;
  let next = initialState;
  const initialComputedState = deepComputed<S, C>(initialState);

  return (state: C = initialComputedState, action: Action | ISetFlagsAction): C => {
    if (action.type === SET_FLAGS && isObject((action as ISetFlagsAction).payload)) {
      prev = next;
      next = merge({}, prev, (action as ISetFlagsAction).payload);
      return deepComputed<S, C>(next);
    } else {
      return state;
    }
  };
}

function setFlagsAction(flags: IFlags): ISetFlagsAction {
  return {
    type: SET_FLAGS,
    payload: flags
  };
}

const Flag =
  connect(mapStateToProps)(({ render, value }: IComponentProps) => render(value));

export { createFlagsReducer, setFlagsAction, Flag };