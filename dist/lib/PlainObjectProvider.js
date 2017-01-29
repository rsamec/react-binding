var utils_1 = require('./utils');
/**
 It wraps getting and setting object properties by setting path expression (dotted path - e.g. "Data.Person.FirstName", "Data.Person.LastName")
 */
var PathObjectBinder = (function () {
    function PathObjectBinder(root, source) {
        this.root = root;
        this.source = source === undefined ? this.root : source;
    }
    PathObjectBinder.prototype.subscribe = function (updateFce) {
        // this.freezer.on('update',function(state,prevState){
        //     if (updateFce!==undefined) updateFce(state,prevState)}
        // );
    };
    PathObjectBinder.prototype.createNew = function (path, newItem) {
        var item = utils_1.followRef(this.root, newItem || this.getValue(path));
        //console.log(item);
        return new PathObjectBinder(this.root, item);
    };
    PathObjectBinder.prototype.getValue = function (path) {
        if (path === undefined)
            return this.source;
        var cursorPath = utils_1.castPath(path);
        if (cursorPath.length === 0)
            return this.source;
        var parent = this.getParent(cursorPath);
        if (parent === undefined)
            return;
        var property = cursorPath[cursorPath.length - 1];
        return parent[property];
    };
    PathObjectBinder.prototype.setValue = function (path, value) {
        if (path === undefined)
            return;
        var cursorPath = utils_1.castPath(path);
        if (cursorPath.length === 0)
            return;
        var parent = this.getParent(cursorPath);
        if (parent === undefined)
            return;
        var property = cursorPath[cursorPath.length - 1];
        //console.log(parent);
        parent[property] = value;
        //console.log(parent);
    };
    PathObjectBinder.prototype.getParent = function (cursorPath) {
        if (cursorPath.length == 0)
            return;
        if (cursorPath.length == 1)
            return utils_1.followRef(this.root, this.source);
        var parentPath = cursorPath.slice(0, cursorPath.length - 1);
        var parent = utils_1.baseGet(this.source, parentPath);
        if (parent !== undefined)
            return utils_1.followRef(this.root, parent);
        utils_1.baseSet(this.source, parentPath, {}, Object);
        return utils_1.baseGet(this.source, parentPath);
    };
    return PathObjectBinder;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PathObjectBinder;
