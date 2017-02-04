var Freezer = require('freezer-js');
var expect1 = require('expect.js');

import MobxBinder from '../src/MobxBinder';
import { PersonConverter } from './utils/converters';
import { observable, reaction } from 'mobx';


describe('DataBinding - Mobx reactions', function () {

    var initValues = { firstName: "Roman", lastName: "Samec", email: "email" };
    var changedValues = { firstName: "Roman changed", lastName: "Samec changed", email: "email changed" };

    it('bind values and check reactions', function () {
        //when
        var data = {
            Data: {
                "Person": {
                    // "FirstName": initValues.firstName,
                    // "LastName": initValues.lastName,
                    // "Contact": {
                    //     "Email": initValues.email
                    // }
                }
            }
        };

        //exec
        var root = MobxBinder.bindTo(data.Data);
        //var person = Binder.bindTo(root, "Person");
        var firstName = MobxBinder.bindTo(root, "Person.FirstName");
        var lastName = MobxBinder.bindTo(root, "Person.LastName");
        var email = MobxBinder.bindTo(root, "Person.Contact.Email");

        var converter = new PersonConverter();

        //exec
        var fullName = MobxBinder.bindTo(root, "Person", converter);



        //verify

        root.source.subscribe((state, previous) => {
            //console.log(state, previous)
        });


        reaction("Person converter",
            () => { return fullName.value },
            (val) => {
                //console.log(val)
            }, true);

        //verify pathes
        expect1(firstName.path.join(".")).to.equal("Person.FirstName");
        expect1(lastName.path.join(".")).to.equal("Person.LastName");
        expect1(email.path.join(".")).to.equal("Person.Contact.Email");

        //verify value getter
        // expect1(firstName.value).to.equal(initValues.firstName);
        // expect1(lastName.value).to.equal(initValues.lastName);
        // expect1(email.value).to.equal(initValues.email);

        //verify initial values at the source object
        // expect1(root.value.Person.FirstName).to.equal(initValues.firstName);
        // expect1(root.value.Person.LastName).to.equal(initValues.lastName);
        // expect1(root.value.Person.Contact.Email).to.equal(initValues.email);

        //exec -> setter -> change values
        firstName.value = initValues.firstName;
        lastName.value = initValues.lastName;
        email.value = initValues.email;


        // reaction("Person converter 2",
        // () => {
        //     return fullName.value
        // },
        // (val) => {console.log(val)},true);


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
    });
});

/*
describe('Freezer test', function () {

    // Let's create a freezer object
    var freezer = new Freezer({
        app: {
            human: { 0: {} },
            dog: {}
        }
    });


    // Listen to changes in the state
    freezer.on('update', function (currentState, prevState) {
        // currentState will have the new state for your app
        // prevState contains the old state, in case you need
        // to do some comparisons
        console.log('I was updated');
    });

    it('bind values and check reactions', function (done) {
        // Let's get the frozen data stored

        let state = freezer.get();

        // setTimeout(() => {state.app.human.set(0, { firstName: 'Bernd' })},10);
        // setTimeout(() => {state.app.dog.set(99, { name: 'Brutus' })},10);

        setTimeout(() => {


            state.app.human.set(0, { firstName: 'Bernd' });
            state.app.dog.set(99, { name: 'Brutus' });

            //console.log( state.app === freezer.get().app);
            console.log(JSON.stringify(freezer.get()));

            //console.log(JSON.stringify(state.app));
            setTimeout(() => {
                let state = freezer.get();
                state.app.human.set(0, Object.assign({}, { lastName: 'Wessels', dog: state.app.dog[99] }, state.app.human[0]));

                setTimeout(() => {
                    let state = freezer.get();
                    state.app.dog.set(99, Object.assign({}, { age: 88 }, state.app.dog[99]));


                    //refersh state;
                    state = freezer.get();

                    console.log(JSON.stringify(state));

                    //human
                    expect1(state.app.human[0].dog.name).to.equal("Brutus");
                    expect1(state.app.human[0].dog.age).to.equal(88)

                    //dog
                    expect1(state.app.dog[99].name).to.equal("Brutus");
                    expect1(state.app.dog[99].age).to.equal(88);

                    done();

                }, 100);

            }, 100);

        }, 100);


    });
});
describe('Freezer pivot test', function () {

    // Let's create a freezer object
    var freezer = new Freezer({
        people: {
            John: { age: 23 },
            Alice: { age: 40 }
        }
    });

    var state = freezer.get();
    var john = state.people.John;
    var alice = state.people.Alice;

    state.people.set("Karel", {})


    it('bind values and check reactions', function (done) {
        // Let's get the frozen data stored

        // If we don't pivot, the updated node is returned
        // update = freezer.get().people.John.set({ age: 18 });
        // console.log(update); // {age: 18}
        // Listen to changes in the state
        freezer.on('update', function (currentState, prevState) {
            // currentState will have the new state for your app
            // prevState contains the old state, in case you need
            // to do some comparisons
            console.log('I was updated');
            console.log(currentState);
            console.log(freezer.get());

            done();

        });
        setTimeout(function () {
            john.set({ age: 18 });
        }, 10);


        setTimeout(function () {
            alice.set({ age: 30 });
        }, 10);


        // If we want to update two people at
        // a time we need to pivot
        // var update = freezer.get().people.pivot()
        //     .John.set({ age: 30 })
        //     .Alice.set({ age: 30 })
        //     ;
        //console.log(update);

    });
});
*/

describe('Freezer props test', function () {

    var data = observable({
        FirstName: 'Roman',
        LastName: 'Samec'
    });

    // Let's create a freezer object
    var freezer = new Freezer({
        boxes: [
            {
                name: 'Input_FirstName',
                props: {
                    valueLink: {}
                }
            },
            {
                name: 'Input_LastName',
                props: {
                    valueLink: {}
                }
            },
            {
                name: 'LastName',
                bindings: {
                    content: () => { return data.LastName }
                },
                props: {
                    //content: 'Samec'
                }
            },
            {
                name: 'FullName',
                bindings: {
                    content: () => { return data.FirstName + data.LastName }
                },
                props: {
                    //content: 'Roman Samec'
                }
            }]
    });

    var state = freezer.get();


    it('bind values and check reactions', function (done) {
        // Let's get the frozen data stored

        for (var i = 0; i !== state.boxes.length; i++) {
            let box = state.boxes[i];
            if (box.bindings === undefined) {

                //box.props.set('valueLink',{});
                continue;
            }
        }
        state = freezer.get();


        for (var i = 0; i !== state.boxes.length; i++) {
            let currentCursor: Array<string | number> = ['boxes'];
            let box = state.boxes[i];
            currentCursor.push(i);
            for (let prop in box.bindings) {
                let bindingProp = box.bindings[prop];
                let props = box.props;
                //currentCursor.push(prop);
                reaction(box.name, bindingProp,
                    (val) => {
                        //get(freezer.get(), currentCursor).set(prop, val);
                        //props.set(prop, val);
                        //console.log(currentCursor.join(','))
                    }, false);
            }
        }

        // Listen to changes in the state
        freezer.on('update', function (currentState, prevState) {
            // currentState will have the new state for your app
            // prevState contains the old state, in case you need
            // to do some comparisons
            //console.log('I was updated');
            //console.log(currentState);

            //var newState = freezer.get();
            var newState = currentState;
            //console.log(JSON.stringify(newState));

            //expect1(newState.boxes[2].props.content).to.equal("Smith");
            //expect1(newState.boxes[3].props.content).to.equal("RomanSmith");

            //done();

        });



        setTimeout(function () {
            data.LastName = "Smith";

            setTimeout(function () {
                data.LastName = "Smith 2";

                setTimeout(function () {
                    data.LastName = "Smith 3";

                    done();
                }, 10);
            }, 10);
        }, 10);



        // If we want to update two people at
        // a time we need to pivot
        // var update = freezer.get().people.pivot()
        //     .John.set({ age: 30 })
        //     .Alice.set({ age: 30 })
        //     ;
        //console.log(update);

    });
});
