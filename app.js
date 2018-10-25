const express = require('express');
const log = require('./modules/log.js');
const apiRouter = require('./modules/routes/api.js');
var app = express();
const port = 80;

app.use(`/inv`, express.static("www"));
app.use(`/api`, apiRouter);

app.listen(port, () => {log.log(`listening on port ${port}`, ['INIT']);});
