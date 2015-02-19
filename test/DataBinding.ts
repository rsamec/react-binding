///<reference path='../typings/mocha/mocha.d.ts'/>
///<reference path='../typings/node/node.d.ts'/>
///<reference path='../src/BindToMixin.ts'/>


var Binding = require('../src/BindToMixin.js');
var expect1 = require('expect.js');

describe('DataBinding', function () {

    var execAndVerifyPersonProperties = function(root){
        //exec
        var person = new Binding.PathParentBinding(root,"Person");
        var firstName = new Binding.PathParentBinding(person,"FirstName");
        var lastName = new Binding.PathParentBinding(person,"LastName");
        var email = new Binding.PathParentBinding(person,"Contact.Email");

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
        var root = new Binding.PathObjectBinding(data.Data);

        //verify
        execAndVerifyPersonProperties(root);

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
                                "Email": "email"
                            }
                        }
                    }
                ]
            }
        };

        //exec
        var root = new Binding.ArrayObjectBinding(data,"Data.Hobbies");
        var firstPerson = root.items[0];

        //verify
        execAndVerifyPersonProperties(firstPerson);
    });
});