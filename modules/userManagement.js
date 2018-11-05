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

let sessions = [];

module.exports = function(io){
    log.log("starting socketIO", ['INIT']);
    io.on('connection',function(socket){
        var session = {
            auth: false,
            user: null,
            name: null,
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
                            session.auth = true;
                            session.user = user.id;
                            session.name = user.name;
                            session.token = tok;
                            sessions[session.user] = session;
                            socket.emit("authResponse", {status: 'success', token: tok, userId: user.id});
                            log.log(`user ${authData.userId} signed on successfully`, ['USMGMT']);
                        } else {
                            socket.emit("authResponse", {status: 'error', message: 'Invalid credentials'});
                        }
                    }
                });
            } else {
                socket.emit("authResponse", {status: 'error', message: 'invalid auth request'});
            }
            //console.log(sessions);
        });
        socket.on('disconnect', (err) => {
            // TODO: handle disconnect
            //reset session
            session.auth = false;
            session.user = null;
            session.token = null;
            //remove session from active sessions
            sessions.splice(sessions.indexOf(session), 1);
        })
    })
    log.log("socketIO setup done", ['INIT']);
    return sessions;
}
