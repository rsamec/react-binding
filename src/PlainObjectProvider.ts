import { IPathObjectBinder } from './DataBinding';

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

    public getValue(path: string) {
        var parent = this.getParent(path);
        if (parent === undefined) return;
        if (path === undefined) return parent;
        var property = PathObjectBinder.getProperty(path);
        return parent[property];
    }

    public setValue(path: string, value: string) {
        var parent = this.getParent(path);
        if (parent === undefined) return;
        var property = PathObjectBinder.getProperty(path);
        parent[property] = value;
    }

    private getParent(path: string) {
        if (path === undefined) return this.source;
        var last = path.lastIndexOf(".");
        return last != -1 ? this.string_to_ref(this.source, path.substring(0, last)) : this.source;
    }

    static getProperty(path): string {
        var last = path.lastIndexOf(".");
        return last != -1 ? path.substring(last + 1, path.length) : path;
    }

    private string_to_ref(obj, s) {
        var parts = s.split('.');

        //experimental - support for square brackets
        //var arrayExp = /\[(\d*)\]/;
        //var firstExp = parts[0];
        //var matches = arrayExp.exec(firstExp);
        //var newObj;
        //if (!!matches){
        //    firstExp =  firstExp.replace(matches[0],"");
        //    var newArray = obj[firstExp][matche];
        //    if (newArray === undefined) newArray = [];
        //    newObj = newArray[matches[1]];
        //}
        //else{
        //    newObj = obj[firstExp];
        //    if (newObj === undefined) newObj = obj[firstExp] = {};
        //}
        //var newObj = !!matches? obj[firstExp.replace(matches[0],"")][matches[1]]:obj[firstExp];

        var newObj = obj[parts[0]];
        if (newObj === undefined) newObj = obj[parts[0]] = {};
        if (!parts[1]) {
            return newObj
        }
        parts.splice(0, 1);
        var newString = parts.join('.');
        return this.string_to_ref(newObj, newString);
    }
}