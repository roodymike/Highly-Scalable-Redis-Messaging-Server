var http = require('http');
var process = require('process');
var os = require('os');
var data = process.env.SERVICE_PORTS || 'Default messagge';
http.createServer(function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('Hello World! from :- ' + os.hostname() + " on port :- " + data);
    res.end();
}).listen(12000);