const express = require('express');
const log = require('./modules/log.js');
let {setTokens, apiRouter} = require('./modules/api.js');
const config = require('./modules/config-default.js');

var app = express();
const port = config.has('port') ? config.get('port') : 80;
const socketIO = require('socket.io');

app.use(`/inv`, express.static("www"));
app.use(`/api`, apiRouter);

var server;
var type = "";
if(config.default('disableSSL', false)){
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

const io = socketIO(server);
setTokens(require('./modules/userManagement.js')(io));

server.listen(port, () => {log.log(`${type} listening on port ${port}`, ['INIT']);});

const exit_hook = () => {
    console.log();
    log.log(`server shutting down`, ['SHUTDOWN']);
    setTimeout(()=>{
        log.log(`server failed to shut down in a timely fashion`, ['SHUTDOWN']);
        log.log(`process will exit now`, ['SHUTDOWN']);
        process.exit(1);
    }, 3000);
    io.close(()=>{
        log.log(`socket.io server closed`, ['SHUTDOWN']);
        server.close(()=>{
            log.log(`${type} server closed`, ['SHUTDOWN']);
            log.log(`process will exit now`, ['SHUTDOWN']);
            process.exit(0);
        });
    });
};

process.on('SIGINT', exit_hook);
