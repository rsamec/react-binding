// Copyright JS Foundation and other contributors <https://js.foundation/>

// Based on Underscore.js, copyright Jeremy Ashkenas,
// DocumentCloud and Investigative Reporters & Editors <http://underscorejs.org/>

// This software consists of voluntary contributions made by many
// individuals. For exact contribution history, see the revision history
// available at https://github.com/lodash/lodash


/** Used as references for various `Number` constants. */
const MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
const reIsUint = /^(?:0|[1-9]\d*)$/;

export function isIndex(value: any, length?: number) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}
export function isObject(value) {
  const type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/** Used to match property names within property paths. */
const reLeadingDot = /^\./;
const rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/** Used to match backslashes in property paths. */
const reEscapeChar = /\\(\\)?/g;

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
export function stringToPath(string: string) {
  const result = [];
  if (reLeadingDot.test(string)) {
    result.push('');
  }
  string.replace(rePropName, (match, number, quote, string): any => {
    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
}

/** Used to match property names within property paths. */
const reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
const reIsPlainProp = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
export function isKey(value, object) {
  if (Array.isArray(value)) {
    return false;
  }
  const type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
    value == null || typeof value == 'symbol') {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

