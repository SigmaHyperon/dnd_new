const sha256 = require('js-sha256');
const random = require('random');

const config = require('./config-default.js');
const {User} = require('./mongo.js');
const log = require('./log.js');

class token {
    constructor() {
        this.secret = sha256((random.int()+Date.now()+random.int()).toString());
        this.expiryDate = Date.now() + 3600000 * (config.default('tokenTimeout', 5));
    }
}

module.exports = function(io){
    log.log("starting socketIO", ['INIT']);
    io.on('connection',function(socket){
        var session = {
            auth: false,
            user: null,
            token: null
        };
        socket.on('auth', function(authData){
            if(Object.keys(authData).length == 2 && typeof authData.userId != 'undefined' && typeof authData.password != 'undefiend'){
                User.find({name: authData.userId}, (err, users) => {
                    if(users.length == 0){ //user not found
                        socket.emit("authResponse", {status: 'error', message: "User not found"});
                    } else if(users.length > 1) { //multiple users found
                        socket.emit("authResponse", {status: 'error', message: "Multiple matching users found. Please contact the system administrator. Show them this code: "+btoa("multiuser:"+authData.userId)});
                    } else {
                        var user = users[0];
                        //check password:
                        if(sha256(authData.password+user.salt) == user.password){
                            //generate token and rend response
                            var tok = new token();
                            //TODO: store token for auth
                            socket.emit("authResponse", {status: 'success', token: tok});
                        } else {
                            //TODO: change message
                            socket.emit("authResponse", {status: 'error', message: 'Invalid password'});
                        }
                    }
                });
            } else {
                socket.emit("authResponse", {status: 'error', message: 'invalid auth request'});
            }
        });
        socket.on('disconnect', (err) => {
            // TODO: handle disconnect
            session.auth = false;
            session.user = null;
            session.token = null;
        })
    })
    log.log("socketIO setup done", ['INIT']);
    return io;
}
