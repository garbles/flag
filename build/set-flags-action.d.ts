import { Flags } from './types';
export declare const SET_FLAGS = "@@FLAGS/SET_FLAGS";
export interface ISetFlagsAction {
    type: typeof SET_FLAGS;
    payload: Flags;
}
export declare function setFlagsAction(flags: Flags): ISetFlagsAction;
