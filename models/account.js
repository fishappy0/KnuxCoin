const local_utils = require("../local_utils.js");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { dbg } = require("../local_utils");
const accountDB = mongoose.model("Account", {
  user_id: Object,
  account_id: String,
  username: String,
  password: String,
  isAdmin: Boolean,
  first_time_login: Boolean,
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
    const isSamePassword = await
      bcrypt.compare(passphrase, returnedQuery["password"])
      ;
    if (isSamePassword) {
      return returnedQuery;
    } else {
      return null;
    }
  }
};

module.exports.createAccount = async function (account_id, phone, object_user_id) {

  let login_username = Math.round(Math.random() * 10000000000);

  // Tạo mật khẩu ngẫu nhiên dùng thư viện crypto và sau đó dùng bcrypt để hash
  let login_password = crypto.randomBytes(5).toString("hex");
  let hashed_password = await bcrypt.hash(
    login_password,
    await bcrypt.genSalt(10)
  );

  let credentials_arr = [login_username, login_password];
  const oneData = await new accountDB({
    user_id: object_user_id,
    account_id: account_id,
    username: login_username,
    password: hashed_password,
    isAdmin: false,
    first_time_login: true,
    phone_num: phone,
  });
  await oneData.save();
  console.log(`<KnuxCoin Web> Created account for ${login_username}`);
  return credentials_arr;
};
module.exports.addAdminAccount = async function () {
  const oneData = await new accountDB({
    account_id: '22A00001',
    username: 'admin',
    password: await bcrypt.hash('123456', await bcrypt.genSalt(10)),
    isAdmin: true,
    first_time_login: true,
    phone_num: 0921077950
  });
  await oneData.save()
  console.log(`Created admin account`);
}

module.exports.changePassword = async function (uname, new_password) {
  let hashed_password = await bcrypt.hash(new_password, 10);
  await accountDB.findOneAndUpdate({ username: uname }, { password: hashed_password, first_time_login: false });
};
