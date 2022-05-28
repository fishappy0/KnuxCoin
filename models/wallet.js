const mongoose = require("mongoose");
const walletSchema = new mongoose.Schema({
  userId: [
    {
      id: Object,
      name: String,
    },
  ],
  balance: Number,
});
var Wallet = mongoose.model("Wallet", walletSchema); //Tạo collection
module.exports = Wallet;
