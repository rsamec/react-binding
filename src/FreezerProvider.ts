var Freezer = require('freezer-js');
import { isArray,get, isObject, isIndex } from 'lodash';
var castPath = require('lodash/_castPath');
import { IPathObjectBinder, Path, isPathArray } from './DataBinding';
/**
 It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
 */
export default class FreezerPathObjectBinder implements IPathObjectBinder {

    private freezer;
    constructor(private source: any) {
        
        this.freezer = new Freezer(source);
    }
    public subscribe(updateFce) {
        this.freezer.on('update', function (state, prevState) {
            if (updateFce !== undefined) updateFce(state, prevState)
        }
        );
    }

    public getValue(path?: Path) {
        if (path === undefined) return this.freezer.get();
        var cursorPath = !isPathArray(path) ? castPath(path) : path;
        if (cursorPath.length === 0) return this.freezer.get();;

        var parent = this.getParent(cursorPath);
        //console.log(parent);
        if (parent === undefined) return;
        var property = cursorPath[cursorPath.length - 1];
        return parent[property];

    }

    public setValue(path: Path, value: string) {
        if (path === undefined) return;
        var cursorPath = !isPathArray(path) ? castPath(path) : path;
        if (cursorPath.length === 0) return;

        var parent = this.getParent(cursorPath);
        //console.log(parent);
        if (parent === undefined) return;
        var property = cursorPath[cursorPath.length - 1];
        var updated = parent.set(property, value);
        return updated;
    }

    private getParent(cursorPath: Array<string | number>) {
        if (cursorPath.length == 0) return;
        if (cursorPath.length == 1) return this.freezer.get();
        var source = this.freezer.get();
        var parentPath = cursorPath.slice(0, cursorPath.length - 1);
        var parent = get(source, parentPath);
        if (parent !== undefined) return parent;

        var updated = this.setWith(source, parentPath,{});
        return get(updated, parentPath);

    }

    setWith(object: any, path: Array<string | number>, value: any) {
        const length = path.length;
        const lastIndex = length - 1;

        let index = -1;
        let nested = object;

        while (nested != null && ++index < length) {
            const key = path[index];
            let newValue = value;

            if (index != lastIndex) {
                const objValue = nested[key];
                if (newValue === undefined) {
                    newValue = isObject(objValue)
                        ? objValue
                        : (isIndex(path[index + 1]) ? [] : {});
                }
            }
            //assignValue(nested, key, newValue);
            var updated = nested.set(key, newValue);
            nested = updated[key];
        }
        return nested;

    }
}

