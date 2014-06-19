'use strict';

var http = require('http');
var url = require('url');
var httpProxy = require('http-proxy');
var Deferred = require('selenium-webdriver').promise.Deferred;
var connect = require('connect');
/**
 * The Replay module will intercept requests to external (non-localhost) URLs
 * and substitute cached responses.
 * https://github.com/assaf/node-replay
 */
var replay = require('replay');

var proxy = httpProxy.createProxyServer({});
var hostRegexes = {
  app: /localhost/,
  // Only pass requests for required third-party dependencies through.
  // Non-essential dependencies need not be cached--they can be replaced with
  // any arbitrary hard-coded response.
  jsonp: /(google|herokuapp)\.com/i,
  requiredThirdParty: /(google|bootstrapcdn)\.com/i,
};

replay.fixtures = __dirname + '/../fixtures';

module.exports = function() {

  var readyDfd = new Deferred();

  var app = connect();

  app.use(function(req, res, next) {
    var parts = url.parse(req.url, true);

    // Remove cache busting parameters in order to stabilize requests
    // TODO: Make configurable
    delete parts.query._;
    delete parts.search;

    req.url = url.format(parts);
    next();
  });
  app.use(require('./rename-jsonp')({ hostRegex: hostRegexes.jsonp }));
  app.use(function (req, res) {
    var parts = url.parse(req.url);


    if (hostRegexes.app.test(parts.hostname)) {
      proxy.web(req, res, { target: parts.protocol + '//' + parts.host });
    } else if (hostRegexes.requiredThirdParty.test(parts.hostname)) {
      console.log('sending\t', req.url);
      req.on('end', function() { console.log('ending\t', req.url); });
      proxy.web(req, res, { target: parts.protocol + '//' + parts.host });
    } else {
      // Respond to requests for non-essential dependencies with an empty body.
      console.log('swallowing', req.url);
      res.end('\n');
    }
  });

  var server = http.createServer(app);
  server.listen(0, '127.0.0.1', function() {
    console.log('listening on port #' + server.address().port);
    readyDfd.fulfill(server);
  });

  return readyDfd.promise;
};
