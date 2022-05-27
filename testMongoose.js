const mongoose = require("mongoose");
const testDB = mongoose.model('test_dbs',{
    username: String,
    password: String,
    serverKey: String
})

async function verifyAccount(uname, passphrase, sKey){
    const acc = await testDB.findOne({
        username: uname,
        password: passphrase,
        serverKey: sKey
    }).exec(); 
    return acc;
}

async function main(){
    let connection = await mongoose.connect("mongodb://0.0.0.0:27017/test-db")
    let q = await verifyAccount("fosheppy1", "bouytenktritwoone", "thisisakeylmao");
    console.log(q['username']);
    connection.disconnect()
}

main();

