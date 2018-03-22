"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SET_FLAGS = "@@FLAGS/SET_FLAGS";
function setFlagsAction(flags) {
    return {
        payload: flags,
        type: exports.SET_FLAGS,
    };
}
exports.setFlagsAction = setFlagsAction;
//# sourceMappingURL=set-flags-action.js.map