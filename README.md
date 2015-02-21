# react-binding

React [LinkedStateMixin](http://facebook.github.io/react/docs/two-way-binding-helpers.html) is an easy way to express two-way data binding in React.

React-binding comes with [BindToMixin](https://github.com/rsamec/react-binding) as extension to [LinkedStateMixin](http://facebook.github.io/react/docs/two-way-binding-helpers.html) two-way binding that supports binding to

+   object properties with path expression (Person.FirstName, Person.LastName, Person.Contact.Email)
+   complex objects (json) with nested properties
+   collection-based structures - arrays and lists

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

# Examples

[hobby form - try in Plunker](http://embed.plnkr.co/aTilRFEJe0gEWaZzr8PC/preview)

```

## Contact

For more information on react-binding please check out [blog post][blog]

[git]: http://git-scm.com/
[bower]: http://bower.io
[npm]: https://www.npmjs.org/
[node]: http://nodejs.org
[browserify]: http://browserify.org/
[blog]: http://rsamec.github.io/