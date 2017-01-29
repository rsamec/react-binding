import { IPathObjectBinder, Path } from './DataBinding';
/**
 It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
 */
export default class MobxPathObjectBinder implements IPathObjectBinder {
    private root;
    private source;
    private current;
    private previous;
    constructor(root: any, source?: any);
    createNew(path: Path, newItem?: any): IPathObjectBinder;
    subscribe(updateFce: any): void;
    getValue(path: Path): any;
    setValue(path: Path, value: any): void;
    private getParent(cursorPath);
    private setValueAsObservable(parent, property, value?);
}
