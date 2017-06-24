import { Flags } from './types';

export const SET_FLAGS = `@@FLAGS/SET_FLAGS`;

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
