function init_conn(){
    let conn = {};
    conn.socket = io();
    conn.socket.on('connect', () => {
        conn.connected = true;
    });
    conn.socket.on('disconnect', () => {
        conn.authStatus = false;
        conn.connected = false;
    });
    conn.login = function(username, password){
        this.socket.emit('auth', {userId: username, password});
        let res = new Promise((resolve, reject) => {
            this.socket.once('authResponse', data => {
                if(data.status === 'success'){
                    this.credentials = {token: data.token, userId: data.userId};
                    this.authStatus = true;
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
        return res;
    };
    conn.request = async function(method, path, data){
        if(!this.connected || !this.authStatus){
            // TODO: handle error
            return;
        }
        let settings = {
            headers: {
                "x-auth": JSON.stringify({user: this.credentials.userId, token: this.credentials.token.secret})
            },
            method: method,
            data: JSON.stringify(data)
        };
        let res = new Promise((resolve, reject) => {
            $.ajax(path, settings)
                .done((data) => {
                    resolve({success: true, data});
                })
                .fail((xhr, status, error) => {
                    resolve({success: false, details: error});
                });
        });
        return res;
    }
    return conn;
}
