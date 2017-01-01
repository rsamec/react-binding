"use strict";
var DateValueConverter = (function () {
    function DateValueConverter() {
    }
    DateValueConverter.prototype.format = function (value) {
        if (value === undefined)
            return value;
        return value.toISOString().slice(0, 10);
    };
    DateValueConverter.prototype.parse = function (value) {
        if (value === undefined)
            return value;
        var regPattern = "\\d{4}\\/\\d{2}\\/\\d{2}";
        var dateString = value.match(regPattern);
        return new Date(dateString);
    };
    return DateValueConverter;
}());
exports.DateValueConverter = DateValueConverter;
var PersonConverter = (function () {
    function PersonConverter() {
    }
    PersonConverter.prototype.format = function (value) {
        if (value === undefined)
            return value;
        return value.FirstName + ' ' + value.LastName;
    };
    return PersonConverter;
}());
exports.PersonConverter = PersonConverter;
var DateValueSuffixConverter = (function () {
    function DateValueSuffixConverter() {
    }
    DateValueSuffixConverter.prototype.format = function (value, parameters) {
        if (value === undefined)
            return value;
        if (parameters === undefined)
            parameters = "";
        return value.toISOString().slice(0, 10) + parameters;
    };
    DateValueSuffixConverter.prototype.parse = function (value) {
        if (value === undefined)
            return value;
        var regPattern = "\\d{4}\\/\\d{2}\\/\\d{2}";
        var dateString = value.match(regPattern);
        return new Date(dateString);
    };
    return DateValueSuffixConverter;
}());
exports.DateValueSuffixConverter = DateValueSuffixConverter;
;
var ArraySizeConverter = (function () {
    function ArraySizeConverter() {
    }
    ArraySizeConverter.prototype.format = function (count) {
        return Array.apply(0, Array(count))
            .map(function (element, index) {
            return { pageIndex: index };
        });
    };
    return ArraySizeConverter;
}());
exports.ArraySizeConverter = ArraySizeConverter;
var ArrayConverter = (function () {
    function ArrayConverter() {
    }
    ArrayConverter.prototype.format = function (input) {
        return !!input ? input.length : 0;
    };
    ArrayConverter.prototype.parse = function (count) {
        return Array.apply(0, Array(count))
            .map(function (element, index) {
            return {
                Person: {
                    "FirstName": "Roman " + index,
                    "LastName": "Samec " + index, Addresses: []
                }
            };
        });
    };
    return ArrayConverter;
}());
exports.ArrayConverter = ArrayConverter;
