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
    description: String,
    inventory: String
});

const Inventory = mongoose.model('inventory', InventorySchema);
const Item = mongoose.model('item', ItemSchema);

module.exports = {Inventory, Item};
