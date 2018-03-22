"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var key_1 = require("./key");
// see https://github.com/mridgway/hoist-non-react-statics/pull/34
// and https://github.com/mridgway/hoist-non-react-statics/pull/38
var hoistStatics = require('hoist-non-react-statics');
function withFlags(Component) {
    var Wrapper = function (props, context) {
        return React.createElement(Component, __assign({}, props, { flags: context[key_1.key] }));
    };
    Wrapper.displayName = "withFlags(" + (Component.displayName || Component.name) + ")";
    Wrapper.contextTypes = (_a = {}, _a[key_1.key] = function () { return null; }, _a);
    return hoistStatics(Wrapper, Component);
    var _a;
}
exports.withFlags = withFlags;
//# sourceMappingURL=with-flags.js.map