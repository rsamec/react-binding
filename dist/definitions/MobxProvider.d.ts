import { IPathObjectBinder } from './DataBinding';
/**
 It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
 */
export default class MobxPathObjectBinder implements IPathObjectBinder {
    private mobxSource;
    private current;
    private previous;
    constructor(source: any);
    subscribe(updateFce: any): void;
    getValue(path: string): any;
    setValue(path: string, value: string): void;
    private setValueAsObservable(parent, property, value?);
    private getParent(path);
    static getProperty(path: any): string;
    private string_to_ref(obj, s);
}
