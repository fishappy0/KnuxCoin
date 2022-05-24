const local_utils = require('../local_utils.js')
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
    idcard: [{
        front: String,
        back: String,
    }],
    username: String, 
    password: String,
});
var User = mongoose.model('User', userSchema);//Tạo collection
module.exports = User;

const testDB = mongoose.model('test_dbs', {
    username: String,
    password: String,
    serverKey: String
})

module.exports.verifyAccount = async function (uname, passphrase) {
    let returnedQuery = await testDB.findOne({
        username: uname,
        password: passphrase
    });
    return returnedQuery;
}

module.exports.createAccount = async function (uname, passphrase, sKey) {
    const oneData = await new testDB({
        username: uname,
        password: passphrase,
        serverKey: sKey
    });
    await oneData.save();
    console.log(`<KnuxCoin Web> Created account for ${uname}`);
}


// [=] connect to the db [=]
// const mongoose = require('mongoose');
// const mongoUrl = "mongodb://0.0.0.0:27017/test-db";
// mongoose.connect(mongoUrl).then(()=>{console.log('connected')});

// [=] load table [=]
// const userSchema = new mongoose.Schema({});
// const cat = mongoose.model('cats', {
//     name: String
// });

// [=] write data to table [=]
// const oneData = new cat({
//     name: 'bede'
// });
// oneData.save().then(() => console.log('created'));

// [=] Find data in table [=]
// cat.findOne({name: 'kat'}, (err, Cat) =>{
//     if(err) throw err;
//     console.log(`cat name: ${Cat.name}`)
// })
// const
// const kitty = new Cat({
//     name: 'kat'
// });

// module.exports{
// }