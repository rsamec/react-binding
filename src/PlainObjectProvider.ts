import { baseSet as set, baseGet as get, castPath, followRef } from './utils';
import { IPathObjectBinder, Path } from './DataBinding';
/**
 It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
 */
export default class PathObjectBinder implements IPathObjectBinder {

    private source: any;
    constructor(private root: any, source?: any) {
        this.source = source === undefined ? this.root : source;
    }

    public subscribe(updateFce) {
        // this.freezer.on('update',function(state,prevState){
        //     if (updateFce!==undefined) updateFce(state,prevState)}
        // );
    }
    public createNew(path: Path, newItem?: any): IPathObjectBinder {
        var item = followRef(this.root, newItem || this.getValue(path));
        //console.log(item);
        return new PathObjectBinder(this.root, item);
    }

    public getValue(path: Path) {
        if (path === undefined) return this.source;
        var cursorPath = castPath(path);
        if (cursorPath.length === 0) return this.source;

        var parent = this.getParent(cursorPath);
        if (parent === undefined) return;
        var property = cursorPath[cursorPath.length - 1];
        return parent[property];

    }

    public setValue(path: Path, value: any) {
        if (path === undefined) return;
        var cursorPath = castPath(path);
        if (cursorPath.length === 0) return;

        var parent = this.getParent(cursorPath);
        if (parent === undefined) return;
        var property = cursorPath[cursorPath.length - 1];
        //console.log(parent);
        parent[property] = value;
        //console.log(parent);
    }
    private getParent(cursorPath: Array<string | number>) {
        if (cursorPath.length == 0) return;
        if (cursorPath.length == 1) return followRef(this.root, this.source);
        var parentPath = cursorPath.slice(0, cursorPath.length - 1);
        var parent = get(this.source, parentPath);
        if (parent !== undefined) return followRef(this.root, parent);
        set(this.source, parentPath, {}, Object);
        return get(this.source, parentPath);
    }

}