var FreezerProvider_1 = require('./FreezerProvider');
var Binder_1 = require('./Binder');
var Binder = (function () {
    function Binder() {
    }
    Binder.bindTo = function (parent, path, converter, converterParams) {
        return Binder_1.BinderCore.bindTo(FreezerProvider_1.default, parent, path, converter, converterParams);
    };
    Binder.bindArrayTo = function (parent, path, converter, converterParams) {
        return Binder_1.BinderCore.bindArrayTo(FreezerProvider_1.default, parent, path, converter, converterParams);
    };
    return Binder;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Binder;
