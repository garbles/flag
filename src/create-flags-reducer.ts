import { Action } from 'redux';
import { SET_FLAGS, SetFlagsAction } from './set-flags-action';
import { Flags } from './types';
import merge = require('lodash/merge');

const isPlainObject = (obj: any): obj is Object =>
  Object.prototype.toString.call(obj) === '[object Object]';


export const createFlagsReducer =
  <S extends Flags>(initialState: S) =>
    (state: S = initialState, action: Action | SetFlagsAction): S => {
      const { payload } = action as SetFlagsAction;

      if (action.type === SET_FLAGS && isPlainObject(payload)) {
        return merge<S, S, S>({} as S, state as S, payload as S);
      } else {
        return state;
      }
    };