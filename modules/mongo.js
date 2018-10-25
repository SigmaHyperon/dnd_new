const mongoose = require('mongoose');

//mongoose.connect("mongodb://localhost/inv");

const {Schema} = mongoose;

const InventorySchema = new Schema({
    id: String,
    name: String,
    user: String
});
const ItemSchema = new Schema({
    id: String,
    name: String,
    amount: Number,
    description: String,
    inventory: String
});

const Inventory = mongoose.model('inventory', InventorySchema);
const Item = mongoose.model('item', ItemSchema);

module.exports = {Inventory, Item};
