'use strict';

var http = require('http');
var url = require('url');
var httpProxy = require('http-proxy');
var Deferred = require('selenium-webdriver').promise.Deferred;
/**
 * The Replay module will intercept requests to external (non-localhost) URLs
 * and substitute cached responses.
 * https://github.com/assaf/node-replay
 */
var replay = require('replay');

var stubNondeterministic = require('./stub-non-deterministic').toString();

var proxy = httpProxy.createProxyServer({});
var hostRegexes = {
  app: /localhost/,
  // Only pass requests for required third-party dependencies through.
  // Non-essential dependencies need not be cached--they can be replaced with
  // any arbitrary hard-coded response.
  requiredThirdParty: /(google|herokuapp|bootstrapcdn)\.com/i
};

replay.fixtures = __dirname + '/../fixtures';

/**
 * Forward the request (presumably for an HTML document), inject the
 * non-deterministic function stub as an inline <script> tag in the <head>,
 * and serve the resulting data.
 */
function injectStub(req, res) {
  http.get(req.url, function(res2) {
    var markup = '';

    res2.on('data', function(chunk) {
      markup += chunk;
    });

    res2.on('end', function() {
      markup = markup.replace(
        /<head>/,
        '<head><script>(' + stubNondeterministic + '(window));</script>'
      );
      res.end(markup);
    });
  });
}

module.exports = function() {

  var readyDfd = new Deferred();

  var server = http.createServer(function (req, res) {
    var parts = url.parse(req.url);

    if (hostRegexes.app.test(parts.hostname)) {
      if (parts.path === '/') {
        injectStub(req, res);
      } else {
        proxy.web(req, res, { target: parts.protocol + '//' + parts.host });
      }
    } else if (hostRegexes.requiredThirdParty.test(parts.hostname)) {
      proxy.web(req, res, { target: parts.protocol + '//' + parts.host });
    } else {
      // Respond to requests for non-essential dependencies with an empty body.
      res.end('\n');
    }
  });

  server.listen(0, '127.0.0.1', function() {
    console.log('listening on port #' + server.address().port);
    readyDfd.fulfill(server);
  });

  return readyDfd.promise;
};
