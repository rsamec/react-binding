export interface BinderStatic {
    bindToState?(data: any, key: string, path?: string, converter?: IValueConverter, converterParams?: any): ObjectBinding;
    bindTo(parent: any, path?: string, converter?: IValueConverter, converterParams?: any): ObjectBinding;
    bindArrayToState?(data: any, key: string, path?: string, converter?: IValueConverter, converterParams?: any): ArrayBinding;
    bindArrayTo(parent: any, path?: string, converter?: IValueConverter, converterParams?: any): ArrayBinding;
}
export interface Binding {
    path?: string;
    parent: Binding;
    root: Binding;
}
export interface ObjectBinding extends Binding {
    value: any;
}
export interface ArrayBinding extends Binding {
    items: Array<ObjectBinding>;
    add(defautItem?: any): any;
    remove(itemToRemove: any): any;
    splice(start: number, deleteCount: number, elementsToAdd?: any): any;
    move(x: number, y: number): any;
}
/**x`
 * Two-way data binding for React.
 */
/**
 It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
 */
export interface IPathObjectBinder {
    /**
     It gets value at the passed path expression.
     */
    getValue(path?: string): any;
    /**
     It sets the passed value at the passed path.
     */
    setValue(path: string, value: any): any;
    subscribe(fce: any): void;
}
/**
 It represents change notification function. It is called whenever there is a change.
 */
export interface INotifyChange {
    (any?: any): void;
}
/**
 It represents change notifikcation function with changed value. It supports valueLink interface
 */
export interface IRequestChange {
    (any: any): void;
}
/**
 It represents binding to property at source object at a given path.
 */
export interface IPathObjectBinding extends ObjectBinding {
    source: IPathObjectBinder;
    provider: (data) => IPathObjectBinder;
    notifyChange?: INotifyChange;
    requestChange?: IRequestChange;
    valueConverter?: IValueConverter;
}
/**
 It represents binding to property at source object at a given path.
 */
export declare class PathObjectBinding implements IPathObjectBinding {
    sourceObject: any;
    provider: (data) => IPathObjectBinder;
    path: string;
    notifyChange: INotifyChange;
    valueConverter: IValueConverter;
    parentNode: Binding;
    source: IPathObjectBinder;
    constructor(sourceObject: any, provider: (data) => IPathObjectBinder, path?: string, notifyChange?: INotifyChange, valueConverter?: IValueConverter, parentNode?: Binding);
    requestChange: IRequestChange;
    root: Binding;
    parent: Binding;
    value: any;
}
/**
 It represents binding to property at source object at a given path.
 */
export declare class ArrayObjectBinding implements ArrayBinding {
    sourceObject: any;
    provider: (data) => IPathObjectBinder;
    path: string;
    notifyChange: INotifyChange;
    valueConverter: IValueConverter;
    source: IPathObjectBinder;
    constructor(sourceObject: any, provider: (data) => IPathObjectBinder, path?: string, notifyChange?: INotifyChange, valueConverter?: IValueConverter);
    parent: ArrayBinding;
    root: ArrayBinding;
    items: Array<IPathObjectBinding>;
    add(defaultItem?: any): void;
    remove(itemToRemove: any): void;
    splice(start: number, deleteCount: number, elementsToAdd?: any): any;
    move(x: number, y: number): void;
}
/**
 It represents binding to array using relative path to parent object.
 */
export declare class ArrayParentBinding implements ArrayBinding {
    private parentBinding;
    relativePath: string;
    valueConverter: IValueConverter;
    constructor(parentBinding: IPathObjectBinding, relativePath?: string, valueConverter?: IValueConverter);
    source: IPathObjectBinder;
    provider: (data) => IPathObjectBinder;
    root: Binding;
    parent: Binding;
    notifyChange: INotifyChange;
    path: string;
    private getItems();
    items: Array<IPathObjectBinding>;
    add(defaultItem?: any): void;
    remove(itemToRemove: any): void;
    splice(start: number, deleteCount: number, elementsToAdd?: any): any[];
    move(x: any, y: any): void;
}
/**
 It represents binding to relative path for parent object.
 */
export declare class PathParentBinding implements IPathObjectBinding {
    private parentBinding;
    relativePath: any;
    valueConverter: IValueConverter;
    constructor(parentBinding: IPathObjectBinding, relativePath: any, valueConverter?: IValueConverter);
    source: IPathObjectBinder;
    provider: (data) => IPathObjectBinder;
    root: Binding;
    parent: Binding;
    notifyChange: INotifyChange;
    requestChange: IRequestChange;
    path: string;
    value: any;
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
    format?(value: any, parameters?: any): any;
    /**
     * Convert value into another value before call binding setter. Typically from view to model(data).
     * @param value - target binding object (value)
     * @param parameters - enable parametrization of conversion
     */
    parse?(value: any, parameters?: any): any;
}
export declare class CurryConverter implements IValueConverter {
    private formatFce;
    private parseFce;
    constructor(converter: IValueConverter, args: any);
    private curryParameters(fn, args);
    format(value: any): any;
    parse(value: any): any;
}
