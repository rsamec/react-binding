import Provider from './PlainObjectProvider';
import { IPathObjectBinder, IPathObjectBinding, IValueConverter, PathObjectBinding, ArrayObjectBinding, PathParentBinding, ArrayParentBinding, CurryConverter } from './DataBinding';


export class BinderCore {

    static bindTo(type: { new (data): IPathObjectBinder }, parent, path?: string, converter?, converterParams?): IPathObjectBinding {
        var converter = converterParams !== undefined ? new CurryConverter(converter, converterParams) : converter;
        return (parent instanceof PathObjectBinding || parent instanceof PathParentBinding) ? new PathParentBinding(parent, path, converter) : new PathObjectBinding(parent, (data) => new type(data), path, converter);
    }


    static bindArrayTo(type: { new (data): IPathObjectBinder }, parent, path?: string, converter?, converterParams?): any {
        var converter = converterParams !== undefined ? new CurryConverter(converter, converterParams) : converter;
        return (parent instanceof PathObjectBinding || parent instanceof PathParentBinding) ? new ArrayParentBinding(parent, path, converter) : new ArrayObjectBinding(parent, (data) => new type(data), path, converter);
    }
}
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
export default class Binder {

    static createStateKeySetter(component, key) {
        var partialState = {};

        return (value?) => {
            partialState[key] = (value !== undefined) ? value : component.state[key];
            component.setState(partialState);
        }
    }

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
    static bindToState(component, key: string, path?: string, converter?: IValueConverter, converterParams?): IPathObjectBinding {
        return new PathObjectBinding(
            component["state"][key],
            (data) => new Provider(data),
            path,
            Binder.createStateKeySetter(component, key),
            converterParams !== undefined ? new CurryConverter(converter, converterParams) : converter
            //ReactStateSetters.createStateKeySetter(this, key)
        );
    }

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
    static bindTo(parent, path?: string, converter?, converterParams?): IPathObjectBinding {
        return BinderCore.bindTo(Provider, parent, path, converter, converterParams);
    }

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
    static bindArrayToState(component, key: string, path?: string): ArrayObjectBinding {
        return new ArrayObjectBinding(
            component["state"][key],
            (data) => new Provider(data),
            path,
            Binder.createStateKeySetter(component, key)
            //ReactStateSetters.createStateKeySetter(this, key)
        );
    }


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
    static bindArrayTo(parent, path?: string, converter?, converterParams?): any {
        return BinderCore.bindArrayTo(Provider, parent, path, converter, converterParams);
    }
}
//export default Binder;