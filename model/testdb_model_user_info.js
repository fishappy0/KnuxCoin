const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({});
const testDB = mongoose.model('test_db_info', {
    userid: String,
    full_name: String,
    email: String,
    address: String,
    dob: String,
    id_sidea:{
        data: Buffer,
        contentType: String
    },
    id_sideb: {
        data: Buffer,
        contentType: String
    }
})
// var functions = {};

module.exports.createAccount = function (fName, mail, location, birth, id_up, id_down){
    const oneData = new testDB({
        full_name: fName,
        email: mail,
        address: location,
        dob: birth,
        id_sidea,
        id_sideb,
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