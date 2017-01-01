var Freezer = require('freezer-js');
/**
 It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
 */
var FreezerPathObjectBinder = (function () {
    function FreezerPathObjectBinder(source) {
        this.source = source;
        this.freezer = new Freezer(source);
    }
    FreezerPathObjectBinder.prototype.subscribe = function (updateFce) {
        this.freezer.on('update', function (state, prevState) {
            if (updateFce !== undefined)
                updateFce(state, prevState);
        });
    };
    FreezerPathObjectBinder.prototype.getValue = function (path) {
        if (path === undefined)
            return this.freezer.get();
        var parent = this.getParent(path);
        if (parent === undefined)
            return;
        var property = FreezerPathObjectBinder.getProperty(path);
        return parent[property];
    };
    FreezerPathObjectBinder.prototype.setValue = function (path, value) {
        var parent = this.getParent(path);
        if (parent === undefined)
            return;
        var property = FreezerPathObjectBinder.getProperty(path);
        parent.set(property, value);
    };
    FreezerPathObjectBinder.prototype.getParent = function (path) {
        var state = this.freezer.get();
        var last = path.lastIndexOf(".");
        return last != -1 ? this.string_to_ref(state, path.substring(0, last)) : state;
    };
    FreezerPathObjectBinder.getProperty = function (path) {
        var last = path.lastIndexOf(".");
        return last != -1 ? path.substring(last + 1, path.length) : path;
    };
    FreezerPathObjectBinder.prototype.string_to_ref = function (obj, s) {
        var parts = s.split('.');
        var newObj = obj[parts[0]];
        if (newObj === undefined)
            newObj = obj.set(parts[0], {});
        if (!parts[1]) {
            return newObj;
        }
        parts.splice(0, 1);
        var newString = parts.join('.');
        return this.string_to_ref(newObj, newString);
    };
    return FreezerPathObjectBinder;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FreezerPathObjectBinder;
