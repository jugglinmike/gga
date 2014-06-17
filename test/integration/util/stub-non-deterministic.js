/**
 * Replace non-deterministic global functions with "stubs" that return
 * consistent results. This function is intended to be invoked in web browser
 * contexts in order to normalize dynamically-generated web requests (i.e.
 * JSONP).
 *
 * @argument {Object} global - The global object
 */
module.exports = function(global) {
  var _Date = global.Date;
  var Date = global.Date = function() {
    return new _Date(0);
  };
  var attr;

  Date.prototype = _Date.prototype;

  for (attr in _Date) {
    if (_Date.hasOwnProperty(attr)) {
      Date[attr] = _Date[attr];
    }
  }

  Date.now = function() {
    return 0;
  };

  global.Math.random = function() {
    return 0.5;
  };
};
