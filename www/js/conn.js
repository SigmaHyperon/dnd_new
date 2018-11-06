class GameObject {
    constructor(connection) {
        this.internals = {};
        this.internals.path = "";
        this.internals.connection = connection;
        this.internals.isLoaded = false;
    }
    async load(id){
        let result = await this.internals.connection.request('GET', `${this.internals.path}/${id}`);
        let data;
        try {
            data = JSON.parse(result);
        } catch (e) {
            throw 'invalid data';
        }
        this.loadData(data);
    }
    loadData(data){
        Object.assign(this, data);
        this.internals.isLoaded = true;
    }
    async save(){
        if(this.internals.isLoaded !== true)
            throw "object not loaded yet";

        let cleanAttributes = Object.keys(this).filter(v => {
            return (v !== 'internals' && typeof this[v] !== 'function');
        });
        let toTransfer = {};
        for (var el in cleanAttributes) {
            if (cleanAttributes.hasOwnProperty(el)) {
                toTransfer[cleanAttributes[el]] = this[cleanAttributes[el]];
            }
        }
        let result = await this.internals.connection.request('PATCH', `${this.internals.path}/${this.id}`, toTransfer);
    }
    async list(){
        let result = await this.internals.connection.request('GET', `${this.internals.path}`);
        let data;
        try {
            data = JSON.parse(result);
        } catch (e) {
            throw 'invalid data';
        }
        let list = [];
        for (var el in data) {
            if (data.hasOwnProperty(el)) {
                let newItem = new this.constructor(this.internals.connection);
                newItem.loadData(data[el]);
                list.push(newItem);
            }
        }
        return list;
    }
}
class User extends GameObject {
    constructor(connection) {
        super(connection);
        this.internals.path = 'user';
    }
}

class Inventory extends GameObject {
    constructor(connection) {
        super(connection);
        this.internals.path = 'inv';
    }
}

class Item extends GameObject {
    constructor(connection) {
        super(connection);
        this.internals.path = 'item';
    }
}

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
            throw 'not connected';
            return;
        }
        let settings = {
            method: method,
            data: JSON.stringify(data),
            contentType: 'application/json'
        };
        if(location.protocol == 'https')
            settings.headers = {"x-auth": JSON.stringify({user: this.credentials.userId, token: this.credentials.token.secret})};
        return await $.ajax(`/api/v1/${path}`, settings);
    }
    conn.new = function(type){
        return new type(this);
    }
    return conn;
}

var test = init_conn();
test.login('test', 'test');
