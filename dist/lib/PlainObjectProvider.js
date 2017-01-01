/**
 It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
 */
var PathObjectBinder = (function () {
    function PathObjectBinder(source) {
        this.source = source;
    }
    PathObjectBinder.prototype.subscribe = function (updateFce) {
        // this.freezer.on('update',function(state,prevState){
        //     if (updateFce!==undefined) updateFce(state,prevState)}
        // );
    };
    PathObjectBinder.prototype.getValue = function (path) {
        var parent = this.getParent(path);
        if (parent === undefined)
            return;
        if (path === undefined)
            return parent;
        var property = PathObjectBinder.getProperty(path);
        return parent[property];
    };
    PathObjectBinder.prototype.setValue = function (path, value) {
        var parent = this.getParent(path);
        if (parent === undefined)
            return;
        var property = PathObjectBinder.getProperty(path);
        parent[property] = value;
    };
    PathObjectBinder.prototype.getParent = function (path) {
        if (path === undefined)
            return this.source;
        var last = path.lastIndexOf(".");
        return last != -1 ? this.string_to_ref(this.source, path.substring(0, last)) : this.source;
    };
    PathObjectBinder.getProperty = function (path) {
        var last = path.lastIndexOf(".");
        return last != -1 ? path.substring(last + 1, path.length) : path;
    };
    PathObjectBinder.prototype.string_to_ref = function (obj, s) {
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
    return PathObjectBinder;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PathObjectBinder;
