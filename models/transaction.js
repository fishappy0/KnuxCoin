const mongoose = require("mongoose");
const transactionSchema = new mongoose.Schema({
    userId: [{
        id: Object,
        name: String,
    }],
    type: String,
    amount: Number,
    fee: Number,
    date: Date,
    status: String,
    note: String,
    card: String,
    charge_party: String,
    recipient: [{
        id: Object,
        phone: String,
        name: String,
    }],
    phonecard:String,
    operator: String,
});
var Transaction = mongoose.model('Transaction', transactionSchema);//Tạo collection
module.exports = Transaction;
