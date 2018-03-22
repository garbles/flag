import { Action } from 'redux';
import { ISetFlagsAction } from './set-flags-action';
import { Flags } from './types';
export declare const createFlagsReducer: <S extends Flags>(initialState: S) => (state: S | undefined, action: Action | ISetFlagsAction) => S;
