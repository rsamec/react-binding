import { extendObservable, isObservable, autorun, observable, computed } from 'mobx';
import { IPathObjectBinder } from './DataBinding';
/**
 It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
 */
export default class MobxPathObjectBinder implements IPathObjectBinder {

    private mobxSource;
    private current;
    private previous;
    constructor(source: any) {
        this.mobxSource = observable(source);
        this.current = computed(() => JSON.stringify(this.mobxSource));
        //console.log('init');
        // autorun(() => { 
        //     console.log(this.json.get());//'safda');

        //     //if (updateFce!==undefined) updateFce(state,prevState)}
        // });
    }
    public subscribe(updateFce) {
        var previousState;
        if (updateFce !== undefined) autorun(
            () => {
                var current = this.current.get()
                updateFce(current, this.previous);
                this.previous = current;
            });
        //if (updateFce!==undefined) autorun(updateFce);
    }

    public getValue(path: string) {
        var parent = this.getParent(path);
        if (parent === undefined) return;
        if (path === undefined) return parent;
        var property = MobxPathObjectBinder.getProperty(path);
        var value = parent[property];
        if (value === undefined && !parent.hasOwnProperty(property)) {
            this.setValueAsObservable(parent, property);

        }
        return parent[property];
    }

    public setValue(path: string, value: string) {
        var parent = this.getParent(path);
        if (parent === undefined) return;
        var property = MobxPathObjectBinder.getProperty(path);
        //parent[property] = observable(value);
        if (isObservable(parent, property)) {
            parent[property] = value;
            return;
        }
        var newProps = {};
        newProps[property] = value;
        extendObservable(parent, newProps);
        //console.log(parent[property]);
    }
    private setValueAsObservable(parent: Object, property: string, value?: any) {
        var newProps = {};
        newProps[property] = value;
        extendObservable(parent, newProps);
    }

    private getParent(path: string) {
        if (path === undefined) return this.mobxSource;
        var last = path.lastIndexOf(".");
        return last != -1 ? this.string_to_ref(this.mobxSource, path.substring(0, last)) : this.mobxSource;
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

