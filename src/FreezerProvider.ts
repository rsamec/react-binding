var Freezer = require('freezer-js');
import { IPathObjectBinder } from './DataBinding';
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

    public getValue(path?: string) {
        if (path === undefined) return this.freezer.get();
        var parent = this.getParent(path);
        if (parent === undefined) return;
        var property = FreezerPathObjectBinder.getProperty(path);
        return parent[property];
    }

    public setValue(path: string, value: string) {
        var parent = this.getParent(path);
        if (parent === undefined) return;
        var property = FreezerPathObjectBinder.getProperty(path);
        parent.set(property, value);
    }

    private getParent(path: string) {
        var state = this.freezer.get();
        var last = path.lastIndexOf(".");
        return last != -1 ? this.string_to_ref(state, path.substring(0, last)) : state;
    }

    static getProperty(path): string {
        var last = path.lastIndexOf(".");
        return last != -1 ? path.substring(last + 1, path.length) : path;
    }

    private string_to_ref(obj, s) {
        var parts = s.split('.');

        var newObj = obj[parts[0]];
        if (newObj === undefined) newObj = obj.set(parts[0], {});
        if (!parts[1]) {
            return newObj
        }
        parts.splice(0, 1);
        var newString = parts.join('.');
        return this.string_to_ref(newObj, newString);
    }
}

