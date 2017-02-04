var Freezer = require('freezer-js');

import { baseSet as set, baseGet as get, castPath, followRef } from './utils';
import { isIndex, isObject } from './utils-lodash';
import { IPathObjectBinder, Path } from './DataBinding';
/**
 It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
 */
export default class FreezerPathObjectBinder implements IPathObjectBinder {

    private root;
    constructor(rootParams: any, private subSource?: any) {
        this.root = subSource === undefined ? new Freezer(rootParams) : rootParams;
        //this.source = source === undefined ? this.root : source;
    }
    private get source() {
        return this.subSource !== undefined?this.subSource.get():this.root.get();
    }
    public createNew(path: Path, newItem?: any): IPathObjectBinder {
        var item = newItem || this.getValue(path);
        //var item = followRef(this.root.get(), newItem || this.getValue(path));
        return new FreezerPathObjectBinder(this.root, new Freezer(item))
    }
    public subscribe(updateFce) {
        this.root.on('update', function (state, prevState) {
            //console.log(state);
            if (updateFce !== undefined) updateFce(state, prevState)
        }
        );
    }

    public getValue(path?: Path) {
        if (path === undefined) return this.source;
        var cursorPath = castPath(path);
        if (cursorPath.length === 0) return this.source;

        var parent = this.getParent(cursorPath);
        if (parent === undefined) return;
        var property = cursorPath[cursorPath.length - 1];
        return parent[property];

    }

    public setValue(path: Path, value: string) {
        if (path === undefined) return;
        var cursorPath = castPath(path);
        if (cursorPath.length === 0) return;

        var parent = this.getParent(cursorPath);

        if (parent === undefined) return;
        var property = cursorPath[cursorPath.length - 1];
        var updated = parent.set(property, value);
        return updated;
    }

    private getParent(cursorPath: Array<string | number>) {
        if (cursorPath.length == 0) return;
        var source = this.source;
        if (cursorPath.length == 1) return followRef(this.root.get(), source);

        var parentPath = cursorPath.slice(0, cursorPath.length - 1);
        var parent = get(source, parentPath);
        if (parent !== undefined) return followRef(this.root.get(), parent);

        var updated = this.setWith(source, parentPath, {});
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

