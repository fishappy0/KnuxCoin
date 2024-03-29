const mongoose = require("mongoose");
const accountDB = require("../models/account");
const userDB = require("../models/users");
//const cardDB = require('../models/card);
const transactionSchema = new mongoose.Schema({
  userId: [
    {
      id: Object,
      name: String,
    },
  ],
  // transactionId để hỗ trợ cho tính năng lịch sử giao dịch
  transactionId: String,
  type: String,
  amount: Number,
  fee: Number,
  date: Date,
  status: String,
  note: String,
  card: String,
  charge_party: String,
  recipient: [
    {
      id: Object,
      phone: String,
      name: String,
    },
  ],
  phonecard: String,
  operator: String,
});
var Transaction = mongoose.model("Transaction", transactionSchema); //Tạo collection
module.exports = Transaction;

module.exports.getTransactions = async function (phone) {
  return await Transaction.find({ recipient: [{ phone: phone_number }] });
};

module.exports.transferMoney = async function (
  recipient_phone,
  user_object_id,
  money_amount,
  message,
  type,
  card,
  payment_fee,
  charge_party,
  phone_card,
  phone_operator
) {
  let status = "approved";
  let date = new Date(Date.now());
  if (money_amount > 5000000) status = "pending";
  const oneData = new Transaction({});
};
