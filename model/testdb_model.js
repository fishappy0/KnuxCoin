const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({});
const testDB = mongoose.model('test_db', {
    username: String,
    password: String,
    serverKey: String
})
// var functions = {};

module.exports.verifyAccount = function (uname, passphrase, sKey){
   if (testDB.findOne({username: uname, password: passphrase, serverKey: sKey}, (err, account) =>{
       if(err) throw err; 
   }) != null) return true;
   return false;
}

module.exports.createAccount = function (uname, passphrase, sKey){
    const oneData = new testDB({
        username:  uname,
        password: passphrase,
        serverKey: sKey
    });
    oneData.save().then(() => 
            console.log(`<KnuxCoin Web> Created account for ${uname}`)
    );
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