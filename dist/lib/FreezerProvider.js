"use strict";
var Freezer = require('freezer-js');
var utils_1 = require('./utils');
var utils_lodash_1 = require('./utils-lodash');
/**
 It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
 */
var FreezerPathObjectBinder = (function () {
    function FreezerPathObjectBinder(rootParams, subSource) {
        this.subSource = subSource;
        this.root = subSource === undefined ? new Freezer(rootParams) : rootParams;
        //this.source = source === undefined ? this.root : source;
    }
    Object.defineProperty(FreezerPathObjectBinder.prototype, "source", {
        get: function () {
            return this.subSource !== undefined ? this.subSource.get() : this.root.get();
        },
        enumerable: true,
        configurable: true
    });
    FreezerPathObjectBinder.prototype.createNew = function (path, newItem) {
        var item = newItem || this.getValue(path);
        //var item = followRef(this.root.get(), newItem || this.getValue(path));
        return new FreezerPathObjectBinder(this.root, new Freezer(item));
    };
    FreezerPathObjectBinder.prototype.subscribe = function (updateFce) {
        this.root.on('update', function (state, prevState) {
            //console.log(state);
            if (updateFce !== undefined)
                updateFce(state, prevState);
        });
    };
    FreezerPathObjectBinder.prototype.getValue = function (path) {
        if (path === undefined)
            return this.source;
        var cursorPath = utils_1.castPath(path);
        if (cursorPath.length === 0)
            return this.source;
        var parent = this.getParent(cursorPath);
        if (parent === undefined)
            return;
        var property = cursorPath[cursorPath.length - 1];
        return parent[property];
    };
    FreezerPathObjectBinder.prototype.setValue = function (path, value) {
        if (path === undefined)
            return;
        var cursorPath = utils_1.castPath(path);
        if (cursorPath.length === 0)
            return;
        var parent = this.getParent(cursorPath);
        if (parent === undefined)
            return;
        var property = cursorPath[cursorPath.length - 1];
        var updated = parent.set(property, value);
        return updated;
    };
    FreezerPathObjectBinder.prototype.getParent = function (cursorPath) {
        if (cursorPath.length == 0)
            return;
        var source = this.source;
        if (cursorPath.length == 1)
            return utils_1.followRef(this.root.get(), source);
        var parentPath = cursorPath.slice(0, cursorPath.length - 1);
        var parent = utils_1.baseGet(source, parentPath);
        if (parent !== undefined)
            return utils_1.followRef(this.root.get(), parent);
        var updated = this.setWith(source, parentPath, {});
        return utils_1.baseGet(updated, parentPath);
    };
    FreezerPathObjectBinder.prototype.setWith = function (object, path, value) {
        var length = path.length;
        var lastIndex = length - 1;
        var index = -1;
        var nested = object;
        while (nested != null && ++index < length) {
            var key = path[index];
            var newValue = value;
            if (index != lastIndex) {
                var objValue = nested[key];
                if (newValue === undefined) {
                    newValue = utils_lodash_1.isObject(objValue)
                        ? objValue
                        : (utils_lodash_1.isIndex(path[index + 1]) ? [] : {});
                }
            }
            //assignValue(nested, key, newValue);
            var updated = nested.set(key, newValue);
            nested = updated[key];
        }
        return nested;
    };
    return FreezerPathObjectBinder;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FreezerPathObjectBinder;
