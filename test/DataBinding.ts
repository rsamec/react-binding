///<reference path='../typings/mocha/mocha.d.ts'/>
///<reference path='../typings/node/node.d.ts'/>
///<reference path='../src/BindToMixin.ts'/>


var BindTo = require('../src/BindToMixin.js');
var expect1 = require('expect.js');

class DateValueConverter
{
    public format(value){
        if (value === undefined) return value;
        return value.toISOString().slice(0, 10);
    }

    public parse(value){
        if (value === undefined) return value;
        var regPattern = "\\d{4}\\/\\d{2}\\/\\d{2}";
        var dateString = value.match(regPattern);
        return new Date(dateString);
    }
}

class DateValueSuffixConverter
{
    public format(value,parameters){
        if (value === undefined) return value;
        if (parameters === undefined) parameters ="";
        return value.toISOString().slice(0, 10) + parameters;
    }

    public parse(value, parameters){
        if (value === undefined) return value;
        if (parameters === undefined) parameters ="";

        var regPattern = "\\d{4}\\/\\d{2}\\/\\d{2}";// + parameters;
        var dateString = value.match(regPattern);
        return new Date(dateString);
    }
}

describe('DataBinding', function () {

    var execAndVerifyPersonProperties = function(root){
        //exec
        var person = new BindTo.PathParentBinding(root,"Person");
        var firstName = new BindTo.PathParentBinding(person,"FirstName");
        var lastName = new BindTo.PathParentBinding(person,"LastName");
        var email = new BindTo.PathParentBinding(person,"Contact.Email");

        //verify
        expect1(person.path).to.equal("Person");
        expect1(firstName.path).to.equal("Person.FirstName");
        expect1(lastName.path).to.equal("Person.LastName");
        expect1(email.path).to.equal("Person.Contact.Email");


        expect1(firstName.value).to.equal("Roman");
        expect1(lastName.value).to.equal("Samec");
        expect1(email.value).to.equal("email");


        //exec value
        firstName.value  = "Roman changed";
        lastName.value  = "Samec changed";
        email.value  = "email changed";

        expect1(firstName.value).to.equal("Roman changed");
        expect1(lastName.value).to.equal("Samec changed");
        expect1(email.value).to.equal("email changed");
    }

    it('bind properties by root object', function () {
        //when
        var data = {
            Data: {
                "Person": {
                    "FirstName": "Roman",
                    "LastName": "Samec",
                    "Contact": {
                        "Email": "email"
                    }
                }
            }
        };


        //exec
        var root = new BindTo.PathObjectBinding(data.Data);

        //verify
        execAndVerifyPersonProperties(root);

    });

    it('bind properties by root object - long pathes without initialized empty object', function () {
        //when
        var data = {
            Data: {}
        };

        //exec
        var root = new BindTo.PathObjectBinding(data.Data);
        var email = new BindTo.PathParentBinding(root,"Person.Contact.Email");

        //verify
        expect1(email.path).to.equal("Person.Contact.Email");

        email.value  = "email changed";

        expect1(email.value).to.equal("email changed");


    });

    it('binding arrays', function () {
        //when
        var data = {
            Data: {
                "Hobbies": [
                    {
                        "Person": {
                            "FirstName": "Roman",
                            "LastName": "Samec",
                            "Contact": {
                                "Email": "email",
                                "Phone":{
                                    CountryCode:"420",
                                    Number:"999888777"
                                }
                            }
                        }
                    }
                ]
            }
        };

        //exec
        var root = new BindTo.ArrayObjectBinding(data,"Data.Hobbies");
        var firstPerson = root.items[0];

        //verify
        execAndVerifyPersonProperties(firstPerson);
    });

    it('binding nested arrays', function () {
        //when
        var data = {
            Data: {
                "Hobbies": [
                    {
                        "People":[
                            {
                                "FirstName": "Kent1",
                                "LastName": "Clark1",
                                "Contact": {
                                    "Email": "email1"
                                }
                            },
                            {
                                "FirstName": "Kent2",
                                "LastName": "Clark2",
                                "Contact": {
                                    "Email": "email2"
                                }
                            }

                        ]
                    }
                ]
            }
        };

        //exec
        var root = new BindTo.ArrayObjectBinding(data,"Data.Hobbies").items[0];
        var people = new BindTo.ArrayParentBinding(root,"People");

        var firstPerson = people.items[0];
        var secondPerson = people.items[1];

        var execAndVerifyProperties = function(person, suffix){

            //exec
            var firstName = new BindTo.PathParentBinding(person,"FirstName");
            var lastName = new BindTo.PathParentBinding(person,"LastName");
            var email = new BindTo.PathParentBinding(person,"Contact.Email");


            expect1(firstName.value).to.equal("Kent" + suffix);
            expect1(lastName.value).to.equal("Clark" + suffix);
            expect1(email.value).to.equal("email" + suffix);

            //exec value
            firstName.value  = "Roman changed";
            lastName.value  = "Samec changed";
            email.value  = "email changed";

            expect1(firstName.value).to.equal("Roman changed");
            expect1(lastName.value).to.equal("Samec changed");
            expect1(email.value).to.equal("email changed");
        }

        //verify
        execAndVerifyProperties(firstPerson,1);
        execAndVerifyProperties(secondPerson,2);
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

        var formatSuffix = "UTC"

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