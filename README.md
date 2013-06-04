# taquet

taquet extends Backbone.js and adds the following features:

- A platform wide commands system
- bubbling events
- Views with a lifecycle
- synchronous events for animations
- Helpul utilities

## Dependencies

* backbone.js [which in turn requires underscore/lodash, and jQuery/Zepto]
* require.js
* setImmediage.js

If you follow the instructions each dependency will be fetched for you using Bower.

### Development prerequisits

* node.js must be installed
* yo [npm -g install yo]
* taquet-generator [`npm install generator-taquet`]

## Installing taquet

1. `cd path/to/taquet`
2. `npm install`
3. `yo taquet` __This needs to be ran from the proper directory i.e__ `path/to/taquet`

## Usage

_Refer to [taquet-generator](https://github.com/stilva/taquet-generator) and  [yeoman](http://yeoman.io/) for more details._

I recommend the use of the aforementioned yeoman generator, as it will create and extend the Views for you.

###BaseView
This is the most basic view that taquet has. For Commands, and bubbling Events extend from this view instead of `Backbone.View`. _Note that Commands are synchronous while Events are asynchronous_

With vanilla Backbone.js you extend the views as follow:
```js
var CustomView = Backbone.View.extend({
  // add your methods here
});
```
while using taquet, you extend BaseView instead:
```js
var CustomView = BaseView.extend({
  // add your methods here
});
```

####Commands
There are two ways to register commands:

1. Passing the commands via the contstructor
2. Specifying the commands when extending BaseView.

```js
var CustomView = BaseView.extend({
  commands: [START_UP, SLEEP],
  commandHandler: function(command) {
    switch(command) {
      case START_UP:
        //do something at startup
        break;
      case SLEEP:
        // do something else
        break;
       default:
         //some default behaviour if needed.
         //This will be invoked on SHUT_DOWN
    }
  }
});

new CustomView({commands:[SHUT_DOWN]});
```

####Bubbling Events
~~Bubbling events are slightly less straight-forward than commands, and there are a few things to keep in mind:~~

When using `on()` or `once()` you need to let taquet know that we're dealing with a bubbling event. The callback will need to
have the following string: `bubbleEvent` _not case sensitive!_

```js
function onBubblingEventHandler(e) {
  "BubbleEvent";
}
```

When using the `trigger()` function to dispatch an event up the hierarchy you need to pass in an instance of `BubbleEvent`.

```js
this.trigger(new BubbleEvent("CUSTOM_EVENT"));
```

###AnimatedView

###BaseApplication
This is not a View, and that is all it is. _for now_

###BaseRouter
It does not do much, but is needed if you use AnimatedView.

###Utilities
####Proxy

####Webfont preloader

## Testing
_Refer to [taquet-generator](https://github.com/stilva/taquet-generator), [yeoman](http://yeoman.io/), and [grunt](http://www.gruntjs.com) for more details._

1. If the Views are created using taquet-generator a *Spec.js file will automatically be created in `path/to/test`
2. Running `grunt test` will run the tests and test for the native features.