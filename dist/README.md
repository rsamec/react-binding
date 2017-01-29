# react-binding

React-binding is lightweight utility for two-way data binding in [React][react].

``` js
import React from 'react';
import ReactDOM from 'react-dom';
import Binder from 'react-binding';

export default class Form extends React.Component {
  constructor(props){
    super(props);
    this.state = {data: {}};
  },
  render {
    return (
      <div>
        <input valueLink={Binder.bindToState(this,"data", "Employee.FirstName")} />
        <div>FirstName: {this.state.data.Employee.FirstName}</div>
      </div>
    )}
});

ReactDOM.render(
  <Form />,
  document.getElementById('content')
);

```
## Features:

+   No dependencies.
+   Minimal interface - using path with dot notation.
+   Support for complex objects.
+   Support for collection-based structures - arrays and lists.
+   Support for value converters.
+   No need to define initial values, nested structures. Binder creates this for you.
+   Support concept for references to allow JSON to be used to represent graph information.

[react-binding](https://github.com/rsamec/react-binding) offers two-way data binding support for:

+   object properties with path expression (dot notation)
    +   Binder.bindToState(this,"data","__Employee.FirstName__");
    +   Binder.bindToState(this,"data","__Employee.Contact.Email__");
+   complex objects (json) with __nested properties__
    +   Binder.bindTo(__employee__,"__FirstName__");
    +   Binder.bindTo(__employee__,"__Contact.Email__");
+   collection-based structures - arrays and lists
    +   model={Binder.bindArrayToState(this,"data","__Hobbies__")}
        +   this.props.model.__items__.map(function(item){ return (<Hobby model={hobby}/>);})
        +   this.props.model.__add()__
        +   this.props.model.__remove(item)__
+   supports for "value/requestChange" interface also to enable to use [ReactLink][valueLink] attribute
    +   valueLink={Binder.bindTo(employee,"FirstName")}
+   enables binding with value converters
    +   supports both directions - __format__ (toView) and __parse__ (fromView)
    +   support for converter parameter - valueLink={Binder.bindToState(this,"data", "Duration.From",__converter, "DD.MM.YYYY"__)}
    +   converter parameter can be data-bound - valueLink={Binder.bindToState(this,"data", "Duration.From",converter, __this.state.format__)}
+   usable with any css frameworks
    +   [react-bootstrap][reactBootstrap]
    +   [material-ui][materialUi]

# Basic principle

Each bindTo return and uses interface called "value/onChange".
Each bindTo component is passed a value (to render it to UI) as well as setter to a value that triggers a re-render (typically at the top location).

The re-render is done in the component where you bind to the state via (bindToState, bindArrayToState).

BindTo can be nested - composed to support components composition. Then path is concatenate according to parent-child relationship.


# Get started

* [node package manager][npm]
``` js
npm install react-binding
```

* [client-side code package manager][bower]
``` js
bower install react-binding
```

* [bundling with browserify][browserify]
``` js
npm install -g browserify
npm install reactify
browserify ./index.js > bundle.js
```

__minimal example__

``` js
import React from 'react';
import ReactDOM from 'react-dom';
import Binder from 'react-binding';

export default class Form extends React.Component {
  constructor(props){
    super(props);
    this.state = {data: {}};
  },
  render {
    return (
      <div>
        <input valueLink={Binder.bindToState(this,"data", "Employee.FirstName")} />
        <div>FirstName: {this.state.data.Employee.FirstName}</div>
      </div>
    )}
});

ReactDOM.render(
  <Form />,
  document.getElementById('content')
);

```

__Note__: React-binding as mixins - use npm install react-binding@0.6.4

# Overview

### bindToState(key,pathExpression)

It enables to bind to object property with path expression

+   using [ReactLink][valueLink]
``` js
<input type='text' valueLink={Binder.bindToState(this,"data","Employee.Contact.Email")} />
```

+   without [ReactLink][valueLink]

``` js
<TextBoxInput model={Binder.bindToState(this,"data","Employee.Contact.Email")} />
```

``` js
var TextBoxInput = React.createClass({
  render: function() {
    var valueModel = this.props.model;
    var handleChange = function(e){
      valueModel.value = e.target.value;
    }
    return (
      <input type='text' onChange={handleChange} value={valueModel.value} />
    )
  }
});
```

### bindTo(parent,pathExpression)

It enables to bind to complex object with nested properties and reuse bindings in components.

+   binding to state at root level
``` js
  <PersonComponent personModel={Binder.bindToState(this,"data","Employee")} />
  <PersonComponent personModel={Binder.bindToState(this,"data","Deputy")} />
```

+   binding to parent
``` js
  <input type='text' valueLink={Binder.bindTo(this.props.personModel,"Contact.Email")} />
```

+  reuse bindings in component
``` js
var PersonComponent = React.createClass({
  render: function() {
    return (
      <div>
        <input type='text' valueLink={Binder.bindTo(this.props.personModel,"FirstName")} />
        <input type='text' valueLink={Binder.bindTo(this.props.personModel,"LastName")} />
        <input type='text' valueLink={Binder.bindTo(this.props.personModel,"Contact.Email")} />
      </div>
    );
  }
});

```

### bindArrayToState(key,pathExpression)

It enables binding to collection-based structures (array). It enables to add and remove items.

+   binding to array

``` js
    <HobbyList model={Binder.bindArrayToState(this,"data","Hobbies")} />
```

+   access items (this.props.model.items)

``` js
    var HobbyList = React.createClass({
        render: function() {
            if (this.props.model.items === undefined) return <span>There are no items.</span>;

            var hobbies = this.props.model.items.map(function(hobby, index) {
                return (
                    <Hobby model={hobby} key={index} onDelete={this.handleDelete} />
                );
            },this);
            return (
                <div>{hobbies}</div>
            );
        }
    });

```
+   add new items (this.props.model.add(newItem?))
``` js
     handleAdd: function(){
            return this.props.model.add();
     },
```
+   remove exiting items  (this.props.model.props.delete(item))
``` js
     handleDelete: function(hobby){
            return this.props.model.remove(hobby);
     },
```

### bindArrayTo(parent,pathExpression)

It enables binding to collection-based structures (array) for nested arrays. It enables to add and remove items.

+   binding to array

``` js
    <HobbyList model={Binder.bindArrayTo(this,parent,"Hobbies")} />
```

+   access items (this.props.model.items)

``` js
    var HobbyList = React.createClass({
        render: function() {
            if (this.props.model.items === undefined) return <span>There are no items.</span>;

            var hobbies = this.props.model.items.map(function(hobby, index) {
                return (
                    <Hobby model={hobby} key={index} onDelete={this.handleDelete} />
                );
            },this);
            return (
                <div>{hobbies}</div>
            );
        }
    });

```
+   add new items (this.props.model.add(newItem?))
``` js
     handleAdd: function(){
            return this.props.model.add();
     },
```
+   remove exiting items  (this.props.model.props.delete(item))
``` js
     handleDelete: function(hobby){
            return this.props.model.remove(hobby);
     },
```
### Value converters


Value converters

+   format - translates data to a format suitable for the view
+   parse - convert data from the view to a format expected by your data (typically when using two-way binding with input elements to data).

Example - date converter -> using parameters 'dateFormat' is optional

``` js
var dateConverter = function() {
  this.parse = function (input, dateFormat) {
    if (!!!input) return undefined;
    if (input.length < 8) return undefined;
    var date = moment(input, dateFormat);
    if (date.isValid()) return date.toDate();
    return undefined;
  }
  this.format = function (input,dateFormat) {
    if (!!!input) return undefined;
    return moment(input).format(dateFormat);
  }
}
```

using converter

``` js
    <DatePicker label="From" model={Binder.bindToState(this,"data", "Duration.From", converter, 'DD.MM.YYYY')} error={this.validationResult().Duration.From}  />
    <DatePicker label="To" model={Binder.bindToState(this,"data", "Duration.To", converter, 'DD.MM.YYYY')}  error={this.validationResult().Duration.To} />
```

[try in Plunker](http://embed.plnkr.co/gGWe82wT2JJflZt095Gk/preview)

### References

JSON models trees, and most application domains are graphs. Binding supports concept for references to allow JSON to be used to represent graph information.

+   Each entity is inserted into a single, globally unique location in the JSON with a unique identifier.
+   Each reference is an object of the $type='ref' and must contain value as path to single, globally unique location in the JSON - {$type:'ref',value:['todosById',44]}


``` js
{
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
};
```

# Examples

hobby form - data binding only

+   no UI framework - [try in Plunker](http://embed.plnkr.co/aTilRFEJe0gEWaZzr8PC/preview)
+   with react-bootstrap - [try in Plunker](http://embed.plnkr.co/7tumC62YO8GixKEMhJcw/preview)

hobby form with validation using [business-rules-engine][bre]

+   no UI framework - [try in Plunker](http://embed.plnkr.co/qXlUQ7a3YLEypwT2vvSb/preview)
+   with react-bootstrap - [try in Plunker](http://embed.plnkr.co/6hoCCd7Bl1PHnb57rQbT/preview)
+   with material-ui
    +   [demo](http://polymer-formvalidation.rhcloud.com/dist/index.html)
    +   [sources](https://github.com/rsamec/react-hobby-form-app)

value converters

+   date picker - [try in Plunker](http://embed.plnkr.co/gGWe82wT2JJflZt095Gk/preview)

## Contact

For more information on react-binding please check out [my blog][blog].


[git]: http://git-scm.com/
[bower]: http://bower.io
[npm]: https://www.npmjs.org/
[node]: http://nodejs.org
[browserify]: http://browserify.org/
[blog]: http://rsamec.github.io/
[valueLink]: http://facebook.github.io/react/docs/two-way-binding-helpers.html
[materialUi]: https://github.com/callemall/material-ui
[reactBootstrap]: http://react-bootstrap.github.io/
[bre]: https://github.com/rsamec/business-rules-engine
[react]: http://facebook.github.io/react/
