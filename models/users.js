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
var User = mongoose.model('User', userSchema);//Tạo collection
module.exports = User;

