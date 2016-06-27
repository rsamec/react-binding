///<reference path='../typings/mocha/mocha.d.ts'/>
///<reference path='../typings/node/node.d.ts'/>
///<reference path='../src/DataBinding.ts'/>

import {DataBinding as BindTo} from '../src/DataBinding';
var expect1 = require('expect.js');

class DateValueConverter
{
    format(value){
        if (value === undefined) return value;
        return value.toISOString().slice(0, 10);
    }

    parse(value){
        if (value === undefined) return value;
        var regPattern = "\\d{4}\\/\\d{2}\\/\\d{2}";
        var dateString = value.match(regPattern);
        return new Date(dateString);
    }
}

class DateValueSuffixConverter
{
    format(value,parameters){
        if (value === undefined) return value;
        if (parameters === undefined) parameters ="";
        return value.toISOString().slice(0, 10) + parameters;
    }

    parse(value){
        if (value === undefined) return value;
        var regPattern = "\\d{4}\\/\\d{2}\\/\\d{2}";
        var dateString = value.match(regPattern);
        return new Date(dateString);
    }
};
var mapObject = function(obj, callback) {
    var result = {};
    Object.keys(obj).forEach(function (key) {
        result[key] = callback.call(obj, obj[key], key, obj);
    });
    return result;
};
describe('DataBinding', function () {

    var initValues = {firstName:"Roman",lastName:"Samec",email:"email"};
    var changedValues = { firstName: "Roman changed",lastName: "Samec changed",email:"email changed"};

    var execAndVerifyPersonProperties = function(bindings, initValues, changedValues){

        var root = bindings["root"];
        var firstName = bindings["firstName"];
        var lastName = bindings["lastName"];
        var email = bindings["email"];

        var sourceObj = root.value;

        //verify pathes
        expect1(firstName.path).to.equal("Person.FirstName");
        expect1(lastName.path).to.equal("Person.LastName");
        expect1(email.path).to.equal("Person.Contact.Email");

        //verify value getter
        expect1(firstName.value).to.equal(initValues.firstName);
        expect1(lastName.value).to.equal(initValues.lastName);
        expect1(email.value).to.equal(initValues.email);

        //verify initial values at the source object
        expect1(sourceObj.Person.FirstName).to.equal(initValues.firstName);
        expect1(sourceObj.Person.LastName).to.equal(initValues.lastName);
        expect1(sourceObj.Person.Contact.Email).to.equal(initValues.email);

        //exec -> setter -> change values
        firstName.value  =  changedValues.firstName;
        lastName.value  = changedValues.lastName;
        email.value  = changedValues.email;

        //verify value getter
        expect1(firstName.value).to.equal(changedValues.firstName);
        expect1(lastName.value).to.equal(changedValues.lastName);
        expect1(email.value).to.equal(changedValues.email);

        //verify changed values at the source object
        expect1(sourceObj.Person.FirstName).to.equal(changedValues.firstName);
        expect1(sourceObj.Person.LastName).to.equal(changedValues.lastName);
        expect1(sourceObj.Person.Contact.Email).to.equal(changedValues.email);

            
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
        var root = new BindTo.PathObjectBinding(data.Data);
        var person = new BindTo.PathParentBinding(root,"Person");
        var firstName = new BindTo.PathParentBinding(person,"FirstName");
        var lastName = new BindTo.PathParentBinding(person,"LastName");
        var email = new BindTo.PathParentBinding(person,"Contact.Email");


        var nestedBindings = {
            root:root,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        expect1(person.path).to.equal("Person");
        execAndVerifyPersonProperties(nestedBindings,initValues,changedValues);

    });

    it('bind to properties by path - empty object', function () {

       //when
        var data = {
            Data: {}
        };

        //exec
        var root = new BindTo.PathObjectBinding(data.Data);
        var firstName = new BindTo.PathParentBinding(root,"Person.FirstName");
        var lastName = new BindTo.PathParentBinding(root,"Person.LastName");
        var email = new BindTo.PathParentBinding(root,"Person.Contact.Email");


        var flatBindings = {
            root:root,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(flatBindings,{},changedValues);


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
    //    //var root = new BindTo.PathObjectBinding(data.Data);
    //    //var email = new BindTo.PathParentBinding(root,"Hobbies[0].HobbyName");
    //
    //    var row = new BindTo.PathObjectBinding(data,"Data.Hobbies[0]");
    //    var email = new BindTo.PathParentBinding(row,"HobbyName");
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
        var root = new BindTo.ArrayObjectBinding(data,"Data.People");

        //first row
        var row = root.items[0];
        var person = new BindTo.PathParentBinding(row,"Person");
        var firstName = new BindTo.PathParentBinding(person,"FirstName");
        var lastName = new BindTo.PathParentBinding(person,"LastName");
        var email = new BindTo.PathParentBinding(person,"Contact.Email");


        var nestedBindings = {
            root:row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings,initValues,changedValues);


        //second row
        row = root.items[1];
        person = new BindTo.PathParentBinding(row,"Person");
        firstName = new BindTo.PathParentBinding(person,"FirstName");
        lastName = new BindTo.PathParentBinding(person,"LastName");
        email = new BindTo.PathParentBinding(person,"Contact.Email");


        nestedBindings = {
            root:row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings,{},changedValues);
    });

    it('binding arrays - empty object', function () {
        //when
        var data = {
            Data: {}
        };

        //exec
        var root = new BindTo.ArrayObjectBinding(data,"Data.People");

        root.add();

        //first row
        var row = root.items[0];
        var person = new BindTo.PathParentBinding(row,"Person");
        var firstName = new BindTo.PathParentBinding(person,"FirstName");
        var lastName = new BindTo.PathParentBinding(person,"LastName");
        var email = new BindTo.PathParentBinding(person,"Contact.Email");


        var nestedBindings = {
            root:row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings,{},changedValues);

        root.add();
        //second row
        row = root.items[1];
        person = new BindTo.PathParentBinding(row,"Person");
        firstName = new BindTo.PathParentBinding(person,"FirstName");
        lastName = new BindTo.PathParentBinding(person,"LastName");
        email = new BindTo.PathParentBinding(person,"Contact.Email");


        nestedBindings = {
            root:row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings,{},changedValues);
    });
    it('binding nested arrays', function () {

       var initValues1:any = mapObject(initValues,function(item){return item + "1"});
       var initValues2:any = mapObject(initValues,function(item){return item + "2"});
       var changedValues1:any = mapObject(changedValues,function(item){return item + "1"});
       var changedValues2:any = mapObject(changedValues,function(item){return item + "2"});

        //when
        var data = {
            Data: {
                "Hobbies": [
                    {
                        "People":[
                            {
                                "Person":{
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
        var root = new BindTo.ArrayObjectBinding(data,"Data.Hobbies").items[0];
        var people = new BindTo.ArrayParentBinding(root,"People");

        //first person
        var row = people.items[0];
        var person = new BindTo.PathParentBinding(row,"Person");
        var firstName = new BindTo.PathParentBinding(person,"FirstName");
        var lastName = new BindTo.PathParentBinding(person,"LastName");
        var email = new BindTo.PathParentBinding(person,"Contact.Email");


        var nestedBindings = {
            root:row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings,initValues1,changedValues1);


        //second person
        row = people.items[1];
        person = new BindTo.PathParentBinding(row,"Person");
        firstName = new BindTo.PathParentBinding(person,"FirstName");
        lastName = new BindTo.PathParentBinding(person,"LastName");
        email = new BindTo.PathParentBinding(person,"Contact.Email");


        nestedBindings = {
            root:row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings,initValues2,changedValues2);

    });

    it('binding arrays - move up', function () {

        var initValues1:any = mapObject(initValues,function(item){return item + "1"});
        var initValues2:any = mapObject(initValues,function(item){return item + "2"});
        var initValues3:any = mapObject(initValues,function(item){return item + "3"});

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
        var root = new BindTo.ArrayObjectBinding(data,"Data.People");
        //root.move(0,2);
        root.move(0,1);
        root.move(1,2);

        //first row
        var row = root.items[0];
        var person = new BindTo.PathParentBinding(row,"Person");
        var firstName = new BindTo.PathParentBinding(person,"FirstName");
        var lastName = new BindTo.PathParentBinding(person,"LastName");
        var email = new BindTo.PathParentBinding(person,"Contact.Email");


        var nestedBindings = {
            root:row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings,initValues2,changedValues);

        //second row
        row = root.items[1];
        person = new BindTo.PathParentBinding(row,"Person");
        firstName = new BindTo.PathParentBinding(person,"FirstName");
        lastName = new BindTo.PathParentBinding(person,"LastName");
        email = new BindTo.PathParentBinding(person,"Contact.Email");


        nestedBindings = {
            root:row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings,initValues3,changedValues);

        //second row
        row = root.items[2];
        person = new BindTo.PathParentBinding(row,"Person");
        firstName = new BindTo.PathParentBinding(person,"FirstName");
        lastName = new BindTo.PathParentBinding(person,"LastName");
        email = new BindTo.PathParentBinding(person,"Contact.Email");


        nestedBindings = {
            root:row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings,initValues1,changedValues);


    });
    it('binding arrays - move down', function () {

        var initValues1:any = mapObject(initValues,function(item){return item + "1"});
        var initValues2:any = mapObject(initValues,function(item){return item + "2"});
        var initValues3:any = mapObject(initValues,function(item){return item + "3"});

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
        var root = new BindTo.ArrayObjectBinding(data,"Data.People");

        root.move(2,1);
        root.move(1,0);
        //root.move(2,0);

        //first row
        var row = root.items[0];
        var person = new BindTo.PathParentBinding(row,"Person");
        var firstName = new BindTo.PathParentBinding(person,"FirstName");
        var lastName = new BindTo.PathParentBinding(person,"LastName");
        var email = new BindTo.PathParentBinding(person,"Contact.Email");


        var nestedBindings = {
            root:row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings,initValues3,changedValues);

        //second row
        row = root.items[1];
        person = new BindTo.PathParentBinding(row,"Person");
        firstName = new BindTo.PathParentBinding(person,"FirstName");
        lastName = new BindTo.PathParentBinding(person,"LastName");
        email = new BindTo.PathParentBinding(person,"Contact.Email");


        nestedBindings = {
            root:row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings,initValues1,changedValues);

        //second row
        row = root.items[2];
        person = new BindTo.PathParentBinding(row,"Person");
        firstName = new BindTo.PathParentBinding(person,"FirstName");
        lastName = new BindTo.PathParentBinding(person,"LastName");
        email = new BindTo.PathParentBinding(person,"Contact.Email");


        nestedBindings = {
            root:row,
            firstName: firstName,
            lastName: lastName,
            email: email
        };

        //verify
        execAndVerifyPersonProperties(nestedBindings,initValues2,changedValues);


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
        var root = new BindTo.PathObjectBinding(data.Data);

        //exec
        var vacation = new BindTo.PathParentBinding(root,"Vacation");

        var from = new BindTo.PathParentBinding(vacation,"From",new DateValueConverter());
        var to = new BindTo.PathParentBinding(vacation,"To",new DateValueConverter());

        //verify
        expect1(from.value).to.equal(fromDefault.toISOString().slice(0, 10));
        expect1(to.value).to.equal(toDefault.toISOString().slice(0, 10));


        //when
        var fromChanged = new Date(2015,1,13);
        var toChanged = new Date(2015,1,20);

        //exec value
        from.value  = "2015/02/13";
        to.value  = "2015/02/20";

        //verify
        expect1(data.Data.Vacation.From.toISOString().slice(0,10)).to.equal(fromChanged.toISOString().slice(0,10));
        expect1(data.Data.Vacation.To.toISOString().slice(0,10)).to.equal(toChanged.toISOString().slice(0,10));


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
        var root = new BindTo.PathObjectBinding(data.Data);

        //exec
        var vacation = new BindTo.PathParentBinding(root,"Vacation");

        var converter = new BindTo.CurryConverter(new DateValueSuffixConverter(),formatSuffix);


        var from = new BindTo.PathParentBinding(vacation,"From",converter);
        var to = new BindTo.PathParentBinding(vacation,"To",converter);

        //verify
        expect1(from.value).to.equal(fromDefault.toISOString().slice(0, 10) + formatSuffix);
        expect1(to.value).to.equal(toDefault.toISOString().slice(0, 10) + formatSuffix);


        //when
        var fromChanged = new Date(2015,1,13);
        var toChanged = new Date(2015,1,20);

        //exec value
        from.value  = "2015/02/13" + formatSuffix;
        to.value  = "2015/02/20" + formatSuffix;

        //verify
        expect1(data.Data.Vacation.From.toISOString().slice(0,10)).to.equal(fromChanged.toISOString().slice(0,10));
        expect1(data.Data.Vacation.To.toISOString().slice(0,10)).to.equal(toChanged.toISOString().slice(0,10));
    });
});

