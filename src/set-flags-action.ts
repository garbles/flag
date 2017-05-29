import { Flags } from './types';

export const SET_FLAGS = `@@FLAGS/SET_FLAGS`;

export interface SetFlagsAction {
  type: typeof SET_FLAGS,
  payload: Flags
}

export function setFlagsAction(flags: Flags): SetFlagsAction {
  return {
    type: SET_FLAGS,
    payload: flags
  };
}