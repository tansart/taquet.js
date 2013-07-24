# taquet

taquet extends Backbone.js and adds the following features:

- A platform wide commands system
- bubbling events
- Views with a lifecycle
- synchronous events for animations
- ~~double/two-way binding~~ _Testing_
- Helpul utilities

#Table of Contents
- [Dependencies](#dependencies)
- [Development prerequisits](#development-prerequisits)
	- [Installing taquet](#installing-taquet)
- [Usage](#usage)
	- [View](#view)
		- [Commands](#commands)
		- [Command Object](#command-object)
		- [Bubbling Events](#bubbling-events)
		- [BubbleEvent](#bubbleevent)
	- [AnimatedView](#animatedview)
	- [BaseApplication](#baseapplication)
	- [BaseRouter](#baserouter)
	- [Utilities](#utilities)
		- [Proxy](#proxy)
		- [Webfont preloader](#webfont-preloader)
- [Testing](#testing)

## Dependencies

* backbone.js [which in turn requires underscore/lodash, and jQuery/Zepto]
* require.js
* setImmediage.js _Might be replaced by lodash's defer()..._

If you follow the instructions each dependency will be fetched for you using Bower.

## Development prerequisits

* node.js must be installed
* yo [npm -g install yo]
* taquet-generator [`npm install generator-taquet`]

### Installing taquet

1. `cd path/to/taquet`
2. `npm install`
3. `yo taquet` __This needs to be ran from the proper directory i.e__ `path/to/taquet`

## Usage

_Refer to [taquet-generator](https://github.com/stilva/taquet-generator) and  [yeoman](http://yeoman.io/) for more details._

I recommend the use of the aforementioned yeoman generator, as it will create and extend the Views for you.

###View

Taquet extends Backbone.View by patching the original source.
The original tests are included to make sure Taquet doesn't interfere with Backbone.View.

_Note that Commands are synchronous while Events are asynchronous_

####Commands
There are two ways to register commands:

1. Specifying the commands when extending BaseView.
2. Passing the commands via the contstructor.

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

By calling `event.stopPropagation()` an event can be stopped from bubbling up the even hierarchy.

An event could also be uncancellable by setting the cancellable flag to false.

```js
var event = new BubbleEvent("CUSTOM_EVENT", false);
```
###AnimatedView
requires the `Router` to extend from `BaseRouter`

###BaseApplication
This is not a View, and that is all it is. _for now_

###BaseModule
This is not a View, and that is all it is. _for now_

###BaseRouter
It does not do much, but is needed if you use `AnimatedView`.

###Utilities
####Proxy

Helper method that allows you to specify the scope within which a callback will run.

```js
this.proxy(fn, context, args)
```

####Webfont preloader

This does not preload as much as ensure a given front to be loaded, before sending a command system wide.

## Testing
_Refer to [taquet-generator](https://github.com/stilva/taquet-generator), [yeoman](http://yeoman.io/), and [grunt](http://www.gruntjs.com) for more details._

1. If the Views are created using taquet-generator a *Spec.js file will automatically be created in `path/to/test`
2. Running `grunt test` will run the tests and test for the native features.
