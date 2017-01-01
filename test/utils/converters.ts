
export class DateValueConverter {
    format(value) {
        if (value === undefined) return value;
        return value.toISOString().slice(0, 10);
    }

    parse(value) {
        if (value === undefined) return value;
        var regPattern = "\\d{4}\\/\\d{2}\\/\\d{2}";
        var dateString = value.match(regPattern);
        return new Date(dateString);
    }
}

export class PersonConverter {
    format(value) {
        if (value === undefined) return value;
        return value.FirstName + ' ' + value.LastName;
    }
}

export class DateValueSuffixConverter {
    format(value, parameters) {
        if (value === undefined) return value;
        if (parameters === undefined) parameters = "";
        return value.toISOString().slice(0, 10) + parameters;
    }

    parse(value) {
        if (value === undefined) return value;
        var regPattern = "\\d{4}\\/\\d{2}\\/\\d{2}";
        var dateString = value.match(regPattern);
        return new Date(dateString);
    }
};

export class ArraySizeConverter {
    format(count) {
        return Array.apply(0, Array(count))
            .map(function (element, index) {
                return { pageIndex: index };
            });
    }
}
export class ArrayConverter {
    format(input) {
        return !!input ? input.length : 0;
    }
    parse(count) {
        return Array.apply(0, Array(count))
            .map(function (element, index) {
                return {
                    Person: {
                        "FirstName": "Roman " + index,
                        "LastName": "Samec " + index, Addresses: []
                    }
                };
            });
    }
}
