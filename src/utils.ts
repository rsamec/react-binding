
import { isKey, stringToPath, isObject, isIndex } from './utils-lodash';

const $ref = "ref";

export function castPath(value, object?): Array<string | number> {
    if (Array.isArray(value)) {
        return value;
    }
    return isKey(value, object) ? [value] : stringToPath(value == null ? '' : value.toString());
}
export function followRef(root, ref) {
    if (ref === undefined) return ref;
    return ref.$type === $ref ? baseGet(root, ref.value) : ref;
}
export function baseGet(root: any, path: Array<string | number>) {
    let index = 0;
    const length = path.length;
    var object = root;
    while (object != null && index < length) {
        object = followRef(root, object)
        object = object[path[index++]];
    }
    return (index && index == length) ? object : undefined;
}
export function baseSet(object: any, path: Array<string | number>, value: any, customizer?) {
    if (!isObject(object)) {
        return object;
    }
    const length = path.length;
    const lastIndex = length - 1;

    let index = -1;
    let nested = object;

    while (nested != null && ++index < length) {
        const key = path[index];
        let newValue = value;
        if (index != lastIndex) {
            const objValue = nested[key];
            newValue = customizer ? customizer(objValue, key, nested) : undefined;
            if (newValue === undefined) {
                newValue = isObject(objValue)
                    ? objValue
                    : (isIndex(path[index + 1]) ? [] : {});
            }
        }
        nested[key] = newValue;
        nested = nested[key];
    }
    return nested;

}
