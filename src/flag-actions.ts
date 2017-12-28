import { Flags } from './types';

export const SET_FLAGS = `@@FLAGS/SET_FLAGS`;
export const REPLACE_FLAGS = `@@FLAGS/REPLACE_FLAGS`;

export interface IReplaceFlagsAction {
  type: typeof SET_FLAGS;
  payload: Flags;
}

export interface ISetFlagsAction {
  type: typeof SET_FLAGS;
  payload: Flags;
}

export function setFlagsAction(flags: Flags): ISetFlagsAction {
  return {
    payload: flags,
    type: SET_FLAGS,
  };
}

export function replaceFlagsAction(flags: Flags): IReplaceFlagsAction {
  return {
    payload: flags,
    type: REPLACE_FLAGS,
  };
}
