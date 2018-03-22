"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var set_flags_action_1 = require("./set-flags-action");
var merge = require("lodash/merge");
// tslint:disable-next-line:ban-types
var isPlainObject = function (obj) { return Object.prototype.toString.call(obj) === '[object Object]'; };
exports.createFlagsReducer = function (initialState) { return function (state, action) {
    if (state === void 0) { state = initialState; }
    var payload = action.payload;
    if (action.type === set_flags_action_1.SET_FLAGS && isPlainObject(payload)) {
        return merge({}, state, payload);
    }
    else {
        return state;
    }
}; };
//# sourceMappingURL=create-flags-reducer.js.map