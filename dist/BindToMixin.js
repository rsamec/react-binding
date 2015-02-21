/**
 * Two-way data binding for React.
 */
var DataBinding;
(function (DataBinding) {
    ;
    ;
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
            var property = this.getProperty(path);
            return parent[property];
        };
        PathObjectBinder.prototype.setValue = function (path, value) {
            var parent = this.getParent(path);
            if (parent === undefined)
                return;
            var property = this.getProperty(path);
            parent[property] = value;
        };
        PathObjectBinder.prototype.getParent = function (path) {
            var last = path.lastIndexOf(".");
            return last != -1 ? this.string_to_ref(this.source, path.substring(0, last)) : this.source;
        };
        PathObjectBinder.prototype.getProperty = function (path) {
            var last = path.lastIndexOf(".");
            return last != -1 ? path.substring(last + 1, path.length) : path;
        };
        PathObjectBinder.prototype.string_to_ref = function (obj, string) {
            var parts = string.split('.');
            var newObj = obj[parts[0]];
            if (!parts[1]) {
                if (newObj === undefined)
                    newObj = obj[parts[0]] = {};
                return newObj;
            }
            if (newObj == undefined)
                return undefined;
            parts.splice(0, 1);
            var newString = parts.join('.');
            return this.string_to_ref(newObj, newString);
        };
        return PathObjectBinder;
    })();
    DataBinding.PathObjectBinder = PathObjectBinder;
    /**
     It represents binding to property at source object at a given path.
     */
    var PathObjectBinding = (function () {
        function PathObjectBinding(sourceObject, path, notifyChange) {
            this.sourceObject = sourceObject;
            this.path = path;
            this.notifyChange = notifyChange;
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
                if (this.path === undefined)
                    return this.sourceObject;
                return this.source.getValue(this.path);
            },
            set: function (value) {
                if (this.path === undefined)
                    return;
                //check if the value is really changed - strict equality
                var previousValue = this.source.getValue(this.path);
                if (previousValue === value)
                    return;
                this.source.setValue(this.path, value);
                if (this.notifyChange !== undefined)
                    this.notifyChange();
            },
            enumerable: true,
            configurable: true
        });
        return PathObjectBinding;
    })();
    DataBinding.PathObjectBinding = PathObjectBinding;
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
                var items = this.source.getValue(this.path);
                if (items === undefined)
                    return [];
                return items.map(function (item, index) {
                    return new PathObjectBinding(item, undefined, this.notifyChange);
                }, this);
            },
            enumerable: true,
            configurable: true
        });
        ArrayObjectBinding.prototype.add = function (defaultItem) {
            var items = this.source.getValue(this.path);
            if (items === undefined)
                return;
            if (defaultItem === undefined)
                defaultItem = {};
            items.push(defaultItem);
            if (this.notifyChange !== undefined)
                this.notifyChange();
        };
        ArrayObjectBinding.prototype.remove = function (itemToRemove) {
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
        return ArrayObjectBinding;
    })();
    DataBinding.ArrayObjectBinding = ArrayObjectBinding;
    /**
     It represents binding to relative path for parent object.
     */
    var PathParentBinding = (function () {
        function PathParentBinding(parentBinding, relativePath) {
            this.parentBinding = parentBinding;
            this.relativePath = relativePath;
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
                return this.source.getValue(this.path);
            },
            set: function (value) {
                //check if the value is really changed - strict equality
                var previousValue = this.source.getValue(this.path);
                if (previousValue === value)
                    return;
                this.source.setValue(this.path, value);
                if (this.notifyChange !== undefined)
                    this.notifyChange();
            },
            enumerable: true,
            configurable: true
        });
        return PathParentBinding;
    })();
    DataBinding.PathParentBinding = PathParentBinding;
    /**
     * React [LinkedStateMixin](http://facebook.github.io/react/docs/two-way-binding-helpers.html) is an easy way to express two-way data binding in React.
     *
     * React-binding comes with [BindToMixin](https://github.com/rsamec/react-binding) as extension to [LinkedStateMixin](http://facebook.github.io/react/docs/two-way-binding-helpers.html) two-way binding that supports binding to
     *     *
     *  +   object properties with path expression (Person.FirstName, Person.LastName, Person.Contact.Email)
     *  +   complex objects (json) with nested properties
     *  +   collection-based structures - arrays and lists
     */
    var BindToMixin = (function () {
        function BindToMixin() {
        }
        BindToMixin.prototype.createStateKeySetter = function (component, key) {
            return function () { return component.setState({ key: component.state[key] }); };
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
         * @returns {DataBinding.PathObjectBinding}
         */
        BindToMixin.prototype.bindToState = function (key, path) {
            return new PathObjectBinding(this["state"][key], path, this.createStateKeySetter(this, key));
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
         * @returns {DataBinding.PathParentBinding}
         */
        BindToMixin.prototype.bindTo = function (parent, path) {
            return new PathParentBinding(parent, path);
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
        BindToMixin.prototype.bindArrayToState = function (key, path) {
            return new ArrayObjectBinding(this["state"][key], path, this.createStateKeySetter(this, key));
        };
        return BindToMixin;
    })();
    DataBinding.BindToMixin = BindToMixin;
})(DataBinding || (DataBinding = {}));
function extractPrototype(clazz) {
    var proto = {};
    for (var key in clazz.prototype) {
        proto[key] = clazz.prototype[key];
    }
    return proto;
}
var BindToMixin = extractPrototype(DataBinding.BindToMixin);
module.exports = BindToMixin;
