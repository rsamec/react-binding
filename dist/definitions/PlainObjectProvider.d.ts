import { IPathObjectBinder } from './DataBinding';
/**
 It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
 */
export default class PathObjectBinder implements IPathObjectBinder {
    private source;
    constructor(source: any);
    subscribe(updateFce: any): void;
    getValue(path: string): any;
    setValue(path: string, value: string): void;
    private getParent(path);
    static getProperty(path: any): string;
    private string_to_ref(obj, s);
}
