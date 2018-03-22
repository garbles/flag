"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var deep_computed_1 = require("deep-computed");
var React = require("react");
var key_1 = require("./key");
var FlagsProvider = /** @class */ (function (_super) {
    __extends(FlagsProvider, _super);
    function FlagsProvider(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            computed: deep_computed_1.deepComputed(props.flags),
        };
        return _this;
    }
    FlagsProvider.prototype.componentWillReceiveProps = function (props) {
        this.setState({
            computed: deep_computed_1.deepComputed(props.flags),
        });
    };
    FlagsProvider.prototype.getChildContext = function () {
        return _a = {},
            _a[key_1.key] = this.state.computed,
            _a;
        var _a;
    };
    FlagsProvider.prototype.render = function () {
        var children = this.props.children;
        return children ? React.Children.only(children) : null;
    };
    FlagsProvider.childContextTypes = (_a = {}, _a[key_1.key] = function () { return null; }, _a);
    return FlagsProvider;
}(React.PureComponent));
exports.FlagsProvider = FlagsProvider;
var _a;
//# sourceMappingURL=flags-provider.js.map