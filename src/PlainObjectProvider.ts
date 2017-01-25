import { get, set, setWith, isArray } from 'lodash';
var castPath = require('lodash/_castPath');

import { IPathObjectBinder, Path, isPathArray } from './DataBinding';
/**
 It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
 */
export default class PathObjectBinder implements IPathObjectBinder {

    constructor(private source: any) {
    }

    public subscribe(updateFce) {
        // this.freezer.on('update',function(state,prevState){
        //     if (updateFce!==undefined) updateFce(state,prevState)}
        // );
    }

    public getValue(path: Path) {
        if (path === undefined) return this.source;
        var cursorPath = !isPathArray(path) ? castPath(path) : path;
        if (cursorPath.length === 0) return this.source;

        var parent = this.getParent(cursorPath);
        if (parent === undefined) return;
        var property = cursorPath[cursorPath.length -1];
        return parent[property];

    }

    public setValue(path: Path, value: any) {
        if (path === undefined) return;
        var cursorPath = !isPathArray(path)?castPath(path):path;
        if (cursorPath.length === 0) return;
        
        var parent = this.getParent(cursorPath);
        if (parent === undefined) return;
        var property = cursorPath[cursorPath.length -1];
        return parent[property] = value;
    }
    private getParent(cursorPath:Array<string | number>)
    {
        if (cursorPath.length == 0) return;
        if (cursorPath.length == 1) return this.source; 
        var parentPath = cursorPath.slice(0, cursorPath.length - 1);
        var parent = get(this.source, parentPath);
        if (parent !== undefined) return parent;
        setWith(this.source, parentPath, {}, Object);       
        return get(this.source,parentPath);
    }    

}