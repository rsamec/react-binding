import { get, set, setWith, isArray } from 'lodash';
import { extendObservable, isObservable, autorun, observable, computed } from 'mobx';
import { IPathObjectBinder,Path, isPathArray } from './DataBinding';
var castPath = require('lodash/_castPath');

/**
 It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
 */
export default class MobxPathObjectBinder implements IPathObjectBinder {

    private source;
    private current;
    private previous;
    constructor(sourceParam: any) {
        this.source = observable(sourceParam);
        //this.current = computed(() => JSON.stringify(this.mobxSource));
        //console.log('init');
        // autorun(() => { 
        //     console.log(this.json.get());//'safda');

        //     //if (updateFce!==undefined) updateFce(state,prevState)}
        // });
    }
    public subscribe(updateFce) {
        // var previousState;
        // if (updateFce !== undefined) autorun(
        //     () => {
        //         var current = this.current.get()
        //         updateFce(current, this.previous);
        //         this.previous = current;
        //     });
        // //if (updateFce!==undefined) autorun(updateFce);
    }
   
    public getValue(path: Path) {
        if (path === undefined) return this.source;
        var cursorPath = !isPathArray(path) ? castPath(path) : path;
        if (cursorPath.length === 0) return this.source;
        
        var parent = this.getParent(cursorPath);
        if (parent === undefined) return;
        
        var property = cursorPath[cursorPath.length -1];
        
        var value = parent[property];
        if (value === undefined && !parent.hasOwnProperty(property)) {
            this.setValueAsObservable(parent, property);

        }
        return parent[property];

    }

    public setValue(path: Path, value: any) {
        if (path === undefined) return;
        var cursorPath = !isPathArray(path)?castPath(path):path;
        if (cursorPath.length === 0) return;
        var parent = this.getParent(cursorPath);
        var property = cursorPath[cursorPath.length -1];
                
        if (isObservable(parent, property)) {
            parent[property] = value;
            return;
        }
        this.setValueAsObservable(parent,property,value);        

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
    private setValueAsObservable(parent: Object, property: string, value?: any) {
        var newProps = {};
        newProps[property] = value;
        extendObservable(parent, newProps);
    }    

}

