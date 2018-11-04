const express = require('express');
const log = require('./modules/log.js');
const apiRouter = require('./modules/api.js');
const config = require('config');
var app = express();
const port = config.has('port') ? config.get('port') : 80;
const socketIO = require('socket.io');

app.use(`/inv`, express.static("www"));
app.use(`/api`, apiRouter);

var server;
var type = "";
if(config.has('disableSSL') && config.get('disableSSL')){
    const http = require('http');
    server = http.createServer(app);
    type = "http";
} else {
    const fs = require('fs');
    const https = require('https');

    var privateKey = fs.readFileSync('ssl/server.key');
    var certificate = fs.readFileSync('ssl/server.crt');

    var credentials = {key: privateKey, cert: certificate};

    server = https.createServer(credentials, app);
    type = "https";
}

const io = require('./modules/userManagement.js')(socketIO(server));

server.listen(port, () => {log.log(`${type} listening on port ${port}`, ['INIT']);});
