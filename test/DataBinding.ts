import * as BindTo from '../src/DataBinding';

import SimpleBinder from '../src/Binder';
import MobxBinder from '../src/MobxBinder';
import FreezerBinder from '../src/FreezerBinder';

import { DateValueConverter, PersonConverter, DateValueSuffixConverter, ArraySizeConverter, ArrayConverter } from './utils/converters';

var expect1 = require('expect.js');

var mapObject = function (obj, callback) {
    var result = {};
    Object.keys(obj).forEach(function (key) {
        result[key] = callback.call(obj, obj[key], key, obj);
    });
    return result;
};

var testSuite = (Binder: BindTo.BinderStatic) => {
    var initValues = { firstName: "Roman", lastName: "Samec", email: "email" };
    var changedValues = { firstName: "Roman changed", lastName: "Samec changed", email: "email changed" };

    var execAndVerifyPersonProperties = function (bindings, initValues, changedValues, verifyPaths:boolean =true) {

        var root = bindings["root"];
        var firstName = bindings["firstName"];
        var lastName = bindings["lastName"];
        var email = bindings["email"];

        root.source.subscribe((state, previous) => {
            //console.log(state, previous)
        });

        //verify pathes
        if (verifyPaths){
            expect1(firstName.path.join(".")).to.equal("Person.FirstName");
            expect1(lastName.path.join(".")).to.equal("Person.LastName");
            expect1(email.path.join(".")).to.equal("Person.Contact.Email");
        }
        //verify value getter
        expect1(firstName.value).to.equal(initValues.firstName);
        expect1(lastName.value).to.equal(initValues.lastName);
        expect1(email.value).to.equal(initValues.email);

        //verify initial values at the source object
        expect1(root.value.Person.FirstName).to.equal(initValues.firstName);
        expect1(root.value.Person.LastName).to.equal(initValues.lastName);
        expect1(root.value.Person.Contact.Email).to.equal(initValues.email);

        //exec -> setter -> change values
        firstName.value = changedValues.firstName;
        lastName.value = changedValues.lastName;
        email.value = changedValues.email;

        //verify value getter
        expect1(firstName.value).to.equal(changedValues.firstName);
        expect1(lastName.value).to.equal(changedValues.lastName);
        expect1(email.value).to.equal(changedValues.email);

        //verify changed values at the source object
        expect1(root.value.Person.FirstName).to.equal(changedValues.firstName);
        expect1(root.value.Person.LastName).to.equal(changedValues.lastName);
        expect1(root.value.Person.Contact.Email).to.equal(changedValues.email);


    };

    it('bind to properties by path', function () {
        //when
        var data = {
            Data: {
                "Person": {
                    "FirstName": initValues.firstName,
                    "LastName": initValues.lastName,
                    "Contact": {
                        "Email": initValues.email
                    }
                }
            }
        };

        //exec
        var root = Binder.bindTo(data.Data);
        var person = Binder.bindTo(root, "Person");
        var firstName = Binder.bindTo(person, "FirstName");
        var lastName = Binder.bindTo(person, "LastName");
        var email = Binder.bindTo(person, "Contact.Email");


        var nestedBindings = {
            root: root,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        expect1(person.path.join(".")).to.equal("Person");
        execAndVerifyPersonProperties(nestedBindings, initValues, changedValues);

    });

    it('bind to properties by path - empty object', function () {

        //when
        var data = {
            Data: {}
        };

        //exec
        var root = Binder.bindTo(data.Data);
        var firstName = Binder.bindTo(root, "Person.FirstName");
        var lastName = Binder.bindTo(root, "Person.LastName");
        var email = Binder.bindTo(root, "Person.Contact.Email");


        var flatBindings = {
            root: root,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(flatBindings, {}, changedValues);


    });

    //it('bind arrays - simple - square brackets', function () {
    //    //when
    //    var data = {
    //        Data: {
    //            Hobbies:[
    //                {HobbyName:"bandbington"},
    //                {HobbyName:"tennis"}
    //            ]
    //        }
    //    };
    //
    //    //exec
    //    //var root = Binder.bindTo(data.Data);
    //    //var email = Binder.bindTo(root,"Hobbies[0].HobbyName");
    //
    //    var row = Binder.bindTo(data,"Data.Hobbies[0]");
    //    var email = Binder.bindTo(row,"HobbyName");
    //
    //    //verify
    //    expect1(email.path).to.equal("Data.Hobbies[0].HobbyName");
    //
    //    email.value  = "value changed";
    //
    //    expect1(email.value).to.equal("value changed");
    //
    //    expect1(data.Data.Hobbies[0].HobbyName).to.equal("value changed");
    //
    //});


    it('binding arrays', function () {
        //when
        var data = {
            Data: {
                "People": [
                    {
                        "Person": {
                            "FirstName": initValues.firstName,
                            "LastName": initValues.lastName,
                            "Contact": {
                                "Email": initValues.email
                            }
                        }
                    },
                    {
                    }
                ]
            }
        };

        //exec
        var root = Binder.bindArrayTo(data.Data, "People");

        //first row
        var row = root.items[0];
        var person = Binder.bindTo(row, "Person");
        var firstName = Binder.bindTo(person, "FirstName");
        var lastName = Binder.bindTo(person, "LastName");
        var email = Binder.bindTo(person, "Contact.Email");


        var nestedBindings = {
            root: row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings, initValues, changedValues);


        //second row
        row = root.items[1];
        person = Binder.bindTo(row, "Person");
        firstName = Binder.bindTo(person, "FirstName");
        lastName = Binder.bindTo(person, "LastName");
        email = Binder.bindTo(person, "Contact.Email");


        nestedBindings = {
            root: row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings, {}, changedValues);
    });

    it('binding arrays - empty object', function () {
        //when
        var data = {
            Data: {}
        };

        //exec
        var root = Binder.bindArrayTo(data.Data, "People");

        root.add();

        //first row
        var row = root.items[0];
        var person = Binder.bindTo(row, "Person");
        var firstName = Binder.bindTo(person, "FirstName");
        var lastName = Binder.bindTo(person, "LastName");
        var email = Binder.bindTo(person, "Contact.Email");


        var nestedBindings = {
            root: row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings, {}, changedValues);

        root.add();
        //second row
        row = root.items[1];
        person = Binder.bindTo(row, "Person");
        firstName = Binder.bindTo(person, "FirstName");
        lastName = Binder.bindTo(person, "LastName");
        email = Binder.bindTo(person, "Contact.Email");


        nestedBindings = {
            root: row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings, {}, changedValues);
    });
    it('binding nested arrays', function () {

        var initValues1: any = mapObject(initValues, function (item) { return item + "1" });
        var initValues2: any = mapObject(initValues, function (item) { return item + "2" });
        var changedValues1: any = mapObject(changedValues, function (item) { return item + "1" });
        var changedValues2: any = mapObject(changedValues, function (item) { return item + "2" });

        //when
        var data = {
            Data: {
                "Hobbies": [
                    {
                        "People": [
                            {
                                "Person": {
                                    "FirstName": initValues1.firstName,
                                    "LastName": initValues1.lastName,
                                    "Contact": {
                                        "Email": initValues1.email
                                    }
                                }
                            },
                            {
                                "Person": {
                                    "FirstName": initValues2.firstName,
                                    "LastName": initValues2.lastName,
                                    "Contact": {
                                        "Email": initValues2.email
                                    }
                                }
                            },

                        ]
                    }
                ]
            }
        };
        //exec
        var root = Binder.bindArrayTo(data.Data, "Hobbies");
        var people = Binder.bindArrayTo(root.items[0], "People");

        //first person
        var row = people.items[0];
        var person = Binder.bindTo(row, "Person");
        var firstName = Binder.bindTo(person, "FirstName");
        var lastName = Binder.bindTo(person, "LastName");
        var email = Binder.bindTo(person, "Contact.Email");

        var nestedBindings = {
            root: row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings, initValues1, changedValues1);


        //second person
        row = people.items[1];
        person = Binder.bindTo(row, "Person");
        firstName = Binder.bindTo(person, "FirstName");
        lastName = Binder.bindTo(person, "LastName");
        email = Binder.bindTo(person, "Contact.Email");


        nestedBindings = {
            root: row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings, initValues2, changedValues2);

    });

    it('binding arrays - move up', function () {

        var initValues1: any = mapObject(initValues, function (item) { return item + "1" });
        var initValues2: any = mapObject(initValues, function (item) { return item + "2" });
        var initValues3: any = mapObject(initValues, function (item) { return item + "3" });

        //when
        var data = {
            Data: {
                "People": [
                    {
                        "Person": {
                            "FirstName": initValues1.firstName,
                            "LastName": initValues1.lastName,
                            "Contact": {
                                "Email": initValues1.email
                            }
                        }
                    },
                    {
                        "Person": {
                            "FirstName": initValues2.firstName,
                            "LastName": initValues2.lastName,
                            "Contact": {
                                "Email": initValues2.email
                            }
                        }
                    },
                    {
                        "Person": {
                            "FirstName": initValues3.firstName,
                            "LastName": initValues3.lastName,
                            "Contact": {
                                "Email": initValues3.email
                            }
                        }
                    }
                ]
            }
        };

        //exec
        var root = Binder.bindArrayTo(data.Data, "People");
        //root.move(0,2);
        root.move(0, 1);
        root.move(1, 2);

        //first row
        var row = root.items[0];
        var person = Binder.bindTo(row, "Person");
        var firstName = Binder.bindTo(person, "FirstName");
        var lastName = Binder.bindTo(person, "LastName");
        var email = Binder.bindTo(person, "Contact.Email");


        var nestedBindings = {
            root: row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings, initValues2, changedValues);

        //second row
        row = root.items[1];
        person = Binder.bindTo(row, "Person");
        firstName = Binder.bindTo(person, "FirstName");
        lastName = Binder.bindTo(person, "LastName");
        email = Binder.bindTo(person, "Contact.Email");


        nestedBindings = {
            root: row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings, initValues3, changedValues);

        //second row
        row = root.items[2];
        person = Binder.bindTo(row, "Person");
        firstName = Binder.bindTo(person, "FirstName");
        lastName = Binder.bindTo(person, "LastName");
        email = Binder.bindTo(person, "Contact.Email");


        nestedBindings = {
            root: row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings, initValues1, changedValues);


    });
    it('binding arrays - move down', function () {

        var initValues1: any = mapObject(initValues, function (item) { return item + "1" });
        var initValues2: any = mapObject(initValues, function (item) { return item + "2" });
        var initValues3: any = mapObject(initValues, function (item) { return item + "3" });

        //when
        var data = {
            Data: {
                "People": [
                    {
                        "Person": {
                            "FirstName": initValues1.firstName,
                            "LastName": initValues1.lastName,
                            "Contact": {
                                "Email": initValues1.email
                            }
                        }
                    },
                    {
                        "Person": {
                            "FirstName": initValues2.firstName,
                            "LastName": initValues2.lastName,
                            "Contact": {
                                "Email": initValues2.email
                            }
                        }
                    },
                    {
                        "Person": {
                            "FirstName": initValues3.firstName,
                            "LastName": initValues3.lastName,
                            "Contact": {
                                "Email": initValues3.email
                            }
                        }
                    }
                ]
            }
        };

        //exec
        var root = Binder.bindArrayTo(data.Data, "People");

        root.move(2, 1);
        root.move(1, 0);
        //root.move(2,0);

        //first row
        var row = root.items[0];
        var person = Binder.bindTo(row, "Person");
        var firstName = Binder.bindTo(person, "FirstName");
        var lastName = Binder.bindTo(person, "LastName");
        var email = Binder.bindTo(person, "Contact.Email");


        var nestedBindings = {
            root: row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings, initValues3, changedValues);

        //second row
        row = root.items[1];
        person = Binder.bindTo(row, "Person");
        firstName = Binder.bindTo(person, "FirstName");
        lastName = Binder.bindTo(person, "LastName");
        email = Binder.bindTo(person, "Contact.Email");


        nestedBindings = {
            root: row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings, initValues1, changedValues);

        //second row
        row = root.items[2];
        person = Binder.bindTo(row, "Person");
        firstName = Binder.bindTo(person, "FirstName");
        lastName = Binder.bindTo(person, "LastName");
        email = Binder.bindTo(person, "Contact.Email");


        nestedBindings = {
            root: row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings, initValues2, changedValues);


    });
    it('bind dates with value convertors', function () {

        var fromDefault = new Date(2015, 0, 1);
        var toDefault = new Date(2015, 0, 7);

        //when
        var data = {
            Data: {
                "Vacation": {
                    "From": fromDefault,
                    "To": toDefault
                }
            }
        };
        //exec
        var root = Binder.bindTo(data.Data);

        //exec
        var vacation = Binder.bindTo(root, "Vacation");

        var from = Binder.bindTo(vacation, "From", new DateValueConverter());
        var to = Binder.bindTo(vacation, "To", new DateValueConverter());

        //verify
        expect1(from.value).to.equal(fromDefault.toISOString().slice(0, 10));
        expect1(to.value).to.equal(toDefault.toISOString().slice(0, 10));


        //when
        var fromChanged = new Date(2015, 1, 13);
        var toChanged = new Date(2015, 1, 20);

        //exec value
        from.value = "2015/02/13";
        to.value = "2015/02/20";

        //verify
        expect1(root.value.Vacation.From.toISOString().slice(0, 10)).to.equal(fromChanged.toISOString().slice(0, 10));
        expect1(root.value.Vacation.To.toISOString().slice(0, 10)).to.equal(toChanged.toISOString().slice(0, 10));


    });

    it('bind dates with value convertors with parameters', function () {

        var fromDefault = new Date(2015, 0, 1);
        var toDefault = new Date(2015, 0, 7);

        var formatSuffix = "UTC";

        //when
        var data = {
            Data: {
                "Vacation": {
                    "From": fromDefault,
                    "To": toDefault
                }
            }
        };
        //exec
        var root = Binder.bindTo(data.Data);

        //exec
        var vacation = Binder.bindTo(root, "Vacation");

        var converter = new BindTo.CurryConverter(new DateValueSuffixConverter(), formatSuffix);


        var from = Binder.bindTo(vacation, "From", converter);
        var to = Binder.bindTo(vacation, "To", converter);

        //verify
        expect1(from.value).to.equal(fromDefault.toISOString().slice(0, 10) + formatSuffix);
        expect1(to.value).to.equal(toDefault.toISOString().slice(0, 10) + formatSuffix);


        //when
        var fromChanged = new Date(2015, 1, 13);
        var toChanged = new Date(2015, 1, 20);

        //exec value
        from.value = "2015/02/13" + formatSuffix;
        to.value = "2015/02/20" + formatSuffix;

        //verify
        expect1(root.value.Vacation.From.toISOString().slice(0, 10)).to.equal(fromChanged.toISOString().slice(0, 10));
        expect1(root.value.Vacation.To.toISOString().slice(0, 10)).to.equal(toChanged.toISOString().slice(0, 10));
    });

    it('binding arrays - direct array', function () {
        //when
        var data = { Employees: [{}, {}] };


        //exec
        var dataRoot = Binder.bindTo(data, "Employees");
        var root = Binder.bindArrayTo(dataRoot);


        //first row
        var row = root.items[0];
        var person = Binder.bindTo(row, "Person");
        var firstName = Binder.bindTo(person, "FirstName");
        var lastName = Binder.bindTo(person, "LastName");
        var email = Binder.bindTo(person, "Contact.Email");


        var nestedBindings = {
            root: row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings, {}, changedValues);

        //root.add();
        //second row
        row = root.items[1];
        person = Binder.bindTo(row, "Person");
        firstName = Binder.bindTo(person, "FirstName");
        lastName = Binder.bindTo(person, "LastName");
        email = Binder.bindTo(person, "Contact.Email");


        nestedBindings = {
            root: row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings, {}, changedValues);
    });

    it('binding arrays - using array size converters', function () {
        //when
        var data = { Count: 1 };


        //exec
        var dataRoot = Binder.bindTo(data, "Count");
        var root = Binder.bindArrayTo(dataRoot, undefined, new ArraySizeConverter());


        //first row
        var row = root.items[0];
        var person = Binder.bindTo(row, "Person");
        var firstName = Binder.bindTo(person, "FirstName");
        var lastName = Binder.bindTo(person, "LastName");
        var email = Binder.bindTo(person, "Contact.Email");


        var nestedBindings = {
            root: row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings, {}, changedValues);

        //root.add();
        dataRoot.value = 2;
        //second row
        row = root.items[1];
        person = Binder.bindTo(row, "Person");
        firstName = Binder.bindTo(person, "FirstName");
        lastName = Binder.bindTo(person, "LastName");
        email = Binder.bindTo(person, "Contact.Email");


        nestedBindings = {
            root: row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings, {}, changedValues);
    });

    it('binding arrays - using array converters', function () {
        //when
        var data = { Employees: [{}] };

        //exec
        var dataRoot = Binder.bindTo(data, "Employees", ArrayConverter);
        var root = Binder.bindArrayTo(dataRoot);


        //first row
        var row = root.items[0];
        var person = Binder.bindTo(row, "Person");
        var firstName = Binder.bindTo(person, "FirstName");
        var lastName = Binder.bindTo(person, "LastName");
        var email = Binder.bindTo(person, "Contact.Email");


        var nestedBindings = {
            root: row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings, {}, changedValues);

        root.add();
        //dataRoot.value = 2;
        //second row
        row = root.items[1];
        person = Binder.bindTo(row, "Person");
        firstName = Binder.bindTo(person, "FirstName");
        lastName = Binder.bindTo(person, "LastName");
        email = Binder.bindTo(person, "Contact.Email");


        nestedBindings = {
            root: row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings, {}, changedValues);
    });

    it('binding - root and parent property', function () {

        //setup
        const TIME_STAMP = new Date();

        var data = {
            Data: {
                "Person": {
                    "FirstName": initValues.firstName,
                    "LastName": initValues.lastName,
                    "Contact": {
                        "Email": initValues.email
                    }
                }
            }
        };


        var root = Binder.bindTo(data.Data);
        var person = Binder.bindTo(root, "Person");
        var firstName = Binder.bindTo(person, "FirstName");
        var lastName = Binder.bindTo(person, "LastName");
        var email = Binder.bindTo(person, "Contact.Email");

        //exec
        root['customCode'] = TIME_STAMP;

        //verify parent
        expect1(root.parent).to.equal(undefined);
        expect1(email.parent).to.equal(person);
        expect1(lastName.parent).to.equal(person);
        expect1(firstName.parent).to.equal(person);
        expect1(person.parent).to.equal(root);

        //verify root
        expect1(email.root['customCode']).to.equal(TIME_STAMP);


    });


    it('binding - root and parent property - nested arrays', function () {

        //setup
        const TIME_STAMP = new Date();

        var initValues1: any = mapObject(initValues, function (item) { return item + "1" });
        var initValues2: any = mapObject(initValues, function (item) { return item + "2" });
        var changedValues1: any = mapObject(changedValues, function (item) { return item + "1" });
        var changedValues2: any = mapObject(changedValues, function (item) { return item + "2" });

        //when
        var data = {
            Data: {
                "Hobbies": [
                    {
                        "People": [
                            {
                                "Person": {
                                    "FirstName": initValues1.firstName,
                                    "LastName": initValues1.lastName,
                                    "Contact": {
                                        "Email": initValues1.email
                                    }
                                }
                            },
                            {
                                "Person": {
                                    "FirstName": initValues2.firstName,
                                    "LastName": initValues2.lastName,
                                    "Contact": {
                                        "Email": initValues2.email
                                    }
                                }
                            },

                        ]
                    }
                ]
            }
        };

        //exec
        var root = Binder.bindArrayTo(data.Data, "Hobbies");
        var hobbieRow = root.items[0];
        var people = Binder.bindArrayTo(hobbieRow, "People");

        //first person
        var personRow = people.items[0];
        var person = Binder.bindTo(personRow, "Person");
        var firstName = Binder.bindTo(person, "FirstName");
        var lastName = Binder.bindTo(person, "LastName");
        var email = Binder.bindTo(person, "Contact.Email");

        //exec
        root['customCode'] = TIME_STAMP;

        //verify parent
        expect1(root.parent).to.equal(undefined);
        expect1(email.parent).to.equal(person);
        expect1(lastName.parent).to.equal(person);
        expect1(firstName.parent).to.equal(person);
        expect1(person.parent).to.equal(personRow);

        expect1(personRow.parent).to.equal(people);
        expect1(people.parent).to.equal(hobbieRow);
        expect1(hobbieRow.parent).to.equal(root);



        //verify root
        expect1(email.root['customCode']).to.equal(TIME_STAMP);

    });
    it('pathes as arrays', function () {

        var initValues1: any = mapObject(initValues, function (item) { return item + "1" });
        var initValues2: any = mapObject(initValues, function (item) { return item + "2" });
        var changedValues1: any = mapObject(changedValues, function (item) { return item + "1" });
        var changedValues2: any = mapObject(changedValues, function (item) { return item + "2" });

        //when
        var data = {
            Data: {
                "Hobbies": [
                    {
                        "People": [
                            {
                                "Person": {
                                    "FirstName": initValues1.firstName,
                                    "LastName": initValues1.lastName,
                                    "Contact": {
                                        "Email": initValues1.email
                                    }
                                }
                            },
                            {
                                "Person": {
                                    "FirstName": initValues2.firstName,
                                    "LastName": initValues2.lastName,
                                    "Contact": {
                                        "Email": initValues2.email
                                    }
                                }
                            },

                        ]
                    }
                ]
            }
        };
        //exec
        var root = Binder.bindTo(data,"Data");
        var hobbiesPath = ["Hobbies",0,"People"];
        // var root = Binder.bindArrayTo(data.Data, "Hobbies");
        // var people = Binder.bindArrayTo(root.items[0], "People");

        //first person
        
        var row = Binder.bindArrayTo(root, hobbiesPath).items[0];
        var personPath = hobbiesPath.concat([0,'Person']);
        var person = Binder.bindTo(root, personPath);
        var firstName = Binder.bindTo(root,personPath.concat("FirstName"))
        var lastName = Binder.bindTo(root, personPath.concat("LastName"));
        var email = Binder.bindTo(root,personPath.concat("Contact","Email"))

        var nestedBindings = {
            root: row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings, initValues1, changedValues1,false);


        //second person  
        row = Binder.bindArrayTo(root, hobbiesPath).items[1];
        personPath = hobbiesPath.concat([1,'Person']);
        person = Binder.bindTo(root, personPath);
        firstName = Binder.bindTo(root,personPath.concat("FirstName"))
        lastName = Binder.bindTo(root, personPath.concat("LastName"));
        email = Binder.bindTo(root,personPath.concat("Contact","Email"))


        nestedBindings = {
            root: row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };
        
        //verify
        execAndVerifyPersonProperties(nestedBindings, initValues2, changedValues2,false);

    });
    it('pathes as strings', function () {

        var initValues1: any = mapObject(initValues, function (item) { return item + "1" });
        var initValues2: any = mapObject(initValues, function (item) { return item + "2" });
        var changedValues1: any = mapObject(changedValues, function (item) { return item + "1" });
        var changedValues2: any = mapObject(changedValues, function (item) { return item + "2" });

        //when
        var data = {
            Data: {
                "Hobbies": [
                    {
                        "People": [
                            {
                                "Person": {
                                    "FirstName": initValues1.firstName,
                                    "LastName": initValues1.lastName,
                                    "Contact": {
                                        "Email": initValues1.email
                                    }
                                }
                            },
                            {
                                "Person": {
                                    "FirstName": initValues2.firstName,
                                    "LastName": initValues2.lastName,
                                    "Contact": {
                                        "Email": initValues2.email
                                    }
                                }
                            },

                        ]
                    }
                ]
            }
        };
        //exec
        var root = Binder.bindTo(data,"Data");
        // var root = Binder.bindArrayTo(data.Data, "Hobbies");
        // var people = Binder.bindArrayTo(root.items[0], "People");

        //first person
        var row = Binder.bindArrayTo(root, "Hobbies[0].People").items[0];
        var person = Binder.bindTo(root, "Hobbies[0].People[0].Person");
        var firstName = Binder.bindTo(root,"Hobbies[0].People[0].Person.FirstName")
        var lastName = Binder.bindTo(root, "Hobbies[0].People[0].Person.LastName");
        var email = Binder.bindTo(root,"Hobbies[0].People[0].Person.Contact.Email")

        var nestedBindings = {
            root: row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings, initValues1, changedValues1,false);


        //second person        
        row = Binder.bindArrayTo(root, "Hobbies[0].People").items[1];
        person = Binder.bindTo(root, "Hobbies[0].People[1].Person");
        firstName = Binder.bindTo(root,"Hobbies[0].People[1].Person.FirstName")
        lastName = Binder.bindTo(root, "Hobbies[0].People[1].Person.LastName");
        email = Binder.bindTo(root,"Hobbies[0].People[1].Person.Contact.Email")


        nestedBindings = {
            root: row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };
        
        //verify
        execAndVerifyPersonProperties(nestedBindings, initValues2, changedValues2,false);

    });

    it('binding - references', function () {

        //setup
        const TIME_STAMP = new Date();

        var initValues1: any = mapObject(initValues, function (item) { return item + "1" });
        var initValues2: any = mapObject(initValues, function (item) { return item + "2" });
        var changedValues1: any = mapObject(changedValues, function (item) { return item + "1" });
        var changedValues2: any = mapObject(changedValues, function (item) { return item + "2" });

        //when
        var data = {
            Data: {
                todosById: {
                    "44": {
                        name: "get milk from corner store",
                        done: false,
                        prerequisites: [{ $type: "ref", value: ["todosById", 54] }]
                    },
                    "54": {
                        name: "withdraw money from ATM",
                        done: false,
                        prerequisites: []
                    }
                },
                todos: [
                    { $type: "ref", value: ["todosById", 44] },
                    { $type: "ref", value: ["todosById", 54] }
                ]
            }
        };

        //exec
        var root = Binder.bindArrayTo(data.Data, "todos");
        var row = root.items[1];
        var task = Binder.bindTo(row, "done");

        var refTask1 = Binder.bindTo(data,"todos[0].prerequisites[0].done");
        var refTask2 = Binder.bindTo(data,"todos[1].done");

        //exec
        task.value = false;

        //verify parent
         //expect1(root.parent).to.equal(undefined);
        // expect1(email.parent).to.equal(person);
        // expect1(lastName.parent).to.equal(person);
        // expect1(firstName.parent).to.equal(person);
        // expect1(person.parent).to.equal(personRow);

        // expect1(personRow.parent).to.equal(people);
        // expect1(people.parent).to.equal(hobbieRow);
        // expect1(hobbieRow.parent).to.equal(root);



        // //verify root
        // expect1(email.root['customCode']).to.equal(TIME_STAMP);

    });
}
describe('DataBinding - Plain object provider', function () {
    testSuite(SimpleBinder);
});


describe('DataBinding - Freezer provider', function () {
    testSuite(FreezerBinder);
});
describe('DataBinding - Mobx provider', function () {
    testSuite(MobxBinder);
});
