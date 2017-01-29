import { castPath } from "./utils";

export interface BinderStatic {
    bindToState?(data, key: string, path?: Path, converter?: IValueConverter, converterParams?: any): ObjectBinding
    bindTo(parent, path?: Path, converter?: IValueConverter, converterParams?: any): ObjectBinding
    bindArrayToState?(data, key: string, path?: Path, converter?: IValueConverter, converterParams?: any): ArrayBinding
    bindArrayTo(parent, path?: Path, converter?: IValueConverter, converterParams?: any): ArrayBinding
}
export interface Binding {
    path?: Array<string | number>;
    parent: Binding;
    root: Binding;
}
export interface ObjectBinding extends Binding {
    value: any;
}
export interface ArrayBinding extends Binding {
    items: Array<ObjectBinding>;
    add(defautItem?: any);
    remove(itemToRemove: any);
    splice(start: number, deleteCount: number, elementsToAdd?: any);
    move(x: number, y: number);
}
export type Path = string | Array<string | number>;


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
    getValue(path?: Path)
    /**
     It sets the passed value at the passed path.
     */
    setValue(path: Path, value: any);

    subscribe(fce): void;
}
/**
 It represents change notification function. It is called whenever there is a change.
 */
export interface INotifyChange {
    (any?): void
}

/**
 It represents change notifikcation function with changed value. It supports valueLink interface
 */
export interface IRequestChange {
    (any): void
}

/**
 It represents binding to property at source object at a given path.
 */
export interface IPathObjectBinding extends ObjectBinding {
    //value: any;
    source: IPathObjectBinder;

    notifyChange?: INotifyChange;
    requestChange?: IRequestChange;

    valueConverter?: IValueConverter;
    //path?: any;
}
/**
 It represents binding to property at source object at a given path.
 */
export class PathObjectBinding implements IPathObjectBinding {

    //public source: IPathObjectBinder;
    public path: Array<string | number>;
    constructor(public source: IPathObjectBinder, rootPath?: Path, public notifyChange?: INotifyChange, public valueConverter?: IValueConverter, public parentNode?: Binding) {
        this.path = rootPath === undefined ? [] : castPath(rootPath);
    }

    public get requestChange(): IRequestChange {
        return (value) => { this.value = value; }
    }
    public get root(): Binding {
        return this.parentNode !== undefined ? this.parentNode.root : this;
    }
    public get parent(): Binding {
        return this.parentNode !== undefined ? this.parentNode : undefined;
    }

    public get value() {
        var value = this.path === undefined ? this.source.getValue() : this.source.getValue(this.path);
        //get value - optional call converter
        return this.valueConverter !== undefined ? this.valueConverter.format(value) : value;
    }

    public set value(value: any) {

        var previousValue = this.path === undefined ? this.source.getValue() : this.source.getValue(this.path);
        var convertedValueToBeSet = this.valueConverter !== undefined ? this.valueConverter.parse(value) : value;

        //check if the value is really changed - strict equality
        if (previousValue !== undefined && previousValue === convertedValueToBeSet) return;

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

export class ArrayObjectBinding implements ArrayBinding {

    public path: Array<string | number>;
    constructor(public source: IPathObjectBinder, rootPath?: Path, public notifyChange?: INotifyChange, public valueConverter?: IValueConverter) {
        this.path = rootPath === undefined ? [] : castPath(rootPath);
    }

    public get parent(): ArrayBinding {
        return undefined;
    }
    public get root(): ArrayBinding {
        return this;
    }

    public get items(): Array<IPathObjectBinding> {
        var items = this.path === undefined ? this.source.getValue() : this.source.getValue(this.path);

        if (items === undefined) return [];
        return items.map(function (item, index) {
            return new PathObjectBinding(this.source.createNew(this.path.concat(index)), undefined, this.notifyChange, undefined, this);
        }, this);
    }

    public add(defaultItem?) {
        var items = this.path === undefined ? this.source.getValue() : this.source.getValue(this.path);
        if (items === undefined) {
            this.source.setValue(this.path, []);
            items = this.source.getValue(this.path);
        }
        if (defaultItem === undefined) defaultItem = {};
        items.push(defaultItem);
        if (this.notifyChange !== undefined) this.notifyChange();
    }

    public remove(itemToRemove) {
        var items = this.path === undefined ? this.source.getValue() : this.source.getValue(this.path);
        if (items === undefined) return;
        var index = items.indexOf(itemToRemove);
        if (index === -1) return;
        items.splice(index, 1);

        if (this.notifyChange !== undefined) this.notifyChange();
    }


    public splice(start: number, deleteCount: number, elementsToAdd?: any) {
        var items = this.path === undefined ? this.source.getValue() : this.source.getValue(this.path);
        if (items === undefined) return;
        return elementsToAdd ? items.splice(start, deleteCount, elementsToAdd) : items.splice(start, deleteCount);

        //if (this.notifyChange !== undefined) this.notifyChange();
    }
    public move(x: number, y: number) {
        var items = this.path === undefined ? this.source.getValue() : this.source.getValue(this.path);
        if (items === undefined) return;
        //@TODO: use more effective way to clone array
        var itemsCloned = JSON.parse(JSON.stringify(items));

        itemsCloned.splice(y, 0, itemsCloned.splice(x, 1)[0]);
        this.source.setValue(this.path, itemsCloned);
    }
}

/**
 It represents binding to array using relative path to parent object.
 */
export class ArrayParentBinding implements ArrayBinding {
    public relativePath: Array<string | number>;
    constructor(private parentBinding: IPathObjectBinding, subPath?: Path, public valueConverter?: IValueConverter) {
        this.relativePath = subPath === undefined ? [] : castPath(subPath);
    }

    //wrapped properties - delegate call to parent
    public get source(): IPathObjectBinder {
        return this.parentBinding.source;
    }
    public get root(): Binding {
        return this.parentBinding.root;
    }
    public get parent(): Binding {
        return this.parentBinding;
    }

    public get notifyChange() {
        return this.parentBinding.notifyChange;
    }

    public set notifyChange(value: INotifyChange) {
        this.parentBinding.notifyChange = value;
    }

    //concatenate path
    public get path(): Array<string | number> {

        if (this.parentBinding.path === undefined) return this.relativePath;
        if (this.relativePath === undefined) return this.parentBinding.path;
        return this.parentBinding.path.concat(this.relativePath);
    }
    private getItems(): Array<any> {
        if (this.source === undefined) return;
        var value = this.source.getValue(this.path);
        return this.valueConverter !== undefined ? this.valueConverter.format(value) : value;
    }
    public get items(): Array<IPathObjectBinding> {
        var items = this.getItems();

        if (items === undefined) return [];
        return items.map(function (item, index) {
            //item._parentBinding = this;            
            return new PathObjectBinding(this.source.createNew(this.path.concat(index), item), undefined, this.notifyChange, undefined, this);
        }, this);
    }

    public add(defaultItem?) {
        var items = this.getItems();
        if (items === undefined) {
            this.source.setValue(this.path, []);
            items = this.source.getValue(this.path);
        }

        if (defaultItem === undefined) defaultItem = {};
        items.push(defaultItem);
        if (this.notifyChange !== undefined) this.notifyChange();
    }

    public remove(itemToRemove) {
        var items = this.getItems();
        if (items === undefined) return;
        var index = items.indexOf(itemToRemove);
        if (index === -1) return;
        items.splice(index, 1);

        if (this.notifyChange !== undefined) this.notifyChange();
    }
    public splice(start: number, deleteCount: number, elementsToAdd?: any) {
        var items = this.getItems();
        if (items === undefined) return;
        return elementsToAdd ? items.splice(start, deleteCount, elementsToAdd) : items.splice(start, deleteCount);

        //if (this.notifyChange !== undefined) this.notifyChange();
    }
    public move(x, y) {
        this.splice(y, 0, this.splice(x, 1)[0]);
        if (this.notifyChange !== undefined) this.notifyChange();
    }
}

/**
 It represents binding to relative path for parent object.
 */
export class PathParentBinding implements IPathObjectBinding {

    public relativePath: Array<string | number>;
    constructor(private parentBinding: IPathObjectBinding, subPath: Path, public valueConverter?: IValueConverter) {
        this.relativePath = subPath === undefined ? [] : castPath(subPath);
    }

    //wrapped properties - delegate call to parent
    public get source(): IPathObjectBinder {
        return this.parentBinding.source;
    }

    public get root(): Binding {
        return this.parentBinding.root;
    }
    public get parent(): Binding {
        return this.parentBinding;
    }


    public get notifyChange() {
        return this.parentBinding.notifyChange;
    }

    public set notifyChange(value: INotifyChange) {
        this.parentBinding.notifyChange = value;
    }

    public get requestChange(): IRequestChange {
        return (value) => {
            this.value = value;
        }
    }

    //concatenate path
    public get path(): Array<string | number> {
        if (this.parentBinding.path === undefined) return this.relativePath;
        return this.parentBinding.path.concat(this.relativePath);
    }


    public get value() {
        var value = this.source.getValue(this.path);
        //get value - optional call converter
        return this.valueConverter !== undefined ? this.valueConverter.format(value) : value;
    }

    public set value(value: any) {

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
export interface IValueConverter {
    /**
     * Convert value into another value before return binding getter. Typically from model(data) to view.
     * @param value - source binding object (value)
     * @param parameters - enable parametrization of conversion
     */
    format?(value, parameters?);

    /**
     * Convert value into another value before call binding setter. Typically from view to model(data).
     * @param value - target binding object (value)
     * @param parameters - enable parametrization of conversion
     */
    parse?(value, parameters?);
}

export class CurryConverter implements IValueConverter {

    private formatFce;
    private parseFce;

    constructor(converter: IValueConverter, args: any) {
        this.formatFce = this.curryParameters(converter.format, [args]);
        this.parseFce = this.curryParameters(converter.parse, [args]);
    }

    private curryParameters(fn, args) {
        return function () {
            return fn.apply(this, Array.prototype.slice.call(arguments).concat(args));
        };
    }
    public format(value) {
        return this.formatFce(value);
    }
    public parse(value) {
        return this.parseFce(value);
    }

}