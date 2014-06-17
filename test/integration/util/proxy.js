'use strict';

var http = require('http');
var url = require('url');
var httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer({});
var passThroughRe = /localhost|google\.com|herokuapp\.com|bootstrapcdn\.com/i;

http.createServer(function (req, res) {
  var parts = url.parse(req.url);

  if (passThroughRe.test(parts.hostname)) {
    proxy.web(req, res, { target: parts.protocol + '//' + parts.host });
  } else {
    res.end('Hello World\n');
  }
}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');
