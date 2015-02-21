# react-binding

React [LinkedStateMixin](http://facebook.github.io/react/docs/two-way-binding-helpers.html) is an easy way to express two-way data binding in React.

React-binding comes with [BindToMixin](https://github.com/rsamec/react-binding) as extension to [LinkedStateMixin](http://facebook.github.io/react/docs/two-way-binding-helpers.html) two-way binding that supports binding to

+   object properties with path expression (Person.FirstName, Person.LastName, Person.Contact.Email)
+   complex objects (json) with nested properties
+   collection-based structures - arrays and lists

# Get started

* [node package manager][npm].
``` js
npm install react-binding
```

* [client-side code package manager][bower].
``` js
bower install react-binding
```

*  [bundling with browserify][browserify]
``` js
npm install -g browserify
npm install reactify
browserify ./index.js > bundle.js
```

# Overview

### bindToState(key,pathExpression)

It enables to bind to object property with path expression

+   using [valueLink](http://facebook.github.io/react/docs/two-way-binding-helpers.html)
``` js
<input type='text' valueLink={this.bindToState("data","Employee.Contact.Email")} />
```

+   without [valueLink](http://facebook.github.io/react/docs/two-way-binding-helpers.html)

``` js
<TextBoxInput model={this.bindToState("data","Employee.Contact.Email")} />
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

  <PersonComponent personModel={this.bindToState("data","Employee")} />
  <PersonComponent personModel={this.bindToState("data","Deputy")} />
```

+   binding to parent
``` js
  <input type='text' valueLink={this.bindTo(this.props.personModel,"Contact.Email")} />
```

+  reuse bindings in component
``` js
var PersonComponent = React.createClass({
  mixins:[BindToMixin],
  render: function() {
    return (
      <div>
        <input type='text' valueLink={this.bindTo(this.props.personModel,"FirstName")} />
        <input type='text' valueLink={this.bindTo(this.props.personModel,"LastName")} />
        <input type='text' valueLink={this.bindTo(this.props.personModel,"Contact.Email")} />
      </div>
    );
  }
});

```

### bindToArrayState(key,pathExpression)

It enables binding to collection-based structures (array). It enables to add and remove items.

+   binding to array

``` js
 <HobbyList model={this.bindArrayToState("data","Hobbies")} />
 ```

# Examples

[Try in Plunker](http://embed.plnkr.co/aTilRFEJe0gEWaZzr8PC/preview)

We create hobby form to capture data from user in this form

``` js
{
  "Person": {
    "LastName": "Smith",
    "FirstName": "Adam",
    "Contact": {
      "Email": "smith@gmail.com"
    }
  },
  "Hobbies": [
      {
        "HobbyName": "Bandbington",
        "Frequency": "Daily",
        "Paid": true,
        "Recommendation": true
      },
      {
        "HobbyName": "Cycling",
        "Frequency": "Daily",
        "Recommendation": false,
        "Paid": false
      }
    ]
}

```

### bindTo(parent,pathExpression)

``` js
var Form = React.createClass({
    mixins:[BindToMixin],
    getInitialState: function() {
        return { data: {}};
    },
    render: function() {
        return (
            <div>
               <input type='text' valueLink={this.bindToState("data","Employee.FirstName")} />
               <input type='text' valueLink={this.bindToState("data","Employee.LastName")} />
               <input type='text' valueLink={this.bindToState("data","Employee.Contact.Email")} />
            </div>
        );
    }
});
```


### bindTo(parent,pathExpression)

We create reusable component PersonComponent with 3 fields and use twice in our form.

``` js
var Form = React.createClass({
    mixins:[BindToMixin],
    getInitialState: function() {
        return { data: {}};
    },
    render: function() {
        return (
            <div>
                <PersonComponent personModel={this.bindToState("data","Employee")} />
                <PersonComponent personModel={this.bindToState("data","Deputy")} />
            </div>
        );
    }
});


var PersonComponent = React.createClass({
  mixins:[BindToMixin],
  render: function() {
    return (
      <div>
        <input type='text' valueLink={this.bindTo(this.props.personModel,"FirstName")} />
        <input type='text' valueLink={this.bindTo(this.props.personModel,"LastName")} />
        <input type='text' valueLink={this.bindTo(this.props.personModel,"Contact.Email")} />
      </div>
    );
  }
});

```

### bindToArrayState(key,path)

We create list of hobbies with add and remove buttons.

``` js

var HobbyForm = React.createClass({
    mixins:[BindToMixin],
    getInitialState: function() {
        return { data: {}};
    },
    addHobby:function(e){
      if (this.state.data.Hobbies === undefined)
        this.state.data.Hobbies = []
      this.state.data.Hobbies.push({});
      this.setState({data:this.state.data})
    },
    render: function() {
        return (
            <div className="commentBox">
                <div >
                  <button onClick={this.addHobby}>Add</button>
                  <HobbyList model={this.bindArrayToState("data","Hobbies")} />
                </div>
            </div>
        );
    }
});
var HobbyList = React.createClass({
    handleDelete: function(hobby){
        return this.props.model.remove(hobby);
    },
    render: function() {
        if (this.props.model.Items === undefined) return <span>There are no items.</span>;

        var nodes = this.props.model.items.map(function(hobby, index) {
            return (
                <Hobby model={hobby} key={index} onDelete={this.handleDelete} />
            );
        },this);
        return (
            <div>
                {nodes}
            </div>
        );
    }
});
var Hobby = React.createClass({
    mixins:[BindToMixin],
    handleClick: function(e){
        e.preventDefault();
        return this.props.onDelete(this.props.model.value);
    },
    render: function() {
        return (
            <div className="comment">
              <input type='text' valueLink={this.bindTo(this.props.model,"HobbyName")} />
              <button value="Delete" onClick={this.handleClick}>Delete</button>
            </div>
        );
    }
});

```

## Contact

For more information on react-binding please check out http://angularjs.org/

[git]: http://git-scm.com/
[bower]: http://bower.io
[npm]: https://www.npmjs.org/
[node]: http://nodejs.org
[browserify]: http://browserify.org/