const express = require('express');
const log = require('./modules/log.js');
const apiRouter = require('./modules/api.js');
const config = require('config');
var app = express();
const port = config.has('port') ? config.get('port') : 80;

app.use(`/inv`, express.static("www"));
app.use(`/api`, apiRouter);

if(config.has('disableSSL') && config.get('disableSSL')){
    app.listen(port, () => {log.log(`listening on port ${port}`, ['INIT']);});
} else {
    const fs = require('fs');
    const https = require('https');

    var privateKey = fs.readFileSync('ssl/server.key');
    var certificate = fs.readFileSync('ssl/server.crt');

    var credentials = {key: privateKey, cert: certificate};

    https.createServer(credentials, app).listen(port, () => {log.log(`listening on port ${port}`, ['INIT']);});
}
