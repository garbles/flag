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
var React = require("react");
var flags_provider_1 = require("./flags-provider");
var ConnectedFlagsProvider = /** @class */ (function (_super) {
    __extends(ConnectedFlagsProvider, _super);
    function ConnectedFlagsProvider(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            flags: {},
        };
        return _this;
    }
    ConnectedFlagsProvider.prototype.componentWillMount = function () {
        var _this = this;
        this.store = this.context.store;
        this.setState({ flags: this.store.getState().flags });
        this.unsubscribe = this.store.subscribe(function () {
            _this.setState({ flags: _this.store.getState().flags });
        });
    };
    ConnectedFlagsProvider.prototype.componentWillUnmount = function () {
        this.unsubscribe();
    };
    ConnectedFlagsProvider.prototype.render = function () {
        var children = this.props.children;
        var flags = this.state.flags;
        return React.createElement(flags_provider_1.FlagsProvider, { flags: flags }, children);
    };
    ConnectedFlagsProvider.contextTypes = { store: function () { return null; } };
    return ConnectedFlagsProvider;
}(React.Component));
exports.ConnectedFlagsProvider = ConnectedFlagsProvider;
//# sourceMappingURL=connected-flags-provider.js.map