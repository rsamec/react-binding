var mobx_1 = require('mobx');
/**
 It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
 */
var MobxPathObjectBinder = (function () {
    function MobxPathObjectBinder(source) {
        var _this = this;
        this.mobxSource = mobx_1.observable(source);
        this.current = mobx_1.computed(function () { return JSON.stringify(_this.mobxSource); });
        //console.log('init');
        // autorun(() => { 
        //     console.log(this.json.get());//'safda');
        //     //if (updateFce!==undefined) updateFce(state,prevState)}
        // });
    }
    MobxPathObjectBinder.prototype.subscribe = function (updateFce) {
        var _this = this;
        var previousState;
        if (updateFce !== undefined)
            mobx_1.autorun(function () {
                var current = _this.current.get();
                updateFce(current, _this.previous);
                _this.previous = current;
            });
        //if (updateFce!==undefined) autorun(updateFce);
    };
    MobxPathObjectBinder.prototype.getValue = function (path) {
        var parent = this.getParent(path);
        if (parent === undefined)
            return;
        if (path === undefined)
            return parent;
        var property = MobxPathObjectBinder.getProperty(path);
        var value = parent[property];
        if (value === undefined && !parent.hasOwnProperty(property)) {
            this.setValueAsObservable(parent, property);
        }
        return parent[property];
    };
    MobxPathObjectBinder.prototype.setValue = function (path, value) {
        var parent = this.getParent(path);
        if (parent === undefined)
            return;
        var property = MobxPathObjectBinder.getProperty(path);
        //parent[property] = observable(value);
        if (mobx_1.isObservable(parent, property)) {
            parent[property] = value;
            return;
        }
        var newProps = {};
        newProps[property] = value;
        mobx_1.extendObservable(parent, newProps);
        //console.log(parent[property]);
    };
    MobxPathObjectBinder.prototype.setValueAsObservable = function (parent, property, value) {
        var newProps = {};
        newProps[property] = value;
        mobx_1.extendObservable(parent, newProps);
    };
    MobxPathObjectBinder.prototype.getParent = function (path) {
        if (path === undefined)
            return this.mobxSource;
        var last = path.lastIndexOf(".");
        return last != -1 ? this.string_to_ref(this.mobxSource, path.substring(0, last)) : this.mobxSource;
    };
    MobxPathObjectBinder.getProperty = function (path) {
        var last = path.lastIndexOf(".");
        return last != -1 ? path.substring(last + 1, path.length) : path;
    };
    MobxPathObjectBinder.prototype.string_to_ref = function (obj, s) {
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
        if (newObj === undefined)
            newObj = obj[parts[0]] = {};
        if (!parts[1]) {
            return newObj;
        }
        parts.splice(0, 1);
        var newString = parts.join('.');
        return this.string_to_ref(newObj, newString);
    };
    return MobxPathObjectBinder;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MobxPathObjectBinder;
