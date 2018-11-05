const config = require('config');

config.default = function(value, def){
    if(this.has(value)){
        return this.get(value);
    } else {
        return def;
    }
};

module.exports = config;
