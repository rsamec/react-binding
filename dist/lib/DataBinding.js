var utils_1 = require("./utils");
/**
 It represents binding to property at source object at a given path.
 */
var PathObjectBinding = (function () {
    function PathObjectBinding(source, rootPath, notifyChange, valueConverter, parentNode) {
        this.source = source;
        this.notifyChange = notifyChange;
        this.valueConverter = valueConverter;
        this.parentNode = parentNode;
        this.path = rootPath === undefined ? [] : utils_1.castPath(rootPath);
    }
    Object.defineProperty(PathObjectBinding.prototype, "requestChange", {
        get: function () {
            var _this = this;
            return function (value) { _this.value = value; };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PathObjectBinding.prototype, "root", {
        get: function () {
            return this.parentNode !== undefined ? this.parentNode.root : this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PathObjectBinding.prototype, "parent", {
        get: function () {
            return this.parentNode !== undefined ? this.parentNode : undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PathObjectBinding.prototype, "value", {
        get: function () {
            var value = this.path === undefined ? this.source.getValue() : this.source.getValue(this.path);
            //get value - optional call converter
            return this.valueConverter !== undefined ? this.valueConverter.format(value) : value;
        },
        set: function (value) {
            var previousValue = this.path === undefined ? this.source.getValue() : this.source.getValue(this.path);
            var convertedValueToBeSet = this.valueConverter !== undefined ? this.valueConverter.parse(value) : value;
            //check if the value is really changed - strict equality
            if (previousValue !== undefined && previousValue === convertedValueToBeSet)
                return;
            if (this.path === undefined) {
                if (this.notifyChange !== undefined)
                    this.notifyChange(convertedValueToBeSet);
            }
            else {
                this.source.setValue(this.path, convertedValueToBeSet);
                if (this.notifyChange !== undefined)
                    this.notifyChange();
            }
        },
        enumerable: true,
        configurable: true
    });
    return PathObjectBinding;
})();
exports.PathObjectBinding = PathObjectBinding;
/**
 It represents binding to property at source object at a given path.
 */
var ArrayObjectBinding = (function () {
    function ArrayObjectBinding(source, rootPath, notifyChange, valueConverter) {
        this.source = source;
        this.notifyChange = notifyChange;
        this.valueConverter = valueConverter;
        this.path = rootPath === undefined ? [] : utils_1.castPath(rootPath);
    }
    Object.defineProperty(ArrayObjectBinding.prototype, "parent", {
        get: function () {
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ArrayObjectBinding.prototype, "root", {
        get: function () {
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ArrayObjectBinding.prototype, "items", {
        get: function () {
            var items = this.path === undefined ? this.source.getValue() : this.source.getValue(this.path);
            if (items === undefined)
                return [];
            return items.map(function (item, index) {
                return new PathObjectBinding(this.source.createNew(this.path.concat(index)), undefined, this.notifyChange, undefined, this);
            }, this);
        },
        enumerable: true,
        configurable: true
    });
    ArrayObjectBinding.prototype.add = function (defaultItem) {
        var items = this.path === undefined ? this.source.getValue() : this.source.getValue(this.path);
        if (items === undefined) {
            this.source.setValue(this.path, []);
            items = this.source.getValue(this.path);
        }
        if (defaultItem === undefined)
            defaultItem = {};
        items.push(defaultItem);
        if (this.notifyChange !== undefined)
            this.notifyChange();
    };
    ArrayObjectBinding.prototype.remove = function (itemToRemove) {
        var items = this.path === undefined ? this.source.getValue() : this.source.getValue(this.path);
        if (items === undefined)
            return;
        var index = items.indexOf(itemToRemove);
        if (index === -1)
            return;
        items.splice(index, 1);
        if (this.notifyChange !== undefined)
            this.notifyChange();
    };
    ArrayObjectBinding.prototype.splice = function (start, deleteCount, elementsToAdd) {
        var items = this.path === undefined ? this.source.getValue() : this.source.getValue(this.path);
        if (items === undefined)
            return;
        return elementsToAdd ? items.splice(start, deleteCount, elementsToAdd) : items.splice(start, deleteCount);
        //if (this.notifyChange !== undefined) this.notifyChange();
    };
    ArrayObjectBinding.prototype.move = function (x, y) {
        var items = this.path === undefined ? this.source.getValue() : this.source.getValue(this.path);
        if (items === undefined)
            return;
        //@TODO: use more effective way to clone array
        var itemsCloned = JSON.parse(JSON.stringify(items));
        itemsCloned.splice(y, 0, itemsCloned.splice(x, 1)[0]);
        this.source.setValue(this.path, itemsCloned);
    };
    return ArrayObjectBinding;
})();
exports.ArrayObjectBinding = ArrayObjectBinding;
/**
 It represents binding to array using relative path to parent object.
 */
var ArrayParentBinding = (function () {
    function ArrayParentBinding(parentBinding, subPath, valueConverter) {
        this.parentBinding = parentBinding;
        this.valueConverter = valueConverter;
        this.relativePath = subPath === undefined ? [] : utils_1.castPath(subPath);
    }
    Object.defineProperty(ArrayParentBinding.prototype, "source", {
        //wrapped properties - delegate call to parent
        get: function () {
            return this.parentBinding.source;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ArrayParentBinding.prototype, "root", {
        get: function () {
            return this.parentBinding.root;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ArrayParentBinding.prototype, "parent", {
        get: function () {
            return this.parentBinding;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ArrayParentBinding.prototype, "notifyChange", {
        get: function () {
            return this.parentBinding.notifyChange;
        },
        set: function (value) {
            this.parentBinding.notifyChange = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ArrayParentBinding.prototype, "path", {
        //concatenate path
        get: function () {
            if (this.parentBinding.path === undefined)
                return this.relativePath;
            if (this.relativePath === undefined)
                return this.parentBinding.path;
            return this.parentBinding.path.concat(this.relativePath);
        },
        enumerable: true,
        configurable: true
    });
    ArrayParentBinding.prototype.getItems = function () {
        if (this.source === undefined)
            return;
        var value = this.source.getValue(this.path);
        return this.valueConverter !== undefined ? this.valueConverter.format(value) : value;
    };
    Object.defineProperty(ArrayParentBinding.prototype, "items", {
        get: function () {
            var items = this.getItems();
            if (items === undefined)
                return [];
            return items.map(function (item, index) {
                //item._parentBinding = this;            
                return new PathObjectBinding(this.source.createNew(this.path.concat(index), item), undefined, this.notifyChange, undefined, this);
            }, this);
        },
        enumerable: true,
        configurable: true
    });
    ArrayParentBinding.prototype.add = function (defaultItem) {
        var items = this.getItems();
        if (items === undefined) {
            this.source.setValue(this.path, []);
            items = this.source.getValue(this.path);
        }
        if (defaultItem === undefined)
            defaultItem = {};
        items.push(defaultItem);
        if (this.notifyChange !== undefined)
            this.notifyChange();
    };
    ArrayParentBinding.prototype.remove = function (itemToRemove) {
        var items = this.getItems();
        if (items === undefined)
            return;
        var index = items.indexOf(itemToRemove);
        if (index === -1)
            return;
        items.splice(index, 1);
        if (this.notifyChange !== undefined)
            this.notifyChange();
    };
    ArrayParentBinding.prototype.splice = function (start, deleteCount, elementsToAdd) {
        var items = this.getItems();
        if (items === undefined)
            return;
        return elementsToAdd ? items.splice(start, deleteCount, elementsToAdd) : items.splice(start, deleteCount);
        //if (this.notifyChange !== undefined) this.notifyChange();
    };
    ArrayParentBinding.prototype.move = function (x, y) {
        this.splice(y, 0, this.splice(x, 1)[0]);
        if (this.notifyChange !== undefined)
            this.notifyChange();
    };
    return ArrayParentBinding;
})();
exports.ArrayParentBinding = ArrayParentBinding;
/**
 It represents binding to relative path for parent object.
 */
var PathParentBinding = (function () {
    function PathParentBinding(parentBinding, subPath, valueConverter) {
        this.parentBinding = parentBinding;
        this.valueConverter = valueConverter;
        this.relativePath = subPath === undefined ? [] : utils_1.castPath(subPath);
    }
    Object.defineProperty(PathParentBinding.prototype, "source", {
        //wrapped properties - delegate call to parent
        get: function () {
            return this.parentBinding.source;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PathParentBinding.prototype, "root", {
        get: function () {
            return this.parentBinding.root;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PathParentBinding.prototype, "parent", {
        get: function () {
            return this.parentBinding;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PathParentBinding.prototype, "notifyChange", {
        get: function () {
            return this.parentBinding.notifyChange;
        },
        set: function (value) {
            this.parentBinding.notifyChange = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PathParentBinding.prototype, "requestChange", {
        get: function () {
            var _this = this;
            return function (value) {
                _this.value = value;
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PathParentBinding.prototype, "path", {
        //concatenate path
        get: function () {
            if (this.parentBinding.path === undefined)
                return this.relativePath;
            return this.parentBinding.path.concat(this.relativePath);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PathParentBinding.prototype, "value", {
        get: function () {
            var value = this.source.getValue(this.path);
            //get value - optional call converter
            return this.valueConverter !== undefined ? this.valueConverter.format(value) : value;
        },
        set: function (value) {
            //check if the value is really changed - strict equality
            var previousValue = this.source.getValue(this.path);
            var convertedValueToBeSet = this.valueConverter !== undefined ? this.valueConverter.parse(value) : value;
            if (previousValue === convertedValueToBeSet)
                return;
            //set value - optional call converter
            this.source.setValue(this.path, convertedValueToBeSet);
            if (this.notifyChange !== undefined)
                this.notifyChange();
        },
        enumerable: true,
        configurable: true
    });
    return PathParentBinding;
})();
exports.PathParentBinding = PathParentBinding;
var CurryConverter = (function () {
    function CurryConverter(converter, args) {
        this.formatFce = this.curryParameters(converter.format, [args]);
        this.parseFce = this.curryParameters(converter.parse, [args]);
    }
    CurryConverter.prototype.curryParameters = function (fn, args) {
        return function () {
            return fn.apply(this, Array.prototype.slice.call(arguments).concat(args));
        };
    };
    CurryConverter.prototype.format = function (value) {
        return this.formatFce(value);
    };
    CurryConverter.prototype.parse = function (value) {
        return this.parseFce(value);
    };
    return CurryConverter;
})();
exports.CurryConverter = CurryConverter;
