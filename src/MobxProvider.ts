import { baseSet as set, baseGet as get, castPath, followRef } from './utils';
import { extendObservable, isObservable, autorun, observable, computed } from 'mobx';
import { IPathObjectBinder,Path } from './DataBinding';


/**
 It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
 */
export default class MobxPathObjectBinder implements IPathObjectBinder {

    private root;
    private source;
    private current;
    private previous;
    constructor(root: any,source?:any) {
        this.root = observable(root);
        this.source = source=== undefined?this.root:source;
    }
    public createNew(path:Path,newItem?:any):IPathObjectBinder{
        var item = followRef(this.root,newItem || this.getValue(path))
        return new MobxPathObjectBinder(this.root,item)
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
        var cursorPath = castPath(path);
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
        var cursorPath = castPath(path);
        if (cursorPath.length === 0) return;
        var parent = this.getParent(cursorPath);
        var property = cursorPath[cursorPath.length -1];
                
        if (isObservable(parent, <string>property)) {
            parent[property] = value;
            return;
        }
        this.setValueAsObservable(parent,property,value);        

    }
    private getParent(cursorPath:Array<string | number>)
    {
        if (cursorPath.length == 0) return;
        if (cursorPath.length == 1) return followRef(this.root,this.source); 
        var parentPath = cursorPath.slice(0, cursorPath.length - 1);
        var parent = get(this.source, parentPath);
        if (parent !== undefined) return followRef(this.root,parent);
        set(this.source, parentPath, {}, Object);       
        return get(this.source,parentPath);
    }    
    
    private setValueAsObservable(parent: Object, property: string | number, value?: any) {
        var newProps = {};
        newProps[property] = value;
        extendObservable(parent, newProps);
    }    

}

