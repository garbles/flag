import { connect } from 'react-redux';
import { createElement, ReactElement } from 'react';

const SET_FLAGS = '@@FLAGS/SET_FLAGS';

export type Value = string | number | boolean | IFlags | ((flags: Value) => Value) | void | null;
export type Render = <P>(value: Value) => ReactElement<P>;
export type FlagsReducer<S> = (state: S, action: ISetFlagsAction) => S;

export interface IFlags {
  [key: string]: Value;
};

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
  value: Value;
}

const noopRender = () => createElement('noscript');

const isObject = (obj: any): obj is Object =>
  Object.prototype.toString.call(obj) === '[object Object]';

const isFunction = (obj: any): obj is Function =>
  typeof obj === 'function';

function setFlags<S extends IFlags>(prev: S, next: S): S {
  const keys: (keyof typeof next)[] = Object.keys(next);

  return keys.reduce((acc, key: keyof typeof next) => {
    const value = setFlagsValue(prev[key], next[key]);
    return Object.assign({}, acc, { [key]: value });
  }, prev as S);
}

function setFlagsValue(prev: Value, next: Value): Value {
  if (!isObject(prev) && !Array.isArray(prev)) {
    return next;
  }

  if (isFunction(prev)) {
    return next;
  }

  return setFlags(prev as IFlags, next as IFlags);
}

function getFlag(flags: IFlags, keyPath: string): Value | null {
  const [head, ...tail] = keyPath.split('.');
  let result: Value = (flags as IFlags)[head];

  for (let key in tail) {
    result = (result as IFlags)[key];

    if (result === undefined || result === null) {
      return null;
    }
  }

  return result;
}

const mapStateToProps =
  <S extends { flags: IFlags }>(state: S, props: IOwnProps): IComponentProps => {
    let value = getFlag(state.flags, props.name);

    if (isFunction(value)) {
      value = value(state.flags);
    }

    const render = (value ? props.render : props.falsyRender) || noopRender;

    return {
      render,
      value,
    };
  };

function createFlagsReducer<S extends IFlags>(initialState: S): FlagsReducer<S> {
  // TODO watch for redux init and transform flags using setFlags (computed properties)
  return (state = initialState, action) => {
    if (action.type === SET_FLAGS && isObject(action.payload)) {
      return setFlags(state, action.payload as S);
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