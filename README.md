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

### Development prerequisits

* node.js must be installed
* yo [npm -g install yo]
* taquet-generator [`npm install generator-taquet-generator`]

## Installing taquet

1. `cd path/to/taquet`
2. `npm install`
3. `yo taquet-generator` __ This needs to be ran from the proper directory i.e__ `path/to/taquet`

## Usage

Refer to [taquet-generator](https://github.com/stilva/taquet-generator) and  [yeoman](http://yeoman.io/) for more details.

## Testing
Refer to [taquet-generator](https://github.com/stilva/taquet-generator), [yeoman](http://yeoman.io/), and [grunt](http://www.gruntjs.com) for more details.

1. If the Views are created using taquet-generator a *Spec.js file will automatically be created in `path/to/test`
2. Running `grunt test` will run the tests and test for the native features.