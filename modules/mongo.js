const mongoose = require('mongoose');
const log = require('./log.js');
const config = require('./config-default.js');

mongoose.connect(config.default('db.url','mongodb://localhost/inv'),{
        useNewUrlParser: true
    }, function(err){
    if(err){
        log.log("db connect failed", ['MONGO']);
    }
});

const {Schema} = mongoose;

const InventorySchema = new Schema({
    id: String,
    name: {type: String, required: true},
    user: {type: String, default: ''}
});
const ItemSchema = new Schema({
    id: String,
    name: {type: String, required: true},
    amount: {type: Number, default: 1},
    icon: String,
    description: String,
    inventory: String
});
const UserSchema = new Schema({
    id: String,
    name: {type: String, required: true},
    password: String,
    salt: String,
    icon: String
});

const Inventory = mongoose.model('inventory', InventorySchema);
const Item = mongoose.model('item', ItemSchema);
const User = mongoose.model('user', UserSchema);

module.exports = {Inventory, Item, User};
