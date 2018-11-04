const log = require('./log.js');
module.exports = function(io){
    log.log("starting socketIO", ['INIT']);
    io.on('connection',function(socket){
        var session = {};
        socket.on('disconnect', (err) => {
            // TODO: handle disconnect
        })
    })
    log.log("socketIO setup done", ['INIT']);
}
