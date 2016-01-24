/**
 * Two-way data binding for React.
 */

    /**
     It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
     */
    export interface IPathObjectBinder {
        /**
         It gets value at the passed path expression.
         */
        getValue(path:string)
        /**
         It sets the passed value at the passed path.
         */
        setValue(path:string, value:any);
    }
    /**
     It represents change notification function. It is called whenever there is a change.
     */
    export interface INotifyChange {(any?):void
    }

    /**
     It represents change notifikcation function with changed value. It supports valueLink interface
     */
    export interface IRequestChange {(any):void
    }

    /**
     It represents binding to property at source object at a given path.
     */
    export interface IPathObjectBinding {
        value:any;
        source:IPathObjectBinder;

        notifyChange?:INotifyChange;
        requestChange?:IRequestChange;

        valueConverter?:IValueConverter;
        path?:any;
    }

    /**
     It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
     */
    export class PathObjectBinder implements IPathObjectBinder {

        constructor(private source:any) {
        }

        public getValue(path:string) {
            var parent = this.getParent(path);
            if (parent === undefined) return;
            var property = PathObjectBinder.getProperty(path);
            return parent[property];
        }

        public setValue(path:string, value:string) {
            var parent = this.getParent(path);
            if (parent === undefined) return;
            var property = PathObjectBinder.getProperty(path);
            parent[property] = value;
        }

        private getParent(path:string) {
            var last = path.lastIndexOf(".");
            return last != -1 ? this.string_to_ref(this.source, path.substring(0, last)) : this.source;
        }

        static getProperty(path):string {
            var last = path.lastIndexOf(".");
            return last != -1 ? path.substring(last + 1, path.length) : path;
        }

        private string_to_ref(obj, s) {
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
            if (newObj === undefined) newObj = obj[parts[0]] = {};
            if (!parts[1]) {
                return newObj
            }
            parts.splice(0, 1);
            var newString = parts.join('.');
            return this.string_to_ref(newObj, newString);
        }
    }

    /**
     It represents binding to property at source object at a given path.
     */
    export class PathObjectBinding implements IPathObjectBinding {
        public source:IPathObjectBinder;

        constructor(private sourceObject:any, public path?:string, public notifyChange?:INotifyChange, public valueConverter?:IValueConverter) {
            this.source = new PathObjectBinder(this.sourceObject);
        }

        public get requestChange():IRequestChange {
            return (value)=> {
                this.value = value;
            }
        }

        public get value() {
            var value = this.path === undefined ? this.sourceObject : this.source.getValue(this.path);
            //get value - optional call converter
            return this.valueConverter !== undefined ? this.valueConverter.format(value) : value;
        }

        public set value(value:any) {


            var previousValue = this.path === undefined ? this.sourceObject : this.source.getValue(this.path);
            var convertedValueToBeSet = this.valueConverter !== undefined ? this.valueConverter.parse(value) : value;

            //check if the value is really changed - strict equality
            if (previousValue === convertedValueToBeSet) return;

            if (this.path === undefined) {
                if (this.notifyChange !== undefined) this.notifyChange(convertedValueToBeSet);
            } else {
                this.source.setValue(this.path, convertedValueToBeSet);
                if (this.notifyChange !== undefined) this.notifyChange();
            }
        }
    }
    /**
     It represents binding to property at source object at a given path.
     */
    export class ArrayObjectBinding {
        public source:IPathObjectBinder;

        constructor(private sourceObject:any, public path?:string, public notifyChange?:INotifyChange) {
            this.source = new PathObjectBinder(this.sourceObject);
        }

        public get items():Array<IPathObjectBinding> {
            var items = this.path === undefined ? this.sourceObject : this.source.getValue(this.path);

            if (items === undefined) return [];
            return items.map(function (item) {
                return new PathObjectBinding(item, undefined, this.notifyChange);
            }, this);
        }

        public add(defaultItem?) {
            var items = this.path === undefined ? this.sourceObject : this.source.getValue(this.path);
            if (items === undefined) {
                this.source.setValue(this.path, []);
                items = this.source.getValue(this.path);
            }
            if (defaultItem === undefined) defaultItem = {};
            items.push(defaultItem);
            if (this.notifyChange !== undefined) this.notifyChange();
        }

        public remove(itemToRemove) {
            var items = this.path === undefined ? this.sourceObject : this.source.getValue(this.path);
            if (items === undefined) return;
            var index = items.indexOf(itemToRemove);
            if (index === -1) return;
            items.splice(index, 1);

            if (this.notifyChange !== undefined) this.notifyChange();
        }
        public splice(start:number,deleteCount:number,elementsToAdd?:any){
            var items = this.path === undefined ? this.sourceObject : this.source.getValue(this.path);
            if (items === undefined) return;
            return elementsToAdd?items.splice(start, deleteCount, elementsToAdd):items.splice(start,deleteCount);

            //if (this.notifyChange !== undefined) this.notifyChange();
        }
        public move(x,y){
            this.splice(y, 0, this.splice(x,1)[0]);
        }
    }

    /**
     It represents binding to array using relative path to parent object.
     */
    export class ArrayParentBinding {

        constructor(private parentBinding:IPathObjectBinding, public relativePath) {

        }

        //wrapped properties - delegate call to parent
        public get source():IPathObjectBinder {
            return this.parentBinding.source;
        }

        public get notifyChange() {
            return this.parentBinding.notifyChange;
        }

        public set notifyChange(value:INotifyChange) {
            this.parentBinding.notifyChange = value;
        }

        //concatenate path
        public get path():string {
            if (this.parentBinding.path === undefined) return this.relativePath;
            return [this.parentBinding.path, this.relativePath].join(".");
        }

        public get items():Array<IPathObjectBinding> {
            if (this.source === undefined) return [];
            var items = this.source.getValue(this.path);

            if (items === undefined) return [];
            return items.map(function (item) {
                return new PathObjectBinding(item, undefined, this.notifyChange);
            }, this);
        }

        public add(defaultItem?) {
            var items = this.source.getValue(this.path);
            if (items === undefined) {
                this.source.setValue(this.path, []);
                items = this.source.getValue(this.path);
            }

            if (defaultItem === undefined) defaultItem = {};
            items.push(defaultItem);
            if (this.notifyChange !== undefined) this.notifyChange();
        }

        public remove(itemToRemove) {
            var items = this.source.getValue(this.path);
            if (items === undefined) return;
            var index = items.indexOf(itemToRemove);
            if (index === -1) return;
            items.splice(index, 1);

            if (this.notifyChange !== undefined) this.notifyChange();
        }
    }

    /**
     It represents binding to relative path for parent object.
     */
    export class PathParentBinding implements IPathObjectBinding {

        //converter:any;
        constructor(private parentBinding:IPathObjectBinding, public relativePath, public valueConverter?:IValueConverter) {
            //this.converter.format = Utils.partial(valueConverter,.partial()
        }

        //wrapped properties - delegate call to parent
        public get source():IPathObjectBinder {
            return this.parentBinding.source;
        }

        public get notifyChange() {
            return this.parentBinding.notifyChange;
        }

        public set notifyChange(value:INotifyChange) {
            this.parentBinding.notifyChange = value;
        }

        public get requestChange():IRequestChange {
            return (value)=> {
                this.value = value;
            }
        }

        //concatenate path
        public get path():string {
            if (this.parentBinding.path === undefined) return this.relativePath;
            return [this.parentBinding.path, this.relativePath].join(".");
        }


        public get value() {
            var value = this.source.getValue(this.path);
            //get value - optional call converter
            return this.valueConverter !== undefined ? this.valueConverter.format(value) : value;
        }

        public set value(value:any) {

            //check if the value is really changed - strict equality
            var previousValue = this.source.getValue(this.path);
            var convertedValueToBeSet = this.valueConverter !== undefined ? this.valueConverter.parse(value) : value;

            if (previousValue === convertedValueToBeSet) return;

            //set value - optional call converter
            this.source.setValue(this.path, convertedValueToBeSet);
            if (this.notifyChange !== undefined) this.notifyChange();
        }
    }
    /**
     *  Provides a way to apply custom logic to a binding.
     *  It enables to make bi-directional convertions between source (data) and target (view) binding.
     *
     *  +   apply various formats to values
     *  +   parse values from user input
     */
    export interface IValueConverter{
        /**
         * Convert value into another value before return binding getter. Typically from model(data) to view.
         * @param value - source binding object (value)
         * @param parameters - enable parametrization of conversion
         */
        format?(value,parameters?);

        /**
         * Convert value into another value before call binding setter. Typically from view to model(data).
         * @param value - target binding object (value)
         * @param parameters - enable parametrization of conversion
         */
        parse?(value,parameters?);
    }

    export class CurryConverter implements IValueConverter {

        private formatFce;
        private parseFce;

        constructor(converter:IValueConverter, args:any) {
            this.formatFce = this.curryParameters(converter.format, [args]);
            this.parseFce = this.curryParameters(converter.parse, [args]);
        }

        private curryParameters(fn,args) {
            return function () {
                return fn.apply(this, Array.prototype.slice.call(arguments).concat(args));
            };
        }
        public format(value){
            return this.formatFce(value);
        }
        public parse(value) {
            return this.parseFce(value);
        }

    }

export const DataBinding =  {
    PathObjectBinding:PathObjectBinding,
    PathParentBinding:PathParentBinding,
    ArrayObjectBinding:ArrayObjectBinding,
    ArrayParentBinding:ArrayParentBinding,
    CurryConverter:CurryConverter
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
export class Binder {

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
    static bindToState(component, key, path, converter?:IValueConverter, converterParams?):IPathObjectBinding {
        return new PathObjectBinding(
            component["state"][key],
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
    static bindTo(parent, path, converter?, converterParams?):IPathObjectBinding {
        return new PathParentBinding(parent, path, converterParams !== undefined ? new CurryConverter(converter, converterParams) : converter);
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
    static bindArrayToState(component, key, path):ArrayObjectBinding {
        return new ArrayObjectBinding(
            component["state"][key],
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
    static bindArrayTo(parent, path):ArrayParentBinding {
        return new ArrayParentBinding(parent, path);
    }
}
export default Binder;