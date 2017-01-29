var utils_1 = require('./utils');
var mobx_1 = require('mobx');
/**
 It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
 */
var MobxPathObjectBinder = (function () {
    function MobxPathObjectBinder(root, source) {
        this.root = mobx_1.observable(root);
        this.source = source === undefined ? this.root : source;
    }
    MobxPathObjectBinder.prototype.createNew = function (path, newItem) {
        var item = utils_1.followRef(this.root, newItem || this.getValue(path));
        return new MobxPathObjectBinder(this.root, item);
    };
    MobxPathObjectBinder.prototype.subscribe = function (updateFce) {
        // var previousState;
        // if (updateFce !== undefined) autorun(
        //     () => {
        //         var current = this.current.get()
        //         updateFce(current, this.previous);
        //         this.previous = current;
        //     });
        // //if (updateFce!==undefined) autorun(updateFce);
    };
    MobxPathObjectBinder.prototype.getValue = function (path) {
        if (path === undefined)
            return this.source;
        var cursorPath = utils_1.castPath(path);
        if (cursorPath.length === 0)
            return this.source;
        var parent = this.getParent(cursorPath);
        if (parent === undefined)
            return;
        var property = cursorPath[cursorPath.length - 1];
        var value = parent[property];
        if (value === undefined && !parent.hasOwnProperty(property)) {
            this.setValueAsObservable(parent, property);
        }
        return parent[property];
    };
    MobxPathObjectBinder.prototype.setValue = function (path, value) {
        if (path === undefined)
            return;
        var cursorPath = utils_1.castPath(path);
        if (cursorPath.length === 0)
            return;
        var parent = this.getParent(cursorPath);
        var property = cursorPath[cursorPath.length - 1];
        if (mobx_1.isObservable(parent, property)) {
            parent[property] = value;
            return;
        }
        this.setValueAsObservable(parent, property, value);
    };
    MobxPathObjectBinder.prototype.getParent = function (cursorPath) {
        if (cursorPath.length == 0)
            return;
        if (cursorPath.length == 1)
            return utils_1.followRef(this.root, this.source);
        var parentPath = cursorPath.slice(0, cursorPath.length - 1);
        var parent = utils_1.baseGet(this.source, parentPath);
        if (parent !== undefined)
            return utils_1.followRef(this.root, parent);
        utils_1.baseSet(this.source, parentPath, {}, Object);
        return utils_1.baseGet(this.source, parentPath);
    };
    MobxPathObjectBinder.prototype.setValueAsObservable = function (parent, property, value) {
        var newProps = {};
        newProps[property] = value;
        mobx_1.extendObservable(parent, newProps);
    };
    return MobxPathObjectBinder;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MobxPathObjectBinder;
