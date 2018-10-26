const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/inv");

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
    icon: String
});

const Inventory = mongoose.model('inventory', InventorySchema);
const Item = mongoose.model('item', ItemSchema);
const User = mongoose.model('user', UserSchema);

module.exports = {Inventory, Item, User};
