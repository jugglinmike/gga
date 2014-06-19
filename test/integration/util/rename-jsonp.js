'use strict';

var http = require('http');
var util = require('util');
var Transform = require('stream').Transform;

function RenameJsonpStream(options) {
	Transform.apply(this, arguments);

	this._originalCallbackName = options.originalName;
	this._stubbedCallbackName = options.newName;
	this._didOpenClosure = false;
}
util.inherits(RenameJsonpStream, Transform);

RenameJsonpStream.prototype._transform = function(chunk, encoding, done) {
	if (!this._didOpenClosure) {
		this._didOpenClosure = true;
		this.push(
			'/* begin IIFE inserted by rename-jsonp module */' +
			'(function() {' +
			'var ' + this._stubbedCallbackName + ' = ' + this._originalCallbackName + ';'
		);
	}
	this.push(chunk);
	done();
};

RenameJsonpStream.prototype._flush = function(done) {
	this.push(
		'}());/* end IIFE inserted by rename-jsonp module */'
	);
	done();
};

var url = require('url');
var rewrite = function(loc, options) {
	var parts = url.parse(loc, true);
	var newName = options && options.newName || 'renameJsonp';
	var cbParam = options && options.cbParam || 'callback';
  var newUrl;
	var originalName;

	originalName = parts.query[cbParam];
	parts.query.callback = newName;
	/**
	 * Remove `search` from the URL object so the url module references the
	 * `query` object when constructing the URL string.
	 *
	 * > query (object; see querystring) will only be used if search is absent.
	 *
	 * Source: Node.js documentation on `url.format(urlObj)`
	 * http://nodejs.org/docs/v0.10.29/api/url.html#url_url_format_urlobj
	 */
	delete parts.search;

  newUrl = url.format(parts);

	return {
		url: newUrl,
		parts: url.parse(newUrl),
		originalName: originalName,
		newName: newName
	};
};

var zlib = require('zlib');
var gzip = zlib.createGzip()
var gunzip = zlib.createGunzip()

var requests = {
	'http:': require('http').request,
	'https:': require('https').request
};

module.exports = function(options) {

  options.hostRegex = options.hostRegex;
  options.newName = options.newName || 'renameJsonp';
  options.cbParam = options.cbParam || 'callback';

  return function(req, res, next) {
    var rewritten = rewrite(req.url, options);
    var requestFn, requestOpts, newReq;

    if (!options.hostRegex.test(rewritten.parts.host) || !rewritten.originalName) {
      next();
      return;
    }

    console.log('sending (fancy)\t', req.url);
    req.on('end', function() { console.log('ending (fancy)\t', req.url); });

    requestFn = requests[rewritten.parts.protocol];

    requestOpts = rewritten.parts;
    requestOpts.method = req.method;
    requestOpts.headers = req.headers;
    requestOpts.auth = req.auth;
    requestOpts.agent = req.agent;

    newReq = requestFn(requestOpts, function(res2) {
      var renameStream = new RenameJsonpStream({
        originalName: rewritten.originalName,
        newName: rewritten.newName
      });
      var responseStream;

      if (res2.headers['content-encoding'] === 'gzip') {
        responseStream = res2.pipe(zlib.createGunzip());
      } else {
        responseStream = res2;
      }

      responseStream.pipe(renameStream);

      //if (false && res2.headers['content-encoding'] === 'gzip') {
      //  responseStream = renameStream.pipe(gzip);
      //} else {
      //  responseStream = renameStream;
      //}
      //res.removeHeader('Content-Length');

      //responseStream.pipe(res);
      renameStream.pipe(res);
    });

    req.pipe(newReq);
  };
};
