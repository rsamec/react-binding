/**
 * Two-way data binding for React.
 */
module DataBinding{
    /**
     It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
     */
    export interface IPathObjectBinder{
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
    export interface INotifyChange {():void};

    /**
     It represents change notifikcation function with changed value. It supports valueLink interface
     */
    export interface IRequestChange {(any):void};

    /**
     It represents binding to property at source object at a given path.
     */
    export interface IPathObjectBinding{
        value:any;
        source:IPathObjectBinder;

        notifyChange?:INotifyChange;
        requestChange?:IRequestChange;

        valueConverter?:any;
        path?:any;
    }

    /**
     It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
     */
    export class PathObjectBinder implements  IPathObjectBinder{

        constructor(private source:any) {}

        public getValue(path:string) {
            var parent = this.getParent(path);
            if (parent === undefined) return;
            var property = this.getProperty(path);
            return parent[property];
        }

        public setValue(path:string, value:string) {
            var parent = this.getParent(path);
            if (parent === undefined) return;
            var property = this.getProperty(path);
            parent[property] = value;
        }
        private getParent(path:string) {
            var last = path.lastIndexOf(".");
            return last != -1 ? this.string_to_ref(this.source, path.substring(0, last)) : this.source;
        }
        private getProperty(path):string {
            var last = path.lastIndexOf(".")
            return last != -1 ? path.substring(last + 1, path.length) : path;
        }
        private string_to_ref(obj, string) {
            var parts = string.split('.');
            var newObj = obj[parts[0]];
            if (!parts[1]){
                if (newObj === undefined) newObj = obj[parts[0]] = {};
                return newObj
            }
            if (newObj == undefined) return undefined;
            parts.splice(0, 1);
            var newString = parts.join('.');
            return this.string_to_ref(newObj, newString);
        }
    }

    /**
     It represents binding to property at source object at a given path.
     */
    export class PathObjectBinding implements IPathObjectBinding{
        public source:IPathObjectBinder;

        constructor(private sourceObject:any,public path?:string, public notifyChange?:INotifyChange){
            this.source = new PathObjectBinder(this.sourceObject);
        }

        public get requestChange():IRequestChange {return (value)=>{this.value=value;}}
        public get value(){
            if (this.path === undefined) return this.sourceObject;
            return this.source.getValue(this.path);}
        public set value(value:any) {
            if (this.path === undefined) return;

            //check if the value is really changed - strict equality
            var previousValue = this.source.getValue(this.path);
            if (previousValue === value) return;

            this.source.setValue(this.path,value);
            if (this.notifyChange !== undefined) this.notifyChange();
        }
    }
    /**
     It represents binding to property at source object at a given path.
     */
    export class ArrayObjectBinding{
        public source:IPathObjectBinder;

        constructor(private sourceObject:any,public path?:string, public notifyChange?:INotifyChange){
            this.source = new PathObjectBinder(this.sourceObject);
        }
        public get items():Array<IPathObjectBinding> {
            var items = this.source.getValue(this.path);
            if (items === undefined) return [];
            return items.map(function(item, index) {
                return new PathObjectBinding(item,undefined, this.notifyChange);
            },this);
        }

        public add(defaultItem?){
            var items = this.source.getValue(this.path);
            if (items === undefined) return;

            if (defaultItem === undefined) defaultItem = {}
            items.push(defaultItem);
            if (this.notifyChange !== undefined) this.notifyChange();
        }

        public remove(itemToRemove){
            var items = this.source.getValue(this.path);
            if (items === undefined) return;
            var index = items.indexOf(itemToRemove);
            if (index === -1) return;
            items.splice(index,1);

            if (this.notifyChange !== undefined) this.notifyChange();
        }
    }

    /**
     It represents binding to relative path for parent object.
     */
    export class PathParentBinding implements IPathObjectBinding{

        constructor(private parentBinding:IPathObjectBinding,public relativePath) {}

        //wrapped properties - delegate call to parent
        public get source():IPathObjectBinder {return this.parentBinding.source;}
        public get notifyChange(){return this.parentBinding.notifyChange;}
        public get requestChange():IRequestChange {return (value)=>{this.value=value;}}
        //concatenate path
        public get path():string {
            if (this.parentBinding.path === undefined) return this.relativePath;
            return [this.parentBinding.path,this.relativePath].join(".");
        }


        public get value(){return this.source.getValue(this.path);}
        public set value(value:any) {

            //check if the value is really changed - strict equality
            var previousValue = this.source.getValue(this.path);
            if (previousValue === value) return;

            this.source.setValue(this.path,value);
            if (this.notifyChange !== undefined) this.notifyChange();
        }
    }
    /**
     * React [LinkedStateMixin](http://facebook.github.io/react/docs/two-way-binding-helpers.html) is an easy way to express two-way data binding in React.
     *
     * React-binding comes with [BindToMixin](https://github.com/rsamec/react-binding) as extension to [LinkedStateMixin](http://facebook.github.io/react/docs/two-way-binding-helpers.html) two-way binding that supports binding to
     *     *
     *  +   object properties with path expression (Person.FirstName, Person.LastName, Person.Contact.Email)
     *  +   complex objects (json) with nested properties
     *  +   collection-based structures - arrays and lists
     */
    export class BindToMixin{

        private createStateKeySetter(component,key){
            return () => component.setState({key:component.state[key]});
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
         * @returns {DataBinding.PathObjectBinding}
         */
        public bindToState(key, path):IPathObjectBinding {
            return new PathObjectBinding(
                this["state"][key],
                path,
                this.createStateKeySetter(this, key)
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
         * @returns {DataBinding.PathParentBinding}
         */
        public bindTo(parent, path): IPathObjectBinding {
            return new PathParentBinding(parent, path);
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
        public bindArrayToState(key, path):ArrayObjectBinding {
            return new ArrayObjectBinding(
                this["state"][key],
                path,
                this.createStateKeySetter(this, key)
                //ReactStateSetters.createStateKeySetter(this, key)
            );
        }
    }
}

function extractPrototype<T>(clazz: { new (): T }): T {
    var proto: T = (<T>{});
    for (var key in clazz.prototype) {
        (<any>proto)[key] = clazz.prototype[key];
    }
    return proto;
}
var BindToMixin = extractPrototype<DataBinding.BindToMixin>(DataBinding.BindToMixin);
export = DataBinding;
