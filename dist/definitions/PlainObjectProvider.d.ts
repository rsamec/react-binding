import { IPathObjectBinder, Path } from './DataBinding';
/**
 It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
 */
export default class PathObjectBinder implements IPathObjectBinder {
    private root;
    private source;
    constructor(root: any, source?: any);
    subscribe(updateFce: any): void;
    createNew(path: Path, newItem?: any): IPathObjectBinder;
    getValue(path: Path): any;
    setValue(path: Path, value: any): void;
    private getParent(cursorPath);
}
