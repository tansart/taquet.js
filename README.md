![taquet.js](http://com-stilva.appspot.com/projects/taquetjs/logo.png)

[![Build Status](https://travis-ci.org/stilva/taquet.js.png?branch=alpha)](https://travis-ci.org/stilva/taquet.js)

taquet.js extends Backbone.js and adds the following features:

- A platform wide commands system
- bubbling events up & down the hierarchy
- `Views` with a lifecycle
- `RoutedViews` automatically attach themselves to the Router
- Helpul utilities

#Table of Contents
- [Dependencies](#dependencies)
- [Development prerequisits](#development-prerequisits)
- [Usage](#usage)
  - [View](#view)
    - [Commands](#commands)
    - [Command Object](#command-object)
    - [Bubbling Events](#bubbling-events)
    - [BubbleEvent](#bubbleevent)
  - [RoutedView](#routedview)
  - [Utilities](#utilities)
    - [Proxy](#proxy)
    - [Webfont preloader](#webfont-preloader)
- [Testing](#testing)

## Dependencies

* backbone.js [which in turn requires underscore/lodash, and jQuery/Zepto]

If you follow the instructions each dependency will be fetched for you using Bower.

## Development prerequisits

* node.js must be installed
* npm install

## Usage

###View

Taquet extends Backbone.View by patching the original source.
The original tests are included to make sure Taquet doesn't interfere with Backbone.View.

_Note that Commands are synchronous while Events are asynchronous_

####Commands
There are two ways to register commands:

1. Specifying the commands when extending the View.
2. Passing the commands when instantiating the View.

```js
var CustomView = Backbone.View.extend({
  //START_UP etc are strings.
  commands: [Commands.START_UP, Commands.SLEEP], // 1
  commandHandler: function(command) {
    switch(command.type) {
      case Commands.START_UP:
        //do something at startup
        break;
      case Commands.SLEEP:
        // do something else
        break;
       default:
         //some default behaviour if needed.
         //This will be invoked on SHUT_DOWN
    }
  }
});

new CustomView({commands:[Commands.SHUT_DOWN]}); // 2
```

`this.sendCommand(command, args)` can be invoked from any class that extends `BaseEvent`.

####Command Object

_This is the command object that is passed through to the `commandHandler`.

```js
{
  type: "", //command's type.
  currentTarget: {} //the object that initiated the command.
}
```

####Bubbling Events
For event to bubble up a hierarchy:

1. `trigger()` needs to be used alongside a `BubbleEvent` instance.

```js
this.trigger(new BubbleEvent("CUSTOM_EVENT"));
```
2. When modifying the DOM that is associated to a given Backbone view, always use `setElement`: this allows both Backbone,
and taquet to do some clean-ups.
3. callbacks triggered with `BubbleEvent` will receive its arguments as follow:

```js
function onBubbleEventHandler(event, arg0, arg1, ... ) {
}
```

where `event` is the BubbleEvent object, and the rest are arguments passed through from `trigger(bubbleEvent, arg0, ...)`.

####BubbleEvent

```js
var event = new BubbleEvent("CUSTOM_EVENT");
```

By calling `event.stopPropagation()` an event can be stopped from bubbling up or down the event hierarchy.

An event could also be uncancellable by setting the cancellable flag to false.

```js
var event = new BubbleEvent("CUSTOM_EVENT", false);
```

###RoutedView

Any View extending from this View can automatically attach itself to the router.

###BaseApplication
This is not a View, and that is all it is. _for now_

###BaseModule
This is not a View, and that is all it is. _for now_

###Utilities
####Proxy

Helper method that allows you to specify the scope within which a callback will run.

The following code allows for `fn` to run with `context` as its context.
`args` is optional, and is passed to `fn`.

```js
var adjusted = this.proxy(fn, context, args);
```

####Webfont preloader

This does not preload as much as ensure a given front to be loaded.
Once a given font has been properly loaded this utility send a system wide command.

##Testing

_Refer to [taquet-generator](https://github.com/stilva/taquet-generator), [yeoman](http://yeoman.io/), and [grunt](http://www.gruntjs.com) for more details._

1. If the Views are created using taquet-generator a *Spec.js file will automatically be created in `path/to/test`
2. Running `grunt test` will run the tests and test for the native features.
