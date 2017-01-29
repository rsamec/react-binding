var utils_lodash_1 = require('./utils-lodash');
var $ref = "ref";
function castPath(value, object) {
    if (Array.isArray(value)) {
        return value;
    }
    return utils_lodash_1.isKey(value, object) ? [value] : utils_lodash_1.stringToPath(value == null ? '' : value.toString());
}
exports.castPath = castPath;
function followRef(root, ref) {
    if (ref === undefined)
        return ref;
    return ref.$type === $ref ? baseGet(root, ref.value) : ref;
}
exports.followRef = followRef;
function baseGet(root, path) {
    var index = 0;
    var length = path.length;
    var object = root;
    while (object != null && index < length) {
        object = followRef(root, object);
        object = object[path[index++]];
    }
    return (index && index == length) ? object : undefined;
}
exports.baseGet = baseGet;
function baseSet(object, path, value, customizer) {
    if (!utils_lodash_1.isObject(object)) {
        return object;
    }
    var length = path.length;
    var lastIndex = length - 1;
    var index = -1;
    var nested = object;
    while (nested != null && ++index < length) {
        var key = path[index];
        var newValue = value;
        if (index != lastIndex) {
            var objValue = nested[key];
            newValue = customizer ? customizer(objValue, key, nested) : undefined;
            if (newValue === undefined) {
                newValue = utils_lodash_1.isObject(objValue)
                    ? objValue
                    : (utils_lodash_1.isIndex(path[index + 1]) ? [] : {});
            }
        }
        nested[key] = newValue;
        nested = nested[key];
    }
    return nested;
}
exports.baseSet = baseSet;
