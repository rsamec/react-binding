/**
 * Two-way data binding for React.
 */
/**
 It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
 */
var PathObjectBinder = (function () {
    function PathObjectBinder(source) {
        this.source = source;
    }
    PathObjectBinder.prototype.getValue = function (path) {
        var parent = this.getParent(path);
        if (parent === undefined)
            return;
        var property = PathObjectBinder.getProperty(path);
        return parent[property];
    };
    PathObjectBinder.prototype.setValue = function (path, value) {
        var parent = this.getParent(path);
        if (parent === undefined)
            return;
        var property = PathObjectBinder.getProperty(path);
        parent[property] = value;
    };
    PathObjectBinder.prototype.getParent = function (path) {
        var last = path.lastIndexOf(".");
        return last != -1 ? this.string_to_ref(this.source, path.substring(0, last)) : this.source;
    };
    PathObjectBinder.getProperty = function (path) {
        var last = path.lastIndexOf(".");
        return last != -1 ? path.substring(last + 1, path.length) : path;
    };
    PathObjectBinder.prototype.string_to_ref = function (obj, s) {
        var parts = s.split('.');
        //experimental - support for square brackets
        //var arrayExp = /\[(\d*)\]/;
        //var firstExp = parts[0];
        //var matches = arrayExp.exec(firstExp);
        //var newObj;
        //if (!!matches){
        //    firstExp =  firstExp.replace(matches[0],"");
        //    var newArray = obj[firstExp][matche];
        //    if (newArray === undefined) newArray = [];
        //    newObj = newArray[matches[1]];
        //}
        //else{
        //    newObj = obj[firstExp];
        //    if (newObj === undefined) newObj = obj[firstExp] = {};
        //}
        //var newObj = !!matches? obj[firstExp.replace(matches[0],"")][matches[1]]:obj[firstExp];
        var newObj = obj[parts[0]];
        if (newObj === undefined)
            newObj = obj[parts[0]] = {};
        if (!parts[1]) {
            return newObj;
        }
        parts.splice(0, 1);
        var newString = parts.join('.');
        return this.string_to_ref(newObj, newString);
    };
    return PathObjectBinder;
})();
exports.PathObjectBinder = PathObjectBinder;
/**
 It represents binding to property at source object at a given path.
 */
var PathObjectBinding = (function () {
    function PathObjectBinding(sourceObject, path, notifyChange, valueConverter) {
        this.sourceObject = sourceObject;
        this.path = path;
        this.notifyChange = notifyChange;
        this.valueConverter = valueConverter;
        this.source = new PathObjectBinder(this.sourceObject);
    }
    Object.defineProperty(PathObjectBinding.prototype, "requestChange", {
        get: function () {
            var _this = this;
            return function (value) {
                _this.value = value;
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PathObjectBinding.prototype, "value", {
        get: function () {
            var value = this.path === undefined ? this.sourceObject : this.source.getValue(this.path);
            //get value - optional call converter
            return this.valueConverter !== undefined ? this.valueConverter.format(value) : value;
        },
        set: function (value) {
            var previousValue = this.path === undefined ? this.sourceObject : this.source.getValue(this.path);
            var convertedValueToBeSet = this.valueConverter !== undefined ? this.valueConverter.parse(value) : value;
            //check if the value is really changed - strict equality
            if (previousValue === convertedValueToBeSet)
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
    function ArrayObjectBinding(sourceObject, path, notifyChange) {
        this.sourceObject = sourceObject;
        this.path = path;
        this.notifyChange = notifyChange;
        this.source = new PathObjectBinder(this.sourceObject);
    }
    Object.defineProperty(ArrayObjectBinding.prototype, "items", {
        get: function () {
            var items = this.path === undefined ? this.sourceObject : this.source.getValue(this.path);
            if (items === undefined)
                return [];
            return items.map(function (item) {
                return new PathObjectBinding(item, undefined, this.notifyChange);
            }, this);
        },
        enumerable: true,
        configurable: true
    });
    ArrayObjectBinding.prototype.add = function (defaultItem) {
        var items = this.path === undefined ? this.sourceObject : this.source.getValue(this.path);
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
        var items = this.path === undefined ? this.sourceObject : this.source.getValue(this.path);
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
        var items = this.path === undefined ? this.sourceObject : this.source.getValue(this.path);
        if (items === undefined)
            return;
        return elementsToAdd ? items.splice(start, deleteCount, elementsToAdd) : items.splice(start, deleteCount);
        //if (this.notifyChange !== undefined) this.notifyChange();
    };
    ArrayObjectBinding.prototype.move = function (x, y) {
        this.splice(y, 0, this.splice(x, 1)[0]);
    };
    return ArrayObjectBinding;
})();
exports.ArrayObjectBinding = ArrayObjectBinding;
/**
 It represents binding to array using relative path to parent object.
 */
var ArrayParentBinding = (function () {
    function ArrayParentBinding(parentBinding, relativePath) {
        this.parentBinding = parentBinding;
        this.relativePath = relativePath;
    }
    Object.defineProperty(ArrayParentBinding.prototype, "source", {
        //wrapped properties - delegate call to parent
        get: function () {
            return this.parentBinding.source;
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
            return [this.parentBinding.path, this.relativePath].join(".");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ArrayParentBinding.prototype, "items", {
        get: function () {
            if (this.source === undefined)
                return [];
            var items = this.source.getValue(this.path);
            if (items === undefined)
                return [];
            return items.map(function (item) {
                return new PathObjectBinding(item, undefined, this.notifyChange);
            }, this);
        },
        enumerable: true,
        configurable: true
    });
    ArrayParentBinding.prototype.add = function (defaultItem) {
        var items = this.source.getValue(this.path);
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
        var items = this.source.getValue(this.path);
        if (items === undefined)
            return;
        var index = items.indexOf(itemToRemove);
        if (index === -1)
            return;
        items.splice(index, 1);
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
    //converter:any;
    function PathParentBinding(parentBinding, relativePath, valueConverter) {
        this.parentBinding = parentBinding;
        this.relativePath = relativePath;
        this.valueConverter = valueConverter;
        //this.converter.format = Utils.partial(valueConverter,.partial()
    }
    Object.defineProperty(PathParentBinding.prototype, "source", {
        //wrapped properties - delegate call to parent
        get: function () {
            return this.parentBinding.source;
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
            return [this.parentBinding.path, this.relativePath].join(".");
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
exports.DataBinding = {
    PathObjectBinding: PathObjectBinding,
    PathParentBinding: PathParentBinding,
    ArrayObjectBinding: ArrayObjectBinding,
    ArrayParentBinding: ArrayParentBinding,
    CurryConverter: CurryConverter
};
/**
 * React [LinkedStateMixin](http://facebook.github.io/react/docs/two-way-binding-helpers.html) is an easy way to express two-way data binding in React.
 *
 * React-binding comes with utility [Binder](https://github.com/rsamec/react-binding) for two-way binding that supports binding to
 *
 *  +   object properties with path expression (dot notation)
 *      +   this.bindToState("data","Employee.FirstName");
 *      +   this.bindToState("data","Employee.Contact.Email");
 *  +   complex objects (json) with nested properties
 *      +   this.bindTo(employee,"FirstName");
 *      +   this.bindTo(employee,"Contact.Email");
 *  +   collection-based structures - arrays and lists
 *      +   model={this.bindTo(employee,"FirstName")}
 *          +   this.props.model.items.map(function(item){ return (<Hobby model={hobby}/>);})
 *          +   this.props.model.add()
 *          +   this.props.model.remove(item)
 *  +   supports for "value/requestChange" interface also to enable to use [ReactLink][valueLink] attribute
 *  +   valueLink={this.bindTo(employee,"FirstName")}
 *  +   enables binding with value converters
 *      +   supports both directions - format (toView) and parse (fromView)
 *      +   support for converter parameter - valueLink={this.bindToState("data", "Duration.From",converter, "DD.MM.YYYY")}
 *      +   converter parameter can be data-bound - valueLink={this.bindToState("data", "Duration.From",converter, this.state.format)}
 *  +   usable with any css frameworks -
 *      +   react-bootstrap
 *      +   material-ui
 *
 */
var Binder = (function () {
    function Binder() {
    }
    Binder.createStateKeySetter = function (component, key) {
        var partialState = {};
        return function (value) {
            partialState[key] = (value !== undefined) ? value : component.state[key];
            component.setState(partialState);
        };
    };
    /**
     * It enables to bind to object property with path expression
     * +   using [valueLink](http://facebook.github.io/react/docs/two-way-binding-helpers.html)
     * ``` js
     * <input type='text' valueLink={this.bindToState("data","Employee.Contact.Email")} />
     * ```
     *
     *  +   without [valueLink](http://facebook.github.io/react/docs/two-way-binding-helpers.html)
     *  ``` js
     * <TextBoxInput model={this.bindToState("data","Employee.Contact.Email")} />
     * ```
     *
     * ``` js
     * var TextBoxInput = React.createClass({
        *   render: function() {
        *       var valueModel = this.props.model;
        *       var handleChange = function(e){
        *       valueModel.value = e.target.value;
        *   }
        *   return (
        *       <input type='text' onChange={handleChange} value={valueModel.value} />
        *   )}
        * });
     *  ```
     *
     * @param key - property name in state (this.state[key])
     * @param path - expression to bind to property
     * @param converter {DataBinding.IValueConverter} - value converter
     * @param converterParams - parameters used by converter
     * @returns {DataBinding.PathObjectBinding}
     */
    Binder.bindToState = function (component, key, path, converter, converterParams) {
        return new PathObjectBinding(component["state"][key], path, Binder.createStateKeySetter(component, key), converterParams !== undefined ? new CurryConverter(converter, converterParams) : converter);
    };
    /**
     * It enables to bind to complex object with nested properties and reuse bindings in components.
     *
     * +   binding to state at root level
     *
     * ``` js
     *  <PersonComponent personModel={this.bindToState("data","Employee")} />
     *  <PersonComponent personModel={this.bindToState("data","Deputy")} />
     * ```
     *
     * +   binding to parent
     *
     * ``` js
     *   <input type='text' valueLink={this.bindTo(this.props.personModel,"Contact.Email")} />
     * ```
     *
     * +  reuse bindings in component
     *
     * ``` js
     * var PersonComponent = React.createClass({
         *   mixins:[BindToMixin],
         *   render: function() {
         *     return (
         *       <div>
         *         <input type='text' valueLink={this.bindTo(this.props.personModel,"FirstName")} />
         *         <input type='text' valueLink={this.bindTo(this.props.personModel,"LastName")} />
         *         <input type='text' valueLink={this.bindTo(this.props.personModel,"Contact.Email")} />
         *       </div>
         *     );
         *   }
         * });
     *
     * ```
     *
     * @param parent - the parent object
     * @param path - expression to bind to property
     * @param converter - value converter {DataBinding.IValueConverter}
     * @param converterParams - parameters used by converter
     * @returns {DataBinding.PathParentBinding}
     */
    Binder.bindTo = function (parent, path, converter, converterParams) {
        return new PathParentBinding(parent, path, converterParams !== undefined ? new CurryConverter(converter, converterParams) : converter);
    };
    /**
     * It enables binding to collection-based structures (array). It enables to add and remove items.
     *
     * +   binding to array
     *
     * ``` js
     *  <HobbyList model={this.bindArrayToState("data","Hobbies")} />
     * ```
     *
     * @param key - property name in state (this.state[key]) - it must be array
     * @param path - expression to array to bind to property
     * @returns {DataBinding.ArrayObjectBinding}
     */
    Binder.bindArrayToState = function (component, key, path) {
        return new ArrayObjectBinding(component["state"][key], path, Binder.createStateKeySetter(component, key));
    };
    /**
     * It enables binding to collection-based structures (array) for nested arrays. It enables to add and remove items.
     *
     * +   binding to parent
     *
     * ``` js
     *   <input type='text' valueLink={this.bindArrayTo(this.props.personModel,"Contact.Email")} />
     * ```
     *
     * @param parent - the parent object
     * @param path - expression to bind to property - relative path from parent
     * @returns {DataBinding.PathParentBinding}
     */
    Binder.bindArrayTo = function (parent, path) {
        return new ArrayParentBinding(parent, path);
    };
    return Binder;
})();
exports.Binder = Binder;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Binder;
