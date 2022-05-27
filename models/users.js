const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  full_name: String,
  email: String,
  address: String,
  dob: Date,
  phone: String,
  createdAt: Date,
  lockedAt: Date,
  loginFail: Number,
  abnormalLogin: Number,
  status: String,
});
var User = mongoose.model("User", userSchema); //Tạo collection
module.exports = User;

module.exports.createAccount = async function (
  full_name,
  email,
  address,
  dob,
  phone
) {
  let current_time = new Date(Date.now());
  const oneData = await new User({
    full_name: full_name,
    email: email,
    address: address,
    dob: dob,
    phone: phone,
    createdAt: current_time.toString(),
    lockedAt: "",
    loginFail: 0,
    abnormalLogin: 0,
    status: "waiting",
  });
  await oneData.save();
  console.log(`<KnuxCoin Web> Created user with phone number ${phone}`);
};
