import { IPathObjectBinder, Path } from './DataBinding';
/**
 It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
 */
export default class FreezerPathObjectBinder implements IPathObjectBinder {
    private source;
    private root;
    constructor(rootParams: any, source?: any);
    createNew(path: Path, newItem?: any): IPathObjectBinder;
    subscribe(updateFce: any): void;
    getValue(path?: Path): any;
    setValue(path: Path, value: string): any;
    private getParent(cursorPath);
    setWith(object: any, path: Array<string | number>, value: any): any;
}
