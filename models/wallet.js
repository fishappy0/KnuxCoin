const mongoose = require("mongoose");
const walletSchema = new mongoose.Schema({
    userId: [{
        id: Object,
        name: String,
    }],
});
var Wallet = mongoose.model("Wallet", walletSchema); //Tạo collection
module.exports = Wallet;
