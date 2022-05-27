const local_utils = require("../local_utils.js");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { dbg } = require("../local_utils");
const accountDB = mongoose.model("Account", {
  account_id: String,
  username: String,
  password: String,
  isAdmin: Boolean,
  phone_num: String,
});
module.exports = accountDB;
module.exports.verifyAccount = async function (uname, passphrase) {
  let returnedQuery = await accountDB.findOne({
    username: uname,
  });
  if (returnedQuery == null) {
    return null;
  } else {
    const isSamePassword = await dbg(
      bcrypt.compare(passphrase, returnedQuery["password"])
    );
    if (isSamePassword) {
      return returnedQuery;
    } else {
      return null;
    }
  }
};

module.exports.createAccount = async function (phone) {
  let current_time = new Date(Date.now());
  let account_id =
    current_time.getFullYear().toString().slice(2) +
    "U" +
    Math.round(Math.random() * 10000000).toString();

  let login_username = Math.round(Math.random() * 10000000000);

  // Tạo mật khẩu ngẫu nhiên dùng thư viện crypto và sau đó dùng bcrypt để hash
  let login_password = crypto.randomBytes(5).toString("hex");
  let hashed_password = await bcrypt.hash(
    login_password,
    await bcrypt.genSalt(10)
  );

  let credentials_arr = [account_id, login_username, login_password];
  const oneData = await new accountDB({
    account_id: account_id,
    username: login_username,
    password: hashed_password,
    isAdmin: false,
    phone_num: phone,
  });
  await oneData.save();
  console.log(`<KnuxCoin Web> Created account for ${login_username}`);
  return credentials_arr;
};
module.exports.addAdminAccount = async function(){
  
}
module.exports.changePassword = async function (user_id, new_password) {
  let hashed_password = await bcrypt.hash(new_password, 10);
  accountDB.findByIdAndUpdate(user_id, hashed_password);
};
