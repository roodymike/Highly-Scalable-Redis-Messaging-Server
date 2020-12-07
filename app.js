var http = require('http');
var process = require('process');
var data = process.env.NODE_ENV;
http.createServer(function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('Hello World! from :- ' + data);
    res.end();
}).listen(12000);