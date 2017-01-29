var PlainObjectProvider_1 = require('./PlainObjectProvider');
var DataBinding_1 = require('./DataBinding');
var BinderCore = (function () {
    function BinderCore() {
    }
    BinderCore.bindTo = function (type, parent, path, converter, converterParams) {
        var converter = converterParams !== undefined ? new DataBinding_1.CurryConverter(converter, converterParams) : converter;
        return (parent instanceof DataBinding_1.PathObjectBinding || parent instanceof DataBinding_1.PathParentBinding) ? new DataBinding_1.PathParentBinding(parent, path, converter) : new DataBinding_1.PathObjectBinding(new type(parent), path, converter);
    };
    BinderCore.bindArrayTo = function (type, parent, path, converter, converterParams) {
        var converter = converterParams !== undefined ? new DataBinding_1.CurryConverter(converter, converterParams) : converter;
        return (parent instanceof DataBinding_1.PathObjectBinding || parent instanceof DataBinding_1.PathParentBinding) ? new DataBinding_1.ArrayParentBinding(parent, path, converter) : new DataBinding_1.ArrayObjectBinding(new type(parent), path, converter);
    };
    return BinderCore;
})();
exports.BinderCore = BinderCore;
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
        return new DataBinding_1.PathObjectBinding(new PlainObjectProvider_1.default(component["state"][key]), path, Binder.createStateKeySetter(component, key), converterParams !== undefined ? new DataBinding_1.CurryConverter(converter, converterParams) : converter);
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
        return BinderCore.bindTo(PlainObjectProvider_1.default, parent, path, converter, converterParams);
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
        return new DataBinding_1.ArrayObjectBinding(new PlainObjectProvider_1.default(component["state"][key]), path, Binder.createStateKeySetter(component, key));
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
    Binder.bindArrayTo = function (parent, path, converter, converterParams) {
        return BinderCore.bindArrayTo(PlainObjectProvider_1.default, parent, path, converter, converterParams);
    };
    return Binder;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Binder;
//export default Binder; 
