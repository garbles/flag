import { IFlags } from "./types";

export const SET_FLAGS = `@@FLAGS/SET_FLAGS`;

export interface ISetFlagsAction {
  type: typeof SET_FLAGS;
  payload: IFlags;
}

export function setFlagsAction(flags: IFlags): ISetFlagsAction {
  return {
    payload: flags,
    type: SET_FLAGS,
  };
}
