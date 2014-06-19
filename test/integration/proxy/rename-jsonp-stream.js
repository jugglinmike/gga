'use strict';

var util = require('util');
var Transform = require('stream').Transform;

function RenameJsonpStream(options) {
  Transform.apply(this, arguments);

  this._originalCallbackName = options.originalName;
  this._stubbedCallbackName = options.newName;
  this._didOpenClosure = false;
}
util.inherits(RenameJsonpStream, Transform);

module.exports = RenameJsonpStream;

RenameJsonpStream.prototype._transform = function(chunk, encoding, done) {
  if (!this._didOpenClosure) {
    this._didOpenClosure = true;
    this.push(
      '/* begin IIFE inserted by rename-jsonp-stream module */' +
      '(function() {' +
      'var ' + this._stubbedCallbackName + ' = ' + this._originalCallbackName + ';'
    );
  }
  this.push(chunk);
  done();
};

RenameJsonpStream.prototype._flush = function(done) {
  this.push(
    '}());/* end IIFE inserted by rename-jsonp-stream module */'
  );
  done();
};
