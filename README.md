# react-binding

React-binding is lightweight mixin for two-way data binding in [React][react].

[BindToMixin](https://github.com/rsamec/react-binding) offers two-way data binding support for:

+   object properties with path expression (dot notation)
    +   this.bindToState("data","Employee.FirstName");
    +   this.bindToState("data","Employee.Contact.Email");
+   complex objects (json) with nested properties
    +   this.bindTo(employee,"FirstName");
    +   this.bindTo(employee,"Contact.Email");
+   collection-based structures - arrays and lists
    +   model={this.bindTo(employee,"FirstName")}
        +   this.props.model.items.map(function(item){ return (<Hobby model={hobby}/>);})
        +   this.props.model.add()
        +   this.props.model.remove(item)
+   supports for "value/requestChange" interface also to enable to use [ReactLink][valueLink] attribute
    +   valueLink={this.bindTo(employee,"FirstName")}
+   enables binding with value converters
    +   supports both directions - format (toView) and parse (fromView)
    +   support for converter parameter - valueLink={this.bindToState("data", "Duration.From",converter, "DD.MM.YYYY")}
    +   converter parameter can be data-bound - valueLink={this.bindToState("data", "Duration.From",converter, this.state.format)}
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

# Overview

### bindToState(key,pathExpression)

It enables to bind to object property with path expression

+   using [ReactLink][valueLink]
``` js
<input type='text' valueLink={this.bindToState("data","Employee.Contact.Email")} />
```

+   without [ReactLink][valueLink]

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

### bindArrayToState(key,pathExpression)

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

### Value converters


Value converters

+   format - translates data to a format suitable for the view
+   parse - convert data from the view to a format expected by your data (typically when using two-way binding with input elements to data).

Example - date converter -> using parameters 'dateFormat' is optional

{% highlight js %}
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
{% endhighlight %}

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

+   date picker - [try in Plunker](http://embed.plnkr.co/gGWe82wT2JJflZt095Gk/)

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
