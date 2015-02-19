module DataBinding{
    /*
     It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
     */
    export interface IPathObjectBinder{
        /*
         It gets value at the passed path expression.
         */
        getValue(path:string)
        /*
         It sets the passed value at the passed path.
         */
        setValue(path:string, value:any);
    }
    /*
     It represents function that is called when there is a change.
     */
    export interface INotifyChange {():void};
    export interface IRequestChange {(any):void};

    /*
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

    /*
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

    /*
     It represents binding to property at source object at a given path.
     */
    export class PathObjectBinding implements IPathObjectBinding{
        public source:IPathObjectBinder;

        constructor(private sourceObject:any,public path?:string, public notifyChange?:INotifyChange){
            this.source = new PathObjectBinder(this.sourceObject);
        }

        public get rquestChange():IRequestChange {return (value)=>{this.value=value;}}
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
    /*
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

    /*
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
    export class BindToMixin{

        private createStateKeySetter(component,key){
            return () => component.setState({key:component.state[key]});
        }

        public bindToState(key, path):IPathObjectBinding {
            return new PathObjectBinding(
                this["state"][key],
                path,
                this.createStateKeySetter(this, key)
                //ReactStateSetters.createStateKeySetter(this, key)
            );
        }

        public bindTo(parent, path): IPathObjectBinding {
            return new PathParentBinding(parent, path);
        }

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
